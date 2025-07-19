/**
 * 隐私政策页面
 * 针对AI内容创作和适配工具的文派平台隐私政策
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Database, Eye, Lock, Users, Brain, Mail, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* 返回按钮 */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:bg-green-50 text-green-600"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一页
        </Button>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                文派隐私政策
              </CardTitle>
              <p className="text-green-600 font-medium">Wenpai Privacy Policy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              最后更新：2024年12月
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              版本：v2.0
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed mt-3">
            我们深知隐私保护的重要性，本政策详细说明我们如何收集、使用和保护您的个人信息。
            请仔细阅读以下政策，使用我们的服务即表示您同意这些条款。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              1. 我们收集的信息
            </h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">1.1 账户信息</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>注册信息：</strong>邮箱地址、用户名、密码（加密存储）</li>
                  <li><strong>个人资料：</strong>头像、个人简介、联系方式</li>
                  <li><strong>认证信息：</strong>实名认证相关材料（如需要）</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">1.2 使用数据</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>功能使用：</strong>使用频率、功能偏好、操作记录</li>
                  <li><strong>内容数据：</strong>您输入的内容、AI生成的内容、品牌库信息</li>
                  <li><strong>平台适配：</strong>选择的目标平台、内容风格偏好</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">1.3 技术数据</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>设备信息：</strong>设备类型、操作系统、浏览器版本</li>
                  <li><strong>网络信息：</strong>IP地址、网络连接类型</li>
                  <li><strong>日志数据：</strong>访问时间、页面浏览、错误日志</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              2. 信息使用目的
            </h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>提供服务：</strong>提供AI内容生成、多平台适配等核心功能</li>
                <li><strong>改进服务：</strong>分析使用模式，优化AI算法和用户体验</li>
                <li><strong>个性化：</strong>根据您的偏好提供个性化推荐和服务</li>
                <li><strong>支付处理：</strong>处理订阅费用和支付相关事务</li>
                <li><strong>客户支持：</strong>提供技术支持和客户服务</li>
                <li><strong>安全保障：</strong>防止欺诈、滥用和系统安全威胁</li>
                <li><strong>法律合规：</strong>遵守相关法律法规要求</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              3. 信息共享政策
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="font-medium text-green-800 mb-2">我们不会出售您的个人信息</p>
                <p className="text-sm text-green-700">
                  我们承诺不会向第三方出售、出租或交易您的个人信息
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3.1 必要的第三方共享</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>支付服务商：</strong>处理订阅费用（如支付宝、微信支付）</li>
                  <li><strong>云服务提供商：</strong>数据存储和处理（如阿里云、腾讯云）</li>
                  <li><strong>AI服务提供商：</strong>提供AI内容生成服务</li>
                  <li><strong>客服平台：</strong>提供客户支持服务</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">3.2 法律要求</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>在法律法规要求时披露信息</li>
                  <li>保护我们的合法权益和用户安全</li>
                  <li>配合政府部门的合法调查</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-500" />
              4. 数据安全措施
            </h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>加密传输：</strong>使用HTTPS和SSL加密保护数据传输</li>
                <li><strong>加密存储：</strong>敏感数据使用强加密算法存储</li>
                <li><strong>访问控制：</strong>严格的员工权限管理和访问控制</li>
                <li><strong>安全审计：</strong>定期进行安全评估和漏洞扫描</li>
                <li><strong>数据备份：</strong>定期备份数据，确保数据安全</li>
                <li><strong>监控系统：</strong>实时监控异常访问和安全威胁</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">5. 数据保留期限</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>账户数据：</strong>账户活跃期间保留，删除账户后30天内清除</li>
                <li><strong>使用数据：</strong>最多保留2年，用于服务改进</li>
                <li><strong>内容数据：</strong>您可以选择保留或删除，删除后立即清除</li>
                <li><strong>支付数据：</strong>根据法律要求保留，通常为7年</li>
                <li><strong>日志数据：</strong>最多保留6个月，用于安全分析</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              6. 您的权利
            </h3>
            <div className="space-y-3 text-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">6.1 基本权利</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>访问权：</strong>查看我们收集的您的个人信息</li>
                    <li><strong>更正权：</strong>更正不准确或不完整的信息</li>
                    <li><strong>删除权：</strong>要求删除您的个人信息</li>
                    <li><strong>携带权：</strong>获取您的数据副本</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">6.2 控制权利</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li><strong>限制权：</strong>限制我们处理您的信息</li>
                    <li><strong>反对权：</strong>反对某些处理活动</li>
                    <li><strong>撤回权：</strong>撤回之前给予的同意</li>
                    <li><strong>投诉权：</strong>向监管部门投诉</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">7. Cookie和追踪技术</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>必要Cookie：</strong>用于网站基本功能和安全</li>
                <li><strong>功能Cookie：</strong>记住您的偏好设置</li>
                <li><strong>分析Cookie：</strong>帮助我们改进服务质量</li>
                <li><strong>第三方Cookie：</strong>仅用于必要的第三方服务</li>
                <li>您可以在浏览器设置中管理Cookie偏好</li>
                <li>我们不会使用第三方追踪Cookie进行广告投放</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">8. 儿童隐私保护</h3>
            <div className="space-y-3 text-gray-700">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-800 mb-2">重要提醒</p>
                <p className="text-sm text-yellow-700">
                  我们的服务不面向13岁以下的儿童。如果您发现我们收集了儿童信息，请立即联系我们。
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>我们不会故意收集13岁以下儿童的个人信息</li>
                <li>如果发现收集了儿童信息，会立即删除</li>
                <li>家长或监护人如发现相关问题，请及时联系我们</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">9. 国际数据传输</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>您的数据可能在中国境外进行处理</li>
                <li>我们确保所有数据传输符合适用的数据保护法律</li>
                <li>我们采用适当的安全措施保护跨境数据</li>
                <li>我们与第三方服务商签订数据处理协议</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">10. 政策更新</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>我们可能会不时更新本隐私政策</li>
                <li>重大变更会通过邮件、网站公告或应用内通知</li>
                <li>继续使用服务即表示您接受更新后的政策</li>
                <li>如不同意修改内容，请停止使用服务并联系我们</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              11. 联系我们
            </h3>
            <div className="space-y-3 text-gray-700">
              <p>如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：</p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <ul className="space-y-2 text-sm">
                  <li>• <strong>隐私保护邮箱：</strong><a href="mailto:privacy@wenpai.com" className="text-blue-600 hover:underline ml-1">privacy@wenpai.com</a></li>
                  <li>• <strong>客服邮箱：</strong><a href="mailto:support@wenpai.com" className="text-blue-600 hover:underline ml-1">support@wenpai.com</a></li>
                  <li>• <strong>应用内客服：</strong>通过平台内置客服功能</li>
                  <li>• <strong>工作时间：</strong>周一至周五 9:00-18:00</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="border-t pt-6 bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">我们的承诺</h4>
            <p className="text-sm text-green-800">
              我们承诺保护您的隐私，并持续改进我们的隐私保护措施。您的信任是我们最重要的资产。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 