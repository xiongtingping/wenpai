/**
 * 安全配置组件
 * 用于显示和管理应用的安全设置
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  secureStorage, 
  dataValidation, 
  securityUtils,
  dataMasking 
} from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

/**
 * 安全配置组件属性
 */
interface SecurityConfigProps {
  className?: string;
}

/**
 * 安全状态接口
 */
interface SecurityStatus {
  encryptionEnabled: boolean;
  dataMaskingEnabled: boolean;
  secureLoggingEnabled: boolean;
  lastSecurityCheck: string;
  vulnerabilitiesFound: number;
  recommendations: string[];
}

/**
 * 安全配置组件
 * @param props 组件属性
 * @returns React 组件
 */
export function SecurityConfig({ className }: SecurityConfigProps) {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    encryptionEnabled: true,
    dataMaskingEnabled: true,
    secureLoggingEnabled: true,
    lastSecurityCheck: new Date().toISOString(),
    vulnerabilitiesFound: 0,
    recommendations: []
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const { toast } = useToast();

  /**
   * 执行安全检查
   */
  const performSecurityCheck = async () => {
    setIsChecking(true);
    const recommendations: string[] = [];
    let vulnerabilitiesFound = 0;

    try {
      // 检查环境变量
      if (!import.meta.env.VITE_ENCRYPTION_KEY) {
        recommendations.push('建议设置自定义加密密钥 (VITE_ENCRYPTION_KEY)');
        vulnerabilitiesFound++;
      }

      // 检查localStorage中的敏感数据
      const sensitiveKeys = ['authing_user', 'remembered_login', 'api_keys'];
      const foundSensitiveData = sensitiveKeys.filter(key => 
        localStorage.getItem(key) !== null
      );

      if (foundSensitiveData.length > 0) {
        recommendations.push(`发现 ${foundSensitiveData.length} 个敏感数据项，建议使用安全存储`);
        vulnerabilitiesFound++;
      }

      // 检查HTTPS
      if (window.location.protocol !== 'https:' && !securityUtils.isDevelopment()) {
        recommendations.push('生产环境建议使用HTTPS协议');
        vulnerabilitiesFound++;
      }

      // 检查内容安全策略
      if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        recommendations.push('建议配置内容安全策略 (CSP)');
        vulnerabilitiesFound++;
      }

      setSecurityStatus(prev => ({
        ...prev,
        lastSecurityCheck: new Date().toISOString(),
        vulnerabilitiesFound,
        recommendations
      }));

      toast({
        title: "安全检查完成",
        description: `发现 ${vulnerabilitiesFound} 个潜在安全问题`,
        variant: vulnerabilitiesFound > 0 ? "destructive" : "default"
      });

    } catch (error) {
      console.error('安全检查失败:', error);
      toast({
        title: "安全检查失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * 清理敏感数据
   */
  const clearSensitiveData = () => {
    try {
      const sensitiveKeys = [
        'authing_user',
        'remembered_login', 
        'api_keys',
        'temp-user-id',
        'referrer-id',
        'processed_referrals'
      ];

      sensitiveKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      toast({
        title: "敏感数据已清理",
        description: "所有敏感数据已从本地存储中移除",
      });

      // 重新执行安全检查
      performSecurityCheck();

    } catch (error) {
      console.error('清理敏感数据失败:', error);
      toast({
        title: "清理失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 导出安全报告
   */
  const exportSecurityReport = () => {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        securityStatus,
        environment: {
          isDevelopment: securityUtils.isDevelopment(),
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          userAgent: navigator.userAgent
        },
        recommendations: securityStatus.recommendations
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "安全报告已导出",
        description: "报告已下载到本地",
      });

    } catch (error) {
      console.error('导出安全报告失败:', error);
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 组件挂载时执行安全检查
   */
  useEffect(() => {
    performSecurityCheck();
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 安全状态概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            安全状态概览
          </CardTitle>
          <CardDescription>
            当前应用的安全配置和状态
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">数据加密</span>
              </div>
              <Badge variant={securityStatus.encryptionEnabled ? "default" : "destructive"}>
                {securityStatus.encryptionEnabled ? "已启用" : "未启用"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">数据脱敏</span>
              </div>
              <Badge variant={securityStatus.dataMaskingEnabled ? "default" : "destructive"}>
                {securityStatus.dataMaskingEnabled ? "已启用" : "未启用"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">安全日志</span>
              </div>
              <Badge variant={securityStatus.secureLoggingEnabled ? "default" : "destructive"}>
                {securityStatus.secureLoggingEnabled ? "已启用" : "未启用"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">发现漏洞</span>
              </div>
              <Badge variant={securityStatus.vulnerabilitiesFound > 0 ? "destructive" : "default"}>
                {securityStatus.vulnerabilitiesFound} 个
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>最后检查: {new Date(securityStatus.lastSecurityCheck).toLocaleString()}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={performSecurityCheck}
              disabled={isChecking}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              重新检查
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 安全建议 */}
      {securityStatus.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-600" />
              安全建议
            </CardTitle>
            <CardDescription>
              发现 {securityStatus.recommendations.length} 个安全改进建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityStatus.recommendations.map((recommendation, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 安全操作 */}
      <Card>
        <CardHeader>
          <CardTitle>安全操作</CardTitle>
          <CardDescription>
            管理应用的安全设置和数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">显示敏感数据</span>
            </div>
            <Switch
              checked={showSensitiveData}
              onCheckedChange={setShowSensitiveData}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSensitiveData}
              className="flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              清理敏感数据
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportSecurityReport}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              导出安全报告
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 敏感数据预览 */}
      {showSensitiveData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-red-600" />
              敏感数据预览（已脱敏）
            </CardTitle>
            <CardDescription>
              显示本地存储中的敏感数据（已进行脱敏处理）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.keys(localStorage).map(key => {
                try {
                  const value = localStorage.getItem(key);
                  if (!value) return null;

                  let parsedValue;
                  try {
                    parsedValue = JSON.parse(value);
                  } catch {
                    parsedValue = value;
                  }

                  const maskedValue = dataMasking.maskObject(
                    typeof parsedValue === 'object' ? parsedValue : { value: parsedValue }
                  );

                  return (
                    <div key={key} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-mono text-gray-700">{key}:</div>
                      <div className="text-gray-600 mt-1">
                        {JSON.stringify(maskedValue, null, 2)}
                      </div>
                    </div>
                  );
                } catch (error) {
                  return (
                    <div key={key} className="p-2 bg-gray-50 rounded text-xs">
                      <div className="font-mono text-gray-700">{key}:</div>
                      <div className="text-gray-600 mt-1">*** (无法解析)</div>
                    </div>
                  );
                }
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 