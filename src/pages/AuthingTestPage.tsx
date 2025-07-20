/**
 * ✅ Authing 测试页面
 * 
 * 用于在浏览器中测试 Authing 配置和认证流程
 * 提供完整的测试工具和诊断信息
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  Settings,
  User,
  Shield,
  Globe,
  Stethoscope,
  FileText
} from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { 
  testAuthingConfig, 
  testAuthingGuard, 
  testAuthingCallback, 
  runFullAuthingTest 
} from '@/utils/authingTest';
import { 
  runFullDiagnostics,
  type DiagnosticReport,
  type DiagnosticLevel
} from '@/utils/authingDiagnostics';
import { getAuthingConfig, getGuardConfig } from '@/config/authing';

/**
 * Authing 测试页面组件
 */
export default function AuthingTestPage() {
  const { user, isAuthenticated, loading, login, register, logout } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  // 获取当前配置
  useEffect(() => {
    try {
      const config = getAuthingConfig();
      const guardConfig = getGuardConfig();
      setCurrentConfig({ config, guardConfig });
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  }, []);

  /**
   * 运行完整测试
   */
  const handleRunFullTest = async () => {
    setIsRunning(true);
    try {
      const results = await runFullAuthingTest();
      setTestResults(results);
    } catch (error) {
      console.error('测试失败:', error);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * 运行完整诊断
   */
  const handleRunFullDiagnostics = async () => {
    setIsDiagnosing(true);
    try {
      const report = await runFullDiagnostics();
      setDiagnosticReport(report);
    } catch (error) {
      console.error('诊断失败:', error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  /**
   * 运行单个测试
   */
  const handleRunSingleTest = async (testType: 'config' | 'guard' | 'callback') => {
    setIsRunning(true);
    try {
      let result;
      switch (testType) {
        case 'config':
          result = testAuthingConfig();
          break;
        case 'guard':
          result = await testAuthingGuard();
          break;
        case 'callback':
          result = testAuthingCallback();
          break;
      }
      setTestResults({ [testType]: result });
    } catch (error) {
      console.error(`${testType} 测试失败:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * 测试登录
   */
  const handleTestLogin = () => {
    login();
  };

  /**
   * 测试注册
   */
  const handleTestRegister = () => {
    register();
  };

  /**
   * 测试登出
   */
  const handleTestLogout = () => {
    logout();
  };

  /**
   * 获取诊断级别对应的样式
   */
  const getDiagnosticLevelStyle = (level: DiagnosticLevel) => {
    switch (level) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  /**
   * 获取诊断级别对应的图标
   */
  const getDiagnosticLevelIcon = (level: DiagnosticLevel) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'info':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TestTube className="h-8 w-8 text-blue-600" />
          Authing 认证系统测试
        </h1>
        <p className="text-gray-600 mt-2">
          测试 Authing 配置、Guard 组件和认证流程
        </p>
      </div>

      {/* 当前状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            当前认证状态
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "已登录" : "未登录"}
            </Badge>
            {loading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">加载中...</span>
              </div>
            )}
          </div>
          
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">用户信息:</h4>
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 配置信息 */}
      {currentConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              当前配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">基础配置:</h4>
                <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                  {JSON.stringify(currentConfig.config, null, 2)}
                </pre>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Guard 配置:</h4>
                <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto">
                  {JSON.stringify(currentConfig.guardConfig, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            测试控制
          </CardTitle>
          <CardDescription>
            运行各种测试来验证 Authing 配置和功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 完整测试和诊断 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleRunFullTest}
              disabled={isRunning || isDiagnosing}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  运行中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  运行完整测试
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleRunFullDiagnostics}
              disabled={isRunning || isDiagnosing}
              variant="outline"
              className="flex-1"
            >
              {isDiagnosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  诊断中...
                </>
              ) : (
                <>
                  <Stethoscope className="mr-2 h-4 w-4" />
                  运行完整诊断
                </>
              )}
            </Button>
          </div>

          {/* 单个测试 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => handleRunSingleTest('config')}
              disabled={isRunning || isDiagnosing}
              variant="outline"
            >
              <Settings className="mr-2 h-4 w-4" />
              配置测试
            </Button>
            <Button 
              onClick={() => handleRunSingleTest('guard')}
              disabled={isRunning || isDiagnosing}
              variant="outline"
            >
              <Shield className="mr-2 h-4 w-4" />
              Guard 测试
            </Button>
            <Button 
              onClick={() => handleRunSingleTest('callback')}
              disabled={isRunning || isDiagnosing}
              variant="outline"
            >
              <Globe className="mr-2 h-4 w-4" />
              回调测试
            </Button>
          </div>

          {/* 认证测试 */}
          <Separator />
          <div>
            <h4 className="font-medium mb-3">认证流程测试:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handleTestLogin}
                disabled={isAuthenticated}
                variant="outline"
              >
                测试登录
              </Button>
              <Button 
                onClick={handleTestRegister}
                disabled={isAuthenticated}
                variant="outline"
              >
                测试注册
              </Button>
              <Button 
                onClick={handleTestLogout}
                disabled={!isAuthenticated}
                variant="outline"
              >
                测试登出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 诊断结果 */}
      {diagnosticReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              诊断结果
              <Badge variant={diagnosticReport.overall === 'success' ? 'default' : 'destructive'}>
                {diagnosticReport.overall === 'success' ? '正常' : '异常'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {diagnosticReport.summary}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 诊断项列表 */}
              <div className="space-y-3">
                {diagnosticReport.items.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-lg border ${getDiagnosticLevelStyle(item.result)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getDiagnosticLevelIcon(item.result)}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm mt-1">{item.message}</p>
                        {item.details && (
                          <p className="text-xs mt-1 opacity-75">{item.details}</p>
                        )}
                        {item.suggestion && (
                          <p className="text-xs mt-1 font-medium">建议: {item.suggestion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 修复建议 */}
              {diagnosticReport.recommendations.length > 0 && (
                <div>
                  <Separator />
                  <h4 className="font-medium mt-4 mb-2">修复建议:</h4>
                  <ul className="space-y-1">
                    {diagnosticReport.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试结果 */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              测试结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 配置测试结果 */}
              {testResults.configTest && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    配置测试
                    <Badge variant={testResults.configTest.success ? "default" : "destructive"}>
                      {testResults.configTest.success ? "通过" : "失败"}
                    </Badge>
                  </h4>
                  {testResults.configTest.error && (
                    <Alert variant="destructive" className="mb-3">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{testResults.configTest.error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    {testResults.configTest.steps.map((step: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guard 测试结果 */}
              {testResults.guardTest && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Guard 测试
                    <Badge variant={testResults.guardTest.success ? "default" : "destructive"}>
                      {testResults.guardTest.success ? "通过" : "失败"}
                    </Badge>
                  </h4>
                  {testResults.guardTest.error && (
                    <Alert variant="destructive" className="mb-3">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{testResults.guardTest.error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    {testResults.guardTest.steps.map((step: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 回调测试结果 */}
              {testResults.callbackTest && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    回调测试
                    <Badge variant={testResults.callbackTest.success ? "default" : "destructive"}>
                      {testResults.callbackTest.success ? "通过" : "失败"}
                    </Badge>
                  </h4>
                  {testResults.callbackTest.error && (
                    <Alert variant="destructive" className="mb-3">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{testResults.callbackTest.error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    {testResults.callbackTest.steps.map((step: string, index: number) => (
                      <div key={index} className="text-sm text-gray-600">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 总体结果 */}
              {testResults.overall !== undefined && (
                <div>
                  <Separator />
                  <div className="flex items-center gap-2 mt-4">
                    <h4 className="font-medium">总体结果:</h4>
                    <Badge variant={testResults.overall ? "default" : "destructive"}>
                      {testResults.overall ? "全部通过" : "部分失败"}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 