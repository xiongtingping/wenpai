/**
 * 推荐人ID测试页面
 * @description 用于测试推荐人ID的识别和处理功能
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, ExternalLink, Gift, User, TestTube, RefreshCw, Trash2 } from 'lucide-react';
import { 
  getReferrerId, 
  getReferrerFromURL, 
  hasReferrerInURL, 
  clearReferrerId,
  getOrCreateTempUserId,
  validateReferrerId,
  hasProcessedReferral,
  markReferralProcessed
} from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import { Input } from '@/components/ui/input';

/**
 * 推荐人ID测试页面组件
 * @returns React 组件
 */
export default function ReferrerTestPage() {
  const [currentReferrerId, setCurrentReferrerId] = useState<string | null>(null);
  const [urlReferrerId, setUrlReferrerId] = useState<string | null>(null);
  const [hasReferrerParam, setHasReferrerParam] = useState(false);
  const [tempUserId, setTempUserId] = useState<string>('');
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});
  const [testReferrerId, setTestReferrerId] = useState<string>('');
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [processedStatus, setProcessedStatus] = useState<boolean | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getReferrer, clearReferrer } = useUserStore();

  /**
   * 组件挂载时获取所有相关数据
   */
  useEffect(() => {
    updateAllData();
  }, []);

  /**
   * 更新所有数据
   */
  const updateAllData = () => {
    setCurrentReferrerId(getReferrerId());
    setUrlReferrerId(getReferrerFromURL());
    setHasReferrerParam(hasReferrerInURL());
    setTempUserId(getOrCreateTempUserId());
    
    // 获取localStorage中的所有数据
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    setLocalStorageData(data);
  };

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制到剪贴板",
      description: text
    });
  };

  /**
   * 生成测试链接
   */
  const generateTestLink = (referrerId: string) => {
    const baseUrl = window.location.origin;
    const testUrl = `${baseUrl}/register?ref=${referrerId}`;
    return testUrl;
  };

  /**
   * 清除推荐人ID
   */
  const handleClearReferrer = () => {
    clearReferrerId();
    clearReferrer();
    updateAllData();
    toast({
      title: "推荐人ID已清除",
      description: "localStorage和状态中的推荐人ID都已清除"
    });
  };

  /**
   * 跳转到注册页面
   */
  const goToRegister = () => {
    navigate('/register');
  };

  /**
   * 测试推荐人ID验证
   */
  const testValidation = () => {
    if (!testReferrerId.trim()) {
      toast({
        title: "请输入测试ID",
        variant: "destructive"
      });
      return;
    }
    
    const isValid = validateReferrerId(testReferrerId.trim());
    setValidationResult(isValid);
    
    toast({
      title: isValid ? "验证通过" : "验证失败",
      description: isValid ? "推荐人ID格式正确" : "推荐人ID格式不正确",
      variant: isValid ? "default" : "destructive"
    });
  };

  /**
   * 测试推荐奖励处理状态
   */
  const testProcessedStatus = () => {
    if (!testReferrerId.trim()) {
      toast({
        title: "请输入测试ID",
        variant: "destructive"
      });
      return;
    }
    
    const isProcessed = hasProcessedReferral(testReferrerId.trim());
    setProcessedStatus(isProcessed);
    
    toast({
      title: isProcessed ? "已处理" : "未处理",
      description: isProcessed ? "该推荐奖励已处理过" : "该推荐奖励未处理",
      variant: isProcessed ? "default" : "destructive"
    });
  };

  /**
   * 标记推荐奖励为已处理
   */
  const markAsProcessed = () => {
    if (!testReferrerId.trim()) {
      toast({
        title: "请输入测试ID",
        variant: "destructive"
      });
      return;
    }
    
    markReferralProcessed(testReferrerId.trim());
    updateAllData();
    
    toast({
      title: "标记成功",
      description: "推荐奖励已标记为已处理"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Gift className="h-6 w-6 text-green-600" />
              推荐人ID测试页面
            </CardTitle>
            <CardDescription>
              测试推荐人ID的识别、存储和处理功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 当前状态 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">当前状态</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">URL包含推荐人参数:</span>
                    <Badge variant={hasReferrerParam ? "default" : "secondary"}>
                      {hasReferrerParam ? "是" : "否"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">localStorage推荐人ID:</span>
                    <div className="flex items-center gap-2">
                      {currentReferrerId ? (
                        <>
                          <Badge variant="default" className="text-xs">
                            {currentReferrerId}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(currentReferrerId)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary">无</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">URL推荐人ID:</span>
                    <div className="flex items-center gap-2">
                      {urlReferrerId ? (
                        <>
                          <Badge variant="default" className="text-xs">
                            {urlReferrerId}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(urlReferrerId)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary">无</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">临时用户ID:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {tempUserId}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(tempUserId)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 测试功能区 */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    功能测试
                  </CardTitle>
                  <CardDescription>
                    测试推荐人ID验证和处理状态功能
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">测试推荐人ID</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={testReferrerId}
                        onChange={(e) => setTestReferrerId(e.target.value)}
                        placeholder="输入要测试的推荐人ID"
                        className="flex-1"
                      />
                      <Button 
                        onClick={testValidation}
                        size="sm"
                        variant="outline"
                      >
                        验证格式
                      </Button>
                      <Button 
                        onClick={testProcessedStatus}
                        size="sm"
                        variant="outline"
                      >
                        检查状态
                      </Button>
                      <Button 
                        onClick={markAsProcessed}
                        size="sm"
                        variant="outline"
                      >
                        标记已处理
                      </Button>
                    </div>
                  </div>
                  
                  {validationResult !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">验证结果:</span>
                      <Badge variant={validationResult ? "default" : "destructive"}>
                        {validationResult ? "有效" : "无效"}
                      </Badge>
                    </div>
                  )}
                  
                  {processedStatus !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">处理状态:</span>
                      <Badge variant={processedStatus ? "default" : "secondary"}>
                        {processedStatus ? "已处理" : "未处理"}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2 mt-6">
                <Button 
                  onClick={updateAllData}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新数据
                </Button>
                <Button 
                  onClick={() => {
                    clearReferrer();
                    updateAllData();
                    toast({
                      title: "已清除",
                      description: "推荐人ID已清除"
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清除推荐人ID
                </Button>
                <Button 
                  onClick={() => {
                    localStorage.clear();
                    updateAllData();
                    toast({
                      title: "已清除",
                      description: "所有本地数据已清除"
                    });
                  }}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清除所有数据
                </Button>
              </div>
            </div>
            {/* 测试链接生成 */}
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg">测试链接生成</CardTitle>
                <CardDescription>
                  生成包含推荐人ID的测试链接
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['user123', 'invite456', 'test789'].map((id) => (
                    <div key={id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">推荐人ID: {id}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = generateTestLink(id);
                            copyToClipboard(link);
                          }}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          复制链接
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = generateTestLink(id);
                            window.open(link, '_blank');
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* localStorage数据 */}
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg">localStorage数据</CardTitle>
                <CardDescription>
                  查看localStorage中存储的所有数据
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(localStorageData).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-mono text-gray-700">{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 max-w-40 truncate">
                          {value}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(value)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </CardContent>
        </Card>
      </div>
    </div>
  );
} 