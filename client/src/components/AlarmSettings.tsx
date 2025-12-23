import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Settings } from "lucide-react";
import { toast } from "sonner";

export default function AlarmSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    no_recognition_threshold: 300,
    email_notification: false,
    email_address: ""
  });

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const data = await api.getAlarmConfig();
      setConfig(data);
    } catch (error) {
      console.error("Failed to load alarm config");
    }
  };

  const handleSave = async () => {
    try {
      await api.updateAlarmConfig(config);
      toast.success("告警配置已保存");
      setIsOpen(false);
    } catch (error) {
      toast.error("保存失败");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="ml-2 text-muted-foreground hover:text-primary" title="告警设置">
          <Bell className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10">
        <DialogHeader>
          <DialogTitle>告警配置</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>无识别结果超时报警 (秒)</Label>
            <Input 
              type="number"
              value={config.no_recognition_threshold}
              onChange={(e) => setConfig({...config, no_recognition_threshold: parseInt(e.target.value) || 0})}
            />
            <p className="text-xs text-muted-foreground">如果超过此时长未识别到任何语音，将触发告警。</p>
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-notify" className="flex flex-col space-y-1">
              <span>邮件通知</span>
              <span className="font-normal text-xs text-muted-foreground">触发告警时发送邮件</span>
            </Label>
            <Switch
              id="email-notify"
              checked={config.email_notification}
              onCheckedChange={(checked) => setConfig({...config, email_notification: checked})}
            />
          </div>

          {config.email_notification && (
            <div className="space-y-2">
              <Label>接收邮箱地址</Label>
              <Input 
                value={config.email_address || ""}
                onChange={(e) => setConfig({...config, email_address: e.target.value})}
                placeholder="admin@example.com"
              />
            </div>
          )}

          <Button onClick={handleSave} className="w-full">保存配置</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
