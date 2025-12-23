from database import engine, SessionLocal, Base
from models import User
from auth import get_password_hash

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 检查是否已存在管理员
    user = db.query(User).filter(User.username == "admin").first()
    if not user:
        print("Creating default admin user...")
        admin_user = User(
            username="admin",
            hashed_password=get_password_hash("admin123") # 默认密码
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created. Username: admin, Password: admin123")
    else:
        print("Admin user already exists.")
    
    db.close()

if __name__ == "__main__":
    init_db()
