import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Plus, Save, Server, Trash2, X, Terminal, ChevronUp, ChevronDown, Download, Upload, LogOut, Link as LinkIcon, Copy, History } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 定义配置项接口
interface LinkConfig {
  id: number;
  keywords: string[];
}

// 日志接口
interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

// 默认配置：5个链接
const DEFAULT_CONFIG: LinkConfig[] = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  keywords: [],
}));

export default function Home() {
  const [configs, setConfigs] = useState<LinkConfig[]>(DEFAULT_CONFIG);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inputValue, setInputValue] = useState<{ [key: number]: string }>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [wsUrl, setWsUrl] = useState("ws://212.64.83.18:17822/ws/user_123"); // 模拟专属连接地址

  // 自动滚动日志
  useEffect(() => {
    if (isLogOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isLogOpen]);

  // 复制连接地址
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(wsUrl);
    toast.success("连接地址已复制");
  };

  // 模拟从后端加载配置和接收日志
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // TODO: 替换为真实的 API 调用
        setIsConnected(true);
        toast.success("已连接到 ASR 服务");
        
        // 模拟接收日志
        const interval = setInterval(() => {
          const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            type: Math.random() > 0.7 ? 'success' : 'info',
            message: Math.random() > 0.7 
              ? `识别到关键词: "链接 ${Math.floor(Math.random() * 5) + 1}" -> 触发点击` 
              : `接收到语音片段: ${Math.random().toString(36).substring(7)}...`
          };
          setLogs(prev => [...prev.slice(-99), newLog]);
        }, 3000);
        
        return () => clearInterval(interval);
      } catch (error) {
        console.error("Failed to fetch config:", error);
        toast.error("无法连接到 ASR 服务");
        setIsConnected(false);
      }
    };

    fetchConfig();
  }, []);

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem("token");
    setLocation("/login");
  };

  // 导出配置
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "live_assistant_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("配置已导出");
  };

  // 导入配置
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfigs = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedConfigs)) {
          setConfigs(importedConfigs);
          toast.success("配置已导入");
        } else {
          toast.error("无效的配置文件格式");
        }
      } catch (error) {
        toast.error("解析配置文件失败");
      }
    };
    reader.readAsText(file);
    // 清空 input value 以便重复导入同一文件
    event.target.value = '';
  };

  // 添加关键词
  const handleAddKeyword = (id: number, keyword: string) => {
    if (!keyword.trim()) return;
    
    setConfigs((prev) =>
      prev.map((config) => {
        if (config.id === id) {
          if (config.keywords.includes(keyword.trim())) {
            toast.warning("关键词已存在");
            return config;
          }
          return { ...config, keywords: [...config.keywords, keyword.trim()] };
        }
        return config;
      })
    );
    setInputValue((prev) => ({ ...prev, [id]: "" }));
  };

  // 删除关键词
  const handleRemoveKeyword = (id: number, keywordToRemove: string) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.id === id
          ? {
              ...config,
              keywords: config.keywords.filter((k) => k !== keywordToRemove),
            }
          : config
      )
    );
  };

  // 添加新链接
  const handleAddLink = () => {
    const newId = configs.length > 0 ? Math.max(...configs.map((c) => c.id)) + 1 : 1;
    setConfigs([...configs, { id: newId, keywords: [] }]);
    toast.info(`已添加链接 #${newId}`);
  };

  // 删除链接
  const handleRemoveLink = (id: number) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    toast.info(`已删除链接 #${id}`);
  };

  // 保存配置
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: 替换为真实的 API 调用
      // await fetch('/api/config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(configs),
      // });
      
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("配置已保存并生效");
    } catch (error) {
      console.error("Failed to save config:", error);
      toast.error("保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* 背景纹理 */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
              直播讲解助手 <span className="text-muted-foreground font-normal text-sm ml-2">控制面板</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-white/5">
              <Server className={cn("h-4 w-4", isConnected ? "text-emerald-500" : "text-rose-500")} />
              <span>{isConnected ? "服务在线" : "连接断开"}</span>
            </div>
            
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="获取插件连接地址">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
                  <DialogHeader>
                    <DialogTitle>插件连接配置</DialogTitle>
                    <DialogDescription>
                      请将以下地址填入 Chrome 插件的服务器地址栏中，以区分不同的直播间。
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center gap-2 mt-4 p-3 bg-secondary/50 rounded-lg border border-white/5">
                    <code className="flex-1 text-sm font-mono text-primary break-all">
                      {wsUrl}
                    </code>
                    <Button variant="ghost" size="icon" onClick={handleCopyUrl} className="h-8 w-8 shrink-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>说明：</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>每个账号拥有唯一的连接地址</li>
                      <li>支持多个直播间同时使用不同账号登录</li>
                      <li>请勿将此地址泄露给他人</li>
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="icon" onClick={handleExport} title="导出配置">
                <Download className="h-4 w-4" />
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="导入配置"
                />
                <Button variant="ghost" size="icon">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all ml-2"
            >
              {isSaving ? (
                <Activity className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "保存中..." : "保存配置"}
            </Button>

            <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-2 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container relative z-10 py-8 flex flex-col h-[calc(100vh-4rem)]">
        <ScrollArea className="flex-grow pr-4 mb-4">
          <div className="flex flex-col gap-4 pb-20 max-w-5xl mx-auto">
            <AnimatePresence mode="popLayout">
              {configs.map((config) => (
                <motion.div
                  key={config.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-white/5 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors group">
                    <div className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4">
                      {/* 序号 */}
                      <div className="flex-shrink-0 w-24 pt-2 md:pt-0">
                        <span className="text-sm font-medium text-muted-foreground">
                          链接 #{config.id}
                        </span>
                      </div>

                      {/* 关键词区域 */}
                      <div className="flex-grow flex flex-col gap-3 w-full">
                        <div className="flex flex-wrap gap-2 min-h-[2rem] items-center">
                          <AnimatePresence>
                            {config.keywords.map((keyword) => (
                              <motion.div
                                key={keyword}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/20"
                              >
                                {keyword}
                                <button
                                  onClick={() => handleRemoveKeyword(config.id, keyword)}
                                  className="ml-1 rounded-full p-0.5 hover:bg-primary/20 text-primary/70 hover:text-primary transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          {/* 输入框直接跟在标签后面 */}
                          <div className="relative min-w-[200px] flex-grow max-w-xs">
                            <Input
                              placeholder={config.keywords.length === 0 ? "输入触发词，回车添加..." : "继续添加..."}
                              value={inputValue[config.id] || ""}
                              onChange={(e) => setInputValue({ ...inputValue, [config.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddKeyword(config.id, inputValue[config.id] || "");
                                }
                              }}
                              className="h-8 bg-transparent border-transparent hover:border-white/10 focus:border-primary/30 focus:bg-secondary/30 transition-all text-sm px-2 shadow-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex-shrink-0 ml-auto pl-4 border-l border-white/5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveLink(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {/* 添加按钮 */}
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={handleAddLink}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground hover:border-primary/30 group"
                >
                  <Plus className="h-5 w-5 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium">添加新链接配置</span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* 实时日志面板 */}
        <div className={`border-t border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col ${isLogOpen ? 'h-80' : 'h-10'}`}>
          <div 
            className="flex items-center justify-between px-4 py-2 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setIsLogOpen(!isLogOpen)}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3 w-3" />
              <span>运行日志</span>
            </div>
            {isLogOpen ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronUp className="h-3 w-3 text-muted-foreground" />}
          </div>
          
          {isLogOpen && (
            <Tabs defaultValue="realtime" className="flex-grow flex flex-col">
              <div className="px-4 py-1 border-b border-white/5 flex items-center justify-between">
                <TabsList className="h-7 bg-transparent p-0 gap-4">
                  <TabsTrigger value="realtime" className="h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-xs">实时监控</TabsTrigger>
                  <TabsTrigger value="history" className="h-7 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-xs">历史记录</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="realtime" className="flex-grow p-0 m-0 overflow-hidden">
                <ScrollArea className="h-full p-4 font-mono text-xs">
                  <div className="space-y-1">
                    {logs.length === 0 && (
                      <div className="text-muted-foreground/50 italic">等待日志数据...</div>
                    )}
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-2">
                        <span className="text-muted-foreground/50">[{log.timestamp}]</span>
                        <span className={cn(
                          log.type === 'success' ? 'text-emerald-400' : 
                          log.type === 'error' ? 'text-rose-400' : 
                          log.type === 'warning' ? 'text-amber-400' : 
                          'text-blue-300'
                        )}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="history" className="flex-grow p-0 m-0 overflow-hidden">
                <div className="h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                  <div className="text-center space-y-2">
                    <History className="h-8 w-8 mx-auto opacity-50" />
                    <p>历史日志查询功能将在连接数据库后启用</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}
