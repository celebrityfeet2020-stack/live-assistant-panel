import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Users as UsersIcon, ArrowLeft, Trash2, Plus, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", is_superuser: false });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("加载用户列表失败，可能权限不足");
      setLocation("/");
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.createUser(newUser);
      toast.success("用户创建成功");
      setIsDialogOpen(false);
      setNewUser({ username: "", password: "", is_superuser: false });
      loadUsers();
    } catch (error) {
      toast.error("创建用户失败");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("确定要删除该用户吗？")) return;
    try {
      await api.deleteUser(id);
      toast.success("用户已删除");
      loadUsers();
    } catch (error) {
      toast.error("删除用户失败");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <UsersIcon className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">用户管理</h1>
                </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        新增用户
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10">
                    <DialogHeader>
                        <DialogTitle>新增用户</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>用户名</Label>
                            <Input 
                                value={newUser.username}
                                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>密码</Label>
                            <Input 
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="superuser" 
                                checked={newUser.is_superuser}
                                onCheckedChange={(checked) => setNewUser({...newUser, is_superuser: checked as boolean})}
                            />
                            <Label htmlFor="superuser">超级管理员</Label>
                        </div>
                        <Button onClick={handleCreateUser} className="w-full">创建</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardHeader>
                <CardTitle>系统用户列表</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-white/5 border-white/10">
                            <TableHead>ID</TableHead>
                            <TableHead>用户名</TableHead>
                            <TableHead>角色</TableHead>
                            <TableHead>状态</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-white/5 border-white/10">
                                <TableCell className="font-mono text-xs text-muted-foreground">#{user.id}</TableCell>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>
                                    {user.is_superuser ? (
                                        <span className="flex items-center gap-1 text-amber-400 text-xs">
                                            <Shield className="h-3 w-3" /> 超级管理员
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">普通用户</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${user.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {user.is_active ? '正常' : '禁用'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={user.username === 'admin'} // 禁止删除默认管理员
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
