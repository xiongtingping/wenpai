import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useNavigate } from "react-router-dom";

/**
 * 历史记录页面，展示所有历史生成内容，按平台分类，按日期降序排列
 * @returns JSX.Element
 */
export default function HistoryPage() {
  const [history, setHistory] = useState<Array<{ platformId: string; content: string; timestamp: string }>>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [activePlatform, setActivePlatform] = useState<string>("");
  const { isLoggedIn, userInfo } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 检查用户是否已登录
    if (!isLoggedIn) {
      navigate('/login-register');
      return;
    }

    // 从localStorage获取历史记录，只获取当前用户的数据
    const raw = localStorage.getItem(`history_${userInfo?.username || 'anonymous'}`);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch {
        // 忽略JSON解析错误
      }
    }
    // 按时间降序排列
    const list = [...history]; // Create a copy to avoid modifying state directly
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setHistory(list);
    // 提取所有平台
    const ps = Array.from(new Set(list.map(item => item.platformId)));
    setPlatforms(ps);
    setActivePlatform(ps[0] || "");
  }, [isLoggedIn, userInfo, navigate, history]); // Added history to dependencies

  // 按平台分类
  const getPlatformHistory = (platformId: string) =>
    history.filter(item => item.platformId === platformId);

  if (!isLoggedIn) {
    return null; // 如果未登录，不渲染内容（会被重定向）
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">历史记录</h1>
      {platforms.length === 0 ? (
        <p className="text-muted-foreground">暂无历史内容</p>
      ) : (
        <Tabs value={activePlatform} onValueChange={setActivePlatform}>
          <TabsList className="mb-6">
            {platforms.map(pid => (
              <TabsTrigger key={pid} value={pid}>
                {pid}
              </TabsTrigger>
            ))}
          </TabsList>
          {platforms.map(pid => (
            <TabsContent key={pid} value={pid}>
              <div className="space-y-6">
                {getPlatformHistory(pid).map(item => (
                  <Card key={item.timestamp + item.content} className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge>{pid}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
                      {item.content}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(item.content);
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />一键复制
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
} 