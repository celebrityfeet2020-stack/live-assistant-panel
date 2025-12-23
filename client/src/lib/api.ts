import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = {
  async login(username: string, password: string) {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    
    const res = await fetch(`${API_BASE_URL}/api/token`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  async getConfig() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    return res.json();
  },

  async saveConfig(configs: any[]) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/config`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(configs),
    });
    if (!res.ok) throw new Error("Save failed");
    return res.json();
  },

  async getStats() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  
  async getHistoryLogs() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/logs/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async getAudits() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/audits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
};

export const getWsUrl = (userId: number) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_HOST || "localhost:8000";
    return `${protocol}//${host}/ws/admin/${userId}`;
}
