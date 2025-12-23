import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Plus, Save, Server, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// 定义配置项接口
interface LinkConfig {
  id: number;
  keywords: string[];
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

  // 模拟从后端加载配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // TODO: 替换为真实的 API 调用
        // const res = await fetch('/api/config');
        // const data = await res.json();
        // setConfigs(data);
        setIsConnected(true);
        toast.success("已连接到 ASR 服务");
      } catch (error) {
        console.error("Failed to fetch config:", error);
        toast.error("无法连接到 ASR 服务");
        setIsConnected(false);
      }
    };

    fetchConfig();
  }, []);

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
            
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all"
            >
              {isSaving ? (
                <Activity className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "保存中..." : "保存配置"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container relative z-10 py-8">
        <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            <AnimatePresence mode="popLayout">
              {configs.map((config) => (
                <motion.div
                  key={config.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full border-white/5 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        链接 #{config.id}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveLink(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                          <AnimatePresence>
                            {config.keywords.map((keyword) => (
                              <motion.div
                                key={keyword}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20"
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
                          {config.keywords.length === 0 && (
                            <span className="text-xs text-muted-foreground/50 italic py-1">
                              暂无触发词...
                            </span>
                          )}
                        </div>
                        
                        <Separator className="bg-white/5" />
                        
                        <div className="relative">
                          <Input
                            placeholder="输入触发词，回车添加"
                            value={inputValue[config.id] || ""}
                            onChange={(e) => setInputValue({ ...inputValue, [config.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddKeyword(config.id, inputValue[config.id] || "");
                              }
                            }}
                            className="bg-secondary/50 border-white/5 focus-visible:ring-primary/30 text-sm"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 pointer-events-none">
                            ↵ Enter
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {/* 添加按钮卡片 */}
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={handleAddLink}
                  className="flex h-full w-full min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground hover:border-primary/30 group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">添加新链接配置</span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
