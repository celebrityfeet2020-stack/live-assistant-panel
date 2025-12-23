import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import json
import asyncio
import logging
from typing import List, Dict
from datetime import datetime, timedelta

from database import engine, SessionLocal, Base
from models import User, Config, Log, Audit
from auth import get_current_user, create_access_token, authenticate_user, get_password_hash
from schemas import Token, UserLogin, ConfigUpdate, LogQuery

# 初始化日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Live Assistant API")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 依赖项：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 全局连接管理器
class ConnectionManager:
    def __init__(self):
        # 插件连接: {user_id: [WebSocket]}
        self.plugin_connections: Dict[int, List[WebSocket]] = {}
        # 管理端连接: {user_id: [WebSocket]}
        self.admin_connections: Dict[int, List[WebSocket]] = {}
        # FunASR连接地址
        self.funasr_url = "ws://10.98.98.5:10095"

    async def connect_plugin(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.plugin_connections:
            self.plugin_connections[user_id] = []
        self.plugin_connections[user_id].append(websocket)
        logger.info(f"Plugin connected for user {user_id}")

    def disconnect_plugin(self, websocket: WebSocket, user_id: int):
        if user_id in self.plugin_connections:
            if websocket in self.plugin_connections[user_id]:
                self.plugin_connections[user_id].remove(websocket)
            if not self.plugin_connections[user_id]:
                del self.plugin_connections[user_id]
        logger.info(f"Plugin disconnected for user {user_id}")

    async def connect_admin(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.admin_connections:
            self.admin_connections[user_id] = []
        self.admin_connections[user_id].append(websocket)
        logger.info(f"Admin connected for user {user_id}")

    def disconnect_admin(self, websocket: WebSocket, user_id: int):
        if user_id in self.admin_connections:
            if websocket in self.admin_connections[user_id]:
                self.admin_connections[user_id].remove(websocket)
            if not self.admin_connections[user_id]:
                del self.admin_connections[user_id]
        logger.info(f"Admin disconnected for user {user_id}")

    async def broadcast_log(self, user_id: int, log_data: dict):
        """向用户的管理端广播日志"""
        if user_id in self.admin_connections:
            for connection in self.admin_connections[user_id]:
                try:
                    await connection.send_json(log_data)
                except Exception as e:
                    logger.error(f"Failed to send log to admin: {e}")

manager = ConnectionManager()

# --- 认证接口 ---

@app.post("/api/token", response_model=Token)
async def login_for_access_token(form_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=3000) # 长效Token方便演示
    access_token = create_access_token(
        data={"sub": user.username, "id": user.id}, expires_delta=access_token_expires
    )
    
    # 记录审计日志
    audit = Audit(user_id=user.id, action="login", details="User logged in", ip_address="unknown")
    db.add(audit)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- 配置管理接口 ---

@app.get("/api/config")
async def get_config(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    configs = db.query(Config).filter(Config.user_id == current_user.id).all()
    return [{"id": c.link_id, "keywords": json.loads(c.keywords)} for c in configs]

@app.post("/api/config")
async def update_config(configs: List[ConfigUpdate], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 清除旧配置
    db.query(Config).filter(Config.user_id == current_user.id).delete()
    
    # 添加新配置
    for c in configs:
        new_config = Config(user_id=current_user.id, link_id=c.id, keywords=json.dumps(c.keywords))
        db.add(new_config)
    
    # 记录审计日志
    audit = Audit(user_id=current_user.id, action="update_config", details=f"Updated {len(configs)} links", ip_address="unknown")
    db.add(audit)
    
    db.commit()
    return {"status": "success"}

# --- 日志查询接口 ---

@app.get("/api/logs/history")
async def get_history_logs(limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(Log).filter(Log.user_id == current_user.id).order_by(Log.timestamp.desc()).limit(limit).all()
    return logs

@app.get("/api/stats")
async def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 简单统计：今日触发次数
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    trigger_count = db.query(Log).filter(
        Log.user_id == current_user.id, 
        Log.type == "success",
        Log.timestamp >= today_start
    ).count()
    
    return {"today_triggers": trigger_count}

@app.get("/api/audits")
async def get_audits(limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audits = db.query(Audit).filter(Audit.user_id == current_user.id).order_by(Audit.timestamp.desc()).limit(limit).all()
    return audits

# --- WebSocket 核心逻辑 ---

@app.websocket("/ws/plugin/{user_id}")
async def websocket_plugin_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    # 验证用户是否存在（简单验证，实际应使用Token）
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=4001)
        return

    await manager.connect_plugin(websocket, user_id)
    
    # 获取用户配置
    configs = db.query(Config).filter(Config.user_id == user_id).all()
    keyword_map = {}
    for c in configs:
        keywords = json.loads(c.keywords)
        for k in keywords:
            keyword_map[k] = c.link_id

    try:
        # 连接到 FunASR
        import websockets
        async with websockets.connect(manager.funasr_url) as funasr_ws:
            logger.info(f"Connected to FunASR for user {user_id}")
            
            # 启动接收 FunASR 结果的任务
            async def receive_from_funasr():
                try:
                    async for message in funasr_ws:
                        data = json.loads(message)
                        text = data.get("text", "")
                        
                        if text:
                            # 记录识别日志
                            log_entry = {
                                "id": str(datetime.now().timestamp()),
                                "timestamp": datetime.now().strftime("%H:%M:%S"),
                                "type": "info",
                                "message": f"识别: {text}"
                            }
                            await manager.broadcast_log(user_id, log_entry)
                            
                            # 关键词匹配
                            for keyword, link_id in keyword_map.items():
                                if keyword in text:
                                    # 触发点击
                                    await websocket.send_json({"action": "click", "link_id": link_id})
                                    
                                    # 记录成功日志
                                    success_log = {
                                        "id": str(datetime.now().timestamp()),
                                        "timestamp": datetime.now().strftime("%H:%M:%S"),
                                        "type": "success",
                                        "message": f"触发: '{keyword}' -> 点击链接 #{link_id}"
                                    }
                                    await manager.broadcast_log(user_id, success_log)
                                    
                                    # 持久化日志
                                    db_log = Log(
                                        user_id=user_id,
                                        type="success",
                                        message=f"触发: '{keyword}' -> 点击链接 #{link_id}",
                                        details=json.dumps({"keyword": keyword, "text": text})
                                    )
                                    db.add(db_log)
                                    db.commit()
                                    break # 一次只触发一个
                except Exception as e:
                    logger.error(f"Error receiving from FunASR: {e}")

            funasr_task = asyncio.create_task(receive_from_funasr())

            # 主循环：接收插件音频数据转发给 FunASR
            while True:
                data = await websocket.receive_bytes()
                await funasr_ws.send(data)

    except WebSocketDisconnect:
        manager.disconnect_plugin(websocket, user_id)
    except Exception as e:
        logger.error(f"Plugin connection error: {e}")
        manager.disconnect_plugin(websocket, user_id)

@app.websocket("/ws/admin/{user_id}")
async def websocket_admin_endpoint(websocket: WebSocket, user_id: int):
    # 实际应验证 Token
    await manager.connect_admin(websocket, user_id)
    try:
        while True:
            await websocket.receive_text() # 保持连接
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket, user_id)

# 静态文件服务 (最后挂载)
app.mount("/", StaticFiles(directory="../client/dist", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
