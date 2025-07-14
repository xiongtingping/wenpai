/**
 * 安全页面
 * 展示应用的安全配置和状态
 */

import React from 'react';
import { SecurityConfig } from '@/components/ui/security-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Key, AlertTriangle } from 'lucide-react';

/**
 * 安全页面组件
 * @returns React 组件
 */
export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">安全中心</h1>
        <p className="text-gray-600">
          管理应用的安全设置，保护您的数据和隐私
        </p>
      </div>

      {/* 安全特性介绍 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold">数据加密</h3>
            </div>
            <p className="text-sm text-gray-600">
              使用AES-256加密算法保护敏感数据，确保数据在存储和传输过程中的安全
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">数据脱敏</h3>
            </div>
            <p className="text-sm text-gray-600">
              自动识别和脱敏敏感信息，在日志和调试信息中保护用户隐私
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Key className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold">安全存储</h3>
            </div>
            <p className="text-sm text-gray-600">
              提供安全的本地存储方案，防止敏感数据被恶意访问
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="font-semibold">安全监控</h3>
            </div>
            <p className="text-sm text-gray-600">
              实时监控安全状态，及时发现和报告潜在的安全风险
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 安全配置组件 */}
      <SecurityConfig />

      {/* 安全最佳实践 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            安全最佳实践
          </CardTitle>
          <CardDescription>
            保护您的账户和数据安全的建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">账户安全</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  使用强密码，包含大小写字母、数字和特殊字符
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  定期更换密码，不要在不同平台使用相同密码
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  启用双因素认证（如果可用）
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  不要在公共设备上保存登录状态
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">数据保护</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  定期清理浏览器缓存和本地存储
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  不要在聊天或邮件中分享敏感信息
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  使用HTTPS连接访问网站
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  定期检查账户活动，发现异常及时处理
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 隐私政策链接 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>隐私与安全</CardTitle>
          <CardDescription>
            了解更多关于我们如何处理和保护您的数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <a 
              href="/privacy" 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              隐私政策
            </a>
            <a 
              href="/terms" 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              服务条款
            </a>
            <a 
              href="/security" 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              安全说明
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 