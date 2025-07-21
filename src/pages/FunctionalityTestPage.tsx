/**
 * 功能测试页面
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermission } from '@/hooks/usePermission';
import { useAuthStore } from '@/store/authStore';
import { EnvChecker } from '@/utils/envChecker';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  User,
  Shield,
  Crown,
  Star,
  Zap,
  Settings,
  Database,
  Globe,
  Smartphone,
  Monitor,
  TestTube,
  AlertCircle,
  Sparkles,
  FileText
} from 'lucide-react';

const FunctionalityTestPage: React.FC = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const { getUsageRemaining, decrementUsage, incrementUsage } = useAuthStore();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // 权限检查
  const authPermission = usePermission('auth:required');
  const vipPermission = usePermission('vip:required');
  const creativeStudioPermission = usePermission('feature:creative-studio');
  const brandLibraryPermission = usePermission('feature:brand-library');
  const contentExtractorPermission = usePermission('feature:content-extractor');

  // 测试功能列表
  const testFeatures = [
    {
      name: '用户认证',
      description: '检查用户登录状态和认证功能',
      icon: <User className="h-5 w-5" />,
      permission: authPermission,
      test: () => isAuthenticated
    },
    {
      name: 'VIP权限',
      description: '检查VIP用户权限和功能',
      icon: <Crown className="h-5 w-5" />,
      permission: vipPermission,
      test: () => vipPermission.pass
    },
    {
      name: '创意魔方',
      description: '检查创意魔方功能权限',
      icon: <Sparkles className="h-5 w-5" />,
      permission: creativeStudioPermission,
      test: () => creativeStudioPermission.pass
    },
    {
      name: '品牌库',
      description: '检查品牌库功能权限',
      icon: <Database className="h-5 w-5" />,
      permission: brandLibraryPermission,
      test: () => brandLibraryPermission.pass
    },
    {
      name: '内容提取器',
      description: '检查内容提取器功能权限',
      icon: <FileText className="h-5 w-5" />,
      permission: contentExtractorPermission,
      test: () => contentExtractorPermission.pass
    }
  ];

  // 运行测试
  const runTests = () => {
    const results: Record<string, boolean> = {};
    
    testFeatures.forEach(feature => {
      try {
        results[feature.name] = feature.test();
      } catch (error) {
        console.error(`测试 ${feature.name} 失败:`, error);
        results[feature.name] = false;
      }
    });
    
    setTestResults(results);
    
    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    toast({
      title: "测试完成",
      description: `通过 ${passedCount}/${totalCount} 项测试`,
      variant: passedCount === totalCount ? "default" : "destructive"
    });
  };

  // 测试使用量功能
  const testUsage = () => {
    try {
      const before = getUsageRemaining();
      decrementUsage();
      const after = getUsageRemaining();
      incrementUsage(); // 恢复
      
      toast({
        title: "使用量测试",
        description: `测试前: ${before}, 测试后: ${after}`,
      });
    } catch (error) {
      toast({
        title: "使用量测试失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">功能测试页面</h1>
          <p className="text-muted-foreground">
            测试各种功能的权限和状态
          </p>
        </div>

        {/* 用户状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">登录状态</span>
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "已登录" : "未登录"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">VIP状态</span>
                <Badge variant={vipPermission.pass ? "default" : "secondary"}>
                  {vipPermission.pass ? "VIP用户" : "普通用户"}
                </Badge>
              </div>

              {user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">用户ID</span>
                    <span className="text-sm text-muted-foreground">{user.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">用户名</span>
                    <span className="text-sm text-muted-foreground">{user.nickname || user.username}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 功能测试 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              功能测试
            </CardTitle>
            <CardDescription>
              测试各种功能的权限和可用性
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testFeatures.map((feature) => (
                <div key={feature.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <h3 className="font-medium">{feature.name}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={feature.permission.pass ? "default" : "secondary"}>
                      {feature.permission.pass ? "通过" : "失败"}
                    </Badge>
                    {testResults[feature.name] !== undefined && (
                      <Badge variant={testResults[feature.name] ? "default" : "destructive"}>
                        {testResults[feature.name] ? "✅" : "❌"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button onClick={runTests}>
                运行所有测试
              </Button>
              <Button variant="outline" onClick={testUsage}>
                测试使用量
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 环境检查 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              环境检查
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => {
                  const results = EnvChecker.checkAllConfigs();
                  console.log('环境检查结果:', results);
                  toast({
                    title: "环境检查完成",
                    description: "请查看控制台获取详细信息",
                  });
                }}
              >
                运行环境检查
              </Button>
              <p className="text-sm text-muted-foreground">
                点击按钮运行环境变量检查，结果将输出到控制台
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FunctionalityTestPage; 