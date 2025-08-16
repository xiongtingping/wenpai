/**
 * 一键转发管理组件
 * 支持内容批量分发到多个社交媒体平台
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  Share2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  Copy,
  ExternalLink,
  Settings,
  Calendar,
  Users,
  TrendingUp,
  Zap,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 平台配置接口
 */
interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  maxLength: number;
  features: string[];
  status: 'active' | 'inactive' | 'error';
  lastSync?: Date;
}

/**
 * 发布任务接口
 */
interface PublishTask {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  status: 'pending' | 'publishing' | 'completed' | 'failed';
  scheduledTime?: Date;
  createdAt: Date;
  results: {
    [platformId: string]: {
      status: 'success' | 'failed' | 'pending';
      url?: string;
      error?: string;
      publishedAt?: Date;
    };
  };
}

/**
 * 内容模板接口
 */
interface ContentTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  platforms: string[];
  tags: string[];
  useCount: number;
  createdAt: Date;
}

/**
 * 一键转发管理组件
 */
const ShareManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('publish');
  const [publishTasks, setPublishTasks] = useState<PublishTask[]>([]);
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishContent, setPublishContent] = useState({
    title: '',
    content: '',
    scheduledTime: '',
    useTemplate: false
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);

  const { toast } = useToast();

  // 平台配置
  const platforms: PlatformConfig[] = [
    {
      id: 'wechat',
      name: '微信公众号',
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-accent',
      maxLength: 5000,
      features: ['富文本', '图片', '链接'],
      status: 'active',
      lastSync: new Date()
    },
    {
      id: 'xiaohongshu',
      name: '小红书',
      icon: <Smartphone className="w-4 h-4" />,
      color: 'bg-destructive',
      maxLength: 1000,
      features: ['图片', '标签', '定位'],
      status: 'active',
      lastSync: new Date()
    },
    {
      id: 'zhihu',
      name: '知乎',
      icon: <Monitor className="w-4 h-4" />,
      color: 'bg-primary',
      maxLength: 3000,
      features: ['专栏', '问答', '想法'],
      status: 'active',
      lastSync: new Date()
    },
    {
      id: 'weibo',
      name: '新浪微博',
      icon: <Share2 className="w-4 h-4" />,
      color: 'bg-accent',
      maxLength: 2000,
      features: ['话题', '图片', '@用户'],
      status: 'active',
      lastSync: new Date()
    },
    {
      id: 'douyin',
      name: '抖音',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-foreground',
      maxLength: 100,
      features: ['视频', '话题', '音乐'],
      status: 'inactive'
    },
    {
      id: 'bilibili',
      name: 'B站',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-primary',
      maxLength: 500,
      features: ['视频', '专栏', '动态'],
      status: 'active',
      lastSync: new Date()
    },
    {
      id: 'kuaishou',
      name: '快手',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-accent',
      maxLength: 200,
      features: ['视频', '直播', '话题'],
      status: 'inactive'
    },
    {
      id: 'baijia',
      name: '百家号',
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-primary',
      maxLength: 4000,
      features: ['文章', '图片', 'SEO'],
      status: 'inactive'
    }
  ];

  /**
   * 初始化示例数据
   */
  useEffect(() => {
    const sampleTasks: PublishTask[] = [
      {
        id: '1',
        title: '春季营销策略分享',
        content: '随着春天的到来，各大品牌都在调整营销策略...',
        platforms: ['wechat', 'xiaohongshu', 'zhihu'],
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        results: {
          wechat: { status: 'success', url: 'https://mp.weixin.qq.com/s/abc123', publishedAt: new Date() },
          xiaohongshu: { status: 'success', url: 'https://www.xiaohongshu.com/discovery/item/abc123', publishedAt: new Date() },
          zhihu: { status: 'failed', error: '内容审核未通过' }
        }
      },
      {
        id: '2',
        title: 'AI工具使用技巧',
        content: '分享一些实用的AI工具使用技巧，提高工作效率...',
        platforms: ['zhihu', 'weibo', 'bilibili'],
        status: 'publishing',
        createdAt: new Date('2024-01-14'),
        results: {
          zhihu: { status: 'success', url: 'https://zhuanlan.zhihu.com/p/abc123', publishedAt: new Date() },
          weibo: { status: 'pending' },
          bilibili: { status: 'pending' }
        }
      }
    ];

    const sampleTemplates: ContentTemplate[] = [
      {
        id: '1',
        name: '产品发布模板',
        title: '🎉 重磅发布！{产品名称}正式上线',
        content: '经过团队的精心打磨，{产品名称}终于和大家见面了！\n\n✨ 核心功能：\n{功能列表}\n\n🎯 适用场景：\n{场景描述}\n\n立即体验：{产品链接}',
        platforms: ['wechat', 'xiaohongshu', 'zhihu'],
        tags: ['产品', '发布', '营销'],
        useCount: 15,
        createdAt: new Date('2024-01-10')
      },
      {
        id: '2',
        name: '节日祝福模板',
        title: '🎊 {节日名称}快乐！',
        content: '在这个特殊的日子里，{品牌名称}向所有朋友送上最真挚的祝福！\n\n🌟 愿你：\n{祝福内容}\n\n感谢一路以来的支持与陪伴！',
        platforms: ['wechat', 'weibo', 'xiaohongshu'],
        tags: ['节日', '祝福', '品牌'],
        useCount: 8,
        createdAt: new Date('2024-01-08')
      }
    ];

    setPublishTasks(sampleTasks);
    setContentTemplates(sampleTemplates);
  }, []);

  /**
   * 切换平台选择
   */
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  /**
   * 发布内容
   */
  const handlePublish = async () => {
    if (!publishContent.title.trim() || !publishContent.content.trim()) {
      toast({
        title: "请填写完整内容",
        description: "标题和内容不能为空",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "请选择发布平台",
        description: "至少选择一个平台进行发布",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      // 模拟发布过程
      const newTask: PublishTask = {
        id: Date.now().toString(),
        title: publishContent.title,
        content: publishContent.content,
        platforms: selectedPlatforms,
        status: 'publishing',
        scheduledTime: publishContent.scheduledTime ? new Date(publishContent.scheduledTime) : undefined,
        createdAt: new Date(),
        results: {}
      };

      // 初始化结果状态
      selectedPlatforms.forEach(platformId => {
        newTask.results[platformId] = { status: 'pending' };
      });

      setPublishTasks(prev => [newTask, ...prev]);

      // 模拟发布到各平台
      for (const platformId of selectedPlatforms) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 随机成功或失败
        const success = Math.random() > 0.2; // 80%成功率
        
        setPublishTasks(prev => prev.map(task => {
          if (task.id === newTask.id) {
            return {
              ...task,
              results: {
                ...task.results,
                [platformId]: success
                  ? {
                      status: 'success',
                      url: `https://example.com/${platformId}/${Date.now()}`,
                      publishedAt: new Date()
                    }
                  : {
                      status: 'failed',
                      error: '发布失败，请稍后重试'
                    }
              }
            };
          }
          return task;
        }));
      }

      // 更新任务状态
      setPublishTasks(prev => prev.map(task => {
        if (task.id === newTask.id) {
          const allResults = Object.values(task.results);
          const hasFailure = allResults.some(result => result.status === 'failed');
          const allCompleted = allResults.every(result => result.status !== 'pending');
          
          return {
            ...task,
            status: allCompleted ? (hasFailure ? 'failed' : 'completed') : 'publishing'
          };
        }
        return task;
      }));

      toast({
        title: "发布完成",
        description: `内容已发布到 ${selectedPlatforms.length} 个平台`,
      });

      // 清空表单
      setPublishContent({
        title: '',
        content: '',
        scheduledTime: '',
        useTemplate: false
      });
      setSelectedPlatforms([]);
      setActiveTab('history');

    } catch (error) {
      toast({
        title: "发布失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * 使用模板（重命名避免触发 Hooks 规则）
   */
  const applyTemplate = (template: ContentTemplate) => {
    setPublishContent({
      title: template.title,
      content: template.content,
      scheduledTime: '',
      useTemplate: true
    });
    setSelectedPlatforms(template.platforms);
    setActiveTab('publish');
    
    // 更新使用次数
    setContentTemplates(prev => prev.map(t =>
      t.id === template.id
        ? { ...t, useCount: t.useCount + 1 }
        : t
    ));
  };

  /**
   * 获取平台状态图标
   */
  const getPlatformStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-foreground" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-foreground" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-accent rounded-lg shadow-sm mb-2">
          <TabsTrigger
            value="publish"
            className={activeTab === 'publish' ? 'font-bold text-primary shadow-md bg-card' : 'text-muted-foreground'}
          >
            发布内容
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={activeTab === 'history' ? 'font-bold text-primary shadow-md bg-card' : 'text-muted-foreground'}
          >
            发布历史
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className={activeTab === 'templates' ? 'font-bold text-primary shadow-md bg-card' : 'text-muted-foreground'}
          >
            内容模板
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className={activeTab === 'settings' ? 'font-bold text-primary shadow-md bg-card' : 'text-muted-foreground'}
          >
            平台设置
          </TabsTrigger>
        </TabsList>

        {/* 发布内容标签页 */}
        <TabsContent value="publish" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 内容编辑 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    <span>内容编辑</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    多平台
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    placeholder="输入内容标题..."
                    value={publishContent.title}
                    onChange={(e) => setPublishContent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="content">内容</Label>
                  <Textarea
                    id="content"
                    placeholder="输入要发布的内容..."
                    value={publishContent.content}
                    onChange={(e) => setPublishContent(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {publishContent.content.length} 字符
                  </div>
                </div>

                <div>
                  <Label htmlFor="scheduledTime">定时发布（可选）</Label>
                  <Input
                    id="scheduledTime"
                    type="datetime-local"
                    value={publishContent.scheduledTime}
                    onChange={(e) => setPublishContent(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>

                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full"
                  size="lg"
                >
                  {isPublishing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      发布中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      一键发布
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 平台选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    <span>选择平台</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    批量发布
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {platforms.map(platform => (
                    <div
                      key={platform.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-primary bg-accent'
                          : 'border-border hover:border-border'
                      } ${platform.status === 'inactive' ? 'opacity-50' : ''}`}
                      onClick={() => platform.status === 'active' && togglePlatform(platform.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedPlatforms.includes(platform.id)}
                            disabled={platform.status !== 'active'}
                          />
                          <div className={`p-2 rounded-md ${platform.color} text-primary-foreground`}>
                            {platform.icon}
                          </div>
                          <div>
                            <div className="font-medium">{platform.name}</div>
                            <div className="text-sm text-muted-foreground">
                              最大 {platform.maxLength} 字符
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {platform.status === 'active' && (
                            <Badge variant="outline" className="text-foreground">
                              已连接
                            </Badge>
                          )}
                          {platform.status === 'inactive' && (
                            <Badge variant="outline" className="text-muted-foreground">
                              未连接
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex flex-wrap gap-1">
                            {platform.features.map(feature => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 发布历史标签页 */}
        <TabsContent value="history" className="space-y-4">
          {publishTasks.map(task => (
            <Card key={task.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {task.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={task.status === 'completed' ? 'default' : 
                               task.status === 'failed' ? 'destructive' : 'secondary'}
                    >
                      {task.status === 'completed' && '已完成'}
                      {task.status === 'failed' && '失败'}
                      {task.status === 'publishing' && '发布中'}
                      {task.status === 'pending' && '待发布'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {task.platforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    const result = task.results[platformId];
                    
                    return platform ? (
                      <div key={platformId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${platform.color} text-primary-foreground`}>
                            {platform.icon}
                          </div>
                          <span className="text-sm font-medium">{platform.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {result && getPlatformStatusIcon(result.status)}
                          {result?.url && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                              <a href={result.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    发布时间：{task.createdAt.toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      查看详情
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      复制内容
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 内容模板标签页 */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentTemplates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium text-sm mb-2">标题模板：</div>
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {template.title}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-sm mb-2">内容模板：</div>
                    <div className="text-sm text-muted-foreground bg-muted p-2 rounded line-clamp-3">
                      {template.content}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      使用 {template.useCount} 次
                    </div>
                    <Button onClick={() => applyTemplate(template)} size="sm">
                      使用模板
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 平台设置标签页 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                平台连接状态
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platforms.map(platform => (
                  <div key={platform.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${platform.color} text-primary-foreground`}>
                        {platform.icon}
                      </div>
                      <div>
                        <div className="font-medium">{platform.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {platform.status === 'active' && platform.lastSync && 
                            `最后同步：${platform.lastSync.toLocaleString()}`}
                          {platform.status === 'inactive' && '未连接'}
                          {platform.status === 'error' && '连接错误'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={platform.status === 'active' ? 'default' : 
                                platform.status === 'error' ? 'destructive' : 'secondary'}
                      >
                        {platform.status === 'active' && '已连接'}
                        {platform.status === 'inactive' && '未连接'}
                        {platform.status === 'error' && '连接错误'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {platform.status === 'active' ? '重新连接' : '连接'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShareManager; 