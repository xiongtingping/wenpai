/**
 * 一键转发管理页面
 * 支持多平台内容发布和管理
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Share2, 
  Send, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  Zap,
  Target,
  RefreshCw,
  Eye,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Smartphone,
  Monitor,
  Video,
  Users,
  TrendingUp,
  FileText,
  Image,
  Link2,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Save,
  Upload,
  Play,
  Pause
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';

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
  connected?: boolean;
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
 * 各平台内容发布页URL映射
 */
const platformPublishUrls: Record<string, string> = {
  weibo: 'https://weibo.com/newlogin?url=https://weibo.com/compose/repost',
  xiaohongshu: 'https://creator.xiaohongshu.com/publish',
  zhihu: 'https://www.zhihu.com/question/new',
  wechat: 'https://mp.weixin.qq.com/', // 公众号后台，需手动粘贴
  bilibili: 'https://member.bilibili.com/platform/upload/text',
  douyin: 'https://creator.douyin.com/creator-micro/content/upload',
  kuaishou: 'https://cp.kuaishou.com/article/publish',
  baijia: 'https://baijiahao.baidu.com/builder/rc/edit',
};

/**
 * 一键转发管理页面组件
 */
export default function ShareManagerPage() {
  const { toast } = useToast();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('publish');
  const [publishTasks, setPublishTasks] = useState<PublishTask[]>([]);
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  
  // 发布内容状态
  const [publishContent, setPublishContent] = useState({
    title: '',
    content: '',
    scheduledTime: '',
    useTemplate: false,
    images: [] as File[]
  });
  
  // 对话框状态
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isPlatformDialogOpen, setIsPlatformDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  
  // 平台配置
  const platforms: PlatformConfig[] = [
    {
      id: 'wechat',
      name: '微信公众号',
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-green-500',
      maxLength: 5000,
      features: ['富文本', '图片', '链接'],
      status: 'active',
      lastSync: new Date(),
      connected: true
    },
    {
      id: 'xiaohongshu',
      name: '小红书',
      icon: <Smartphone className="w-4 h-4" />,
      color: 'bg-red-500',
      maxLength: 1000,
      features: ['图片', '标签', '定位'],
      status: 'active',
      lastSync: new Date(),
      connected: true
    },
    {
      id: 'zhihu',
      name: '知乎',
      icon: <Monitor className="w-4 h-4" />,
      color: 'bg-blue-500',
      maxLength: 3000,
      features: ['专栏', '问答', '想法'],
      status: 'active',
      lastSync: new Date(),
      connected: true
    },
    {
      id: 'weibo',
      name: '新浪微博',
      icon: <Share2 className="w-4 h-4" />,
      color: 'bg-orange-500',
      maxLength: 2000,
      features: ['话题', '图片', '@用户'],
      status: 'active',
      lastSync: new Date(),
      connected: true
    },
    {
      id: 'douyin',
      name: '抖音',
      icon: <Video className="w-4 h-4" />,
      color: 'bg-black',
      maxLength: 100,
      features: ['视频', '话题', '音乐'],
      status: 'inactive',
      connected: false
    },
    {
      id: 'bilibili',
      name: 'B站',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-pink-500',
      maxLength: 500,
      features: ['视频', '专栏', '动态'],
      status: 'active',
      lastSync: new Date(),
      connected: true
    },
    {
      id: 'kuaishou',
      name: '快手',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-yellow-500',
      maxLength: 200,
      features: ['视频', '直播', '话题'],
      status: 'inactive',
      connected: false
    },
    {
      id: 'baijia',
      name: '百家号',
      icon: <Globe className="w-4 h-4" />,
      color: 'bg-blue-600',
      maxLength: 4000,
      features: ['文章', '图片', 'SEO'],
      status: 'inactive',
      connected: false
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
    setPublishProgress(0);

    try {
      // 创建发布任务
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
      const totalPlatforms = selectedPlatforms.length;
      let completedPlatforms = 0;

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

        completedPlatforms++;
        setPublishProgress((completedPlatforms / totalPlatforms) * 100);
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
        useTemplate: false,
        images: []
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
      setPublishProgress(0);
    }
  };

  /**
   * 一键发布：自动复制内容并跳转到平台
   */
  const handleQuickPublish = async () => {
    if (!publishContent.content.trim()) {
      toast({
        title: "内容不能为空",
        description: "请先填写要发布的内容",
        variant: "destructive",
      });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({
        title: "请选择平台",
        description: "请至少选择一个平台",
        variant: "destructive",
      });
      return;
    }
    // 复制内容到剪贴板
    try {
      await navigator.clipboard.writeText(publishContent.content);
    } catch {
      toast({
        title: "复制失败",
        description: "请手动复制内容",
        variant: "destructive",
      });
      return;
    }
    // 跳转到第一个平台的发布页
    const firstPlatform = selectedPlatforms[0];
    const url = platformPublishUrls[firstPlatform];
    if (url) {
      window.open(url, '_blank');
      toast({
        title: "内容已复制",
        description: "请在新页面粘贴内容并发布",
      });
    } else {
      toast({
        title: "暂不支持自动跳转",
        description: "请手动前往平台发布内容",
      });
    }
  };

  /**
   * 使用模板
   */
  const useTemplate = (template: ContentTemplate) => {
    setPublishContent({
      title: template.title,
      content: template.content,
      scheduledTime: '',
      useTemplate: true,
      images: []
    });
    setSelectedPlatforms(template.platforms);
    setActiveTab('publish');
    setIsTemplateDialogOpen(false);
    
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * 获取任务状态颜色
   */
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'publishing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="一键转发管理"
        description="多平台内容发布和管理"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlatformDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              平台设置
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              已上线
            </Badge>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* 标签页导航 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="publish">发布内容</TabsTrigger>
            <TabsTrigger value="history">发布历史</TabsTrigger>
            <TabsTrigger value="templates">内容模板</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
          </TabsList>

          {/* 发布内容标签页 */}
          <TabsContent value="publish" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 内容编辑 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    内容编辑
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

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="useTemplate" 
                      checked={publishContent.useTemplate}
                      onCheckedChange={(checked) => setPublishContent(prev => ({ ...prev, useTemplate: !!checked }))}
                    />
                    <Label htmlFor="useTemplate">使用内容模板</Label>
                  </div>

                  {publishContent.useTemplate && (
                    <Button
                      variant="outline"
                      onClick={() => setIsTemplateDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      选择模板
                    </Button>
                  )}

                  <Button
                    onClick={handleQuickPublish}
                    disabled={isPublishing}
                    className="w-full"
                    size="lg"
                    variant="secondary"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    一键发布（自动复制并跳转）
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-full"
                    size="lg"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        发布中... {Math.round(publishProgress)}%
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        一键发布（模拟API）
                      </>
                    )}
                  </Button>

                  {isPublishing && (
                    <Progress value={publishProgress} className="w-full" />
                  )}
                </CardContent>
              </Card>

              {/* 平台选择 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    选择平台
                  </CardTitle>
                  <CardDescription>
                    选择要发布的目标平台
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                      <div
                        key={platform.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!platform.connected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => platform.connected && togglePlatform(platform.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded ${platform.color} text-white`}>
                              {platform.icon}
                            </div>
                            <div>
                              <div className="font-medium">{platform.name}</div>
                              <div className="text-sm text-gray-500">
                                最多 {platform.maxLength} 字符
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedPlatforms.includes(platform.id) && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                            {!platform.connected && (
                              <Badge variant="outline" className="text-xs">
                                未连接
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {platform.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 发布历史标签页 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  发布历史
                </CardTitle>
              </CardHeader>
              <CardContent>
                {publishTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">暂无发布记录</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {publishTasks.map((task) => (
                      <Card key={task.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-gray-900">{task.title}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={getTaskStatusColor(task.status)}
                                >
                                  {task.status === 'completed' ? '已完成' : 
                                   task.status === 'publishing' ? '发布中' : 
                                   task.status === 'failed' ? '失败' : '待发布'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {task.content}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {task.platforms.map(platformId => {
                                  const platform = platforms.find(p => p.id === platformId);
                                  const result = task.results[platformId];
                                  
                                  return platform ? (
                                    <div key={platformId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                      <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded ${platform.color} text-white`}>
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
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 内容模板标签页 */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    内容模板
                  </CardTitle>
                  <Button onClick={() => setIsTemplateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    创建模板
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contentTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">暂无内容模板</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contentTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium text-gray-900">{template.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              使用 {template.useCount} 次
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {template.title}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              创建于 {template.createdAt.toLocaleDateString()}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => useTemplate(template)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              使用模板
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据分析标签页 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">总发布数</p>
                      <p className="text-2xl font-bold text-gray-900">{publishTasks.length}</p>
                    </div>
                    <Send className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">成功发布</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {publishTasks.filter(t => t.status === 'completed').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">成功率</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {publishTasks.length > 0 
                          ? Math.round((publishTasks.filter(t => t.status === 'completed').length / publishTasks.length) * 100)
                          : 0}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">模板数量</p>
                      <p className="text-2xl font-bold text-gray-900">{contentTemplates.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 模板选择对话框 */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>选择内容模板</DialogTitle>
              <DialogDescription>
                选择一个模板来快速创建发布内容
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {contentTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        使用 {template.useCount} 次
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.title}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => useTemplate(template)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      使用此模板
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* 平台设置对话框 */}
        <Dialog open={isPlatformDialogOpen} onOpenChange={setIsPlatformDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>平台设置</DialogTitle>
              <DialogDescription>
                管理各平台的连接状态和配置
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {platforms.map((platform) => (
                <Card key={platform.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${platform.color} text-white`}>
                          {platform.icon}
                        </div>
                        <div>
                          <div className="font-medium">{platform.name}</div>
                          <div className="text-sm text-gray-500">
                            {platform.connected ? '已连接' : '未连接'}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={platform.connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
                      >
                        {platform.connected ? '已连接' : '未连接'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {platform.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button
                      variant={platform.connected ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      disabled={platform.connected}
                    >
                      {platform.connected ? '已连接' : '连接平台'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 