import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  details: string;
  ip_address: string;
}

export default function Audit() {
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    api.getAudits().then(setAudits).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">操作审计日志</h1>
            </div>
        </div>

        <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader>
                <CardTitle>最近操作记录</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px]">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-white/5 border-white/10">
                                <TableHead>时间</TableHead>
                                <TableHead>操作类型</TableHead>
                                <TableHead>详情</TableHead>
                                <TableHead>IP地址</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {audits.map((log) => (
                                <TableRow key={log.id} className="hover:bg-white/5 border-white/10">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                            {log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell>{log.details}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
