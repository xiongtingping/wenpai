import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * 隐私政策页面组件
 * 详细说明文派平台如何收集、使用和保护用户信息
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">隐私政策</h1>
          <p className="text-gray-600">最后更新：2024年12月19日</p>
        </div>

        <div className="space-y-6">
          {/* 概述 */}
          <Card>
            <CardHeader>
              <CardTitle>1. 概述</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                文派（以下简称"我们"）非常重视用户的隐私保护。本隐私政策详细说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本隐私政策的内容。
              </p>
            </CardContent>
          </Card>

          {/* 信息收集 */}
          <Card>
            <CardHeader>
              <CardTitle>2. 我们收集的信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 您主动提供的信息</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>注册信息：手机号、邮箱地址、用户名</li>
                  <li>使用信息：您输入的内容、平台选择、使用偏好</li>
                  <li>支付信息：支付方式、订单信息（由第三方支付平台处理）</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.2 自动收集的信息</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>设备信息：设备类型、操作系统、浏览器版本</li>
                  <li>使用数据：访问时间、使用频率、功能使用情况</li>
                  <li>技术信息：IP地址、Cookie数据、日志信息</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 信息使用 */}
          <Card>
            <CardHeader>
              <CardTitle>3. 信息使用目的</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>提供和改进AI内容适配服务</li>
                <li>处理用户注册、登录和账户管理</li>
                <li>处理支付和订阅服务</li>
                <li>提供客户支持和问题解决</li>
                <li>发送服务通知和更新信息</li>
                <li>防止欺诈和滥用行为</li>
                <li>遵守法律法规要求</li>
              </ul>
            </CardContent>
          </Card>

          {/* 信息共享 */}
          <Card>
            <CardHeader>
              <CardTitle>4. 信息共享</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们不会出售、出租或交易您的个人信息。仅在以下情况下，我们可能会共享您的信息：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>获得您的明确同意</li>
                <li>与第三方服务提供商合作（如支付平台、云服务商）</li>
                <li>遵守法律法规或政府要求</li>
                <li>保护我们的合法权益和用户安全</li>
                <li>在业务转让或合并时（会提前通知用户）</li>
              </ul>
            </CardContent>
          </Card>

          {/* 数据安全 */}
          <Card>
            <CardHeader>
              <CardTitle>5. 数据安全</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们采用行业标准的安全措施保护您的个人信息：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>使用加密技术传输和存储数据</li>
                <li>定期更新安全措施和系统</li>
                <li>限制员工访问个人信息的权限</li>
                <li>建立数据泄露应急响应机制</li>
              </ul>
            </CardContent>
          </Card>

          {/* 用户权利 */}
          <Card>
            <CardHeader>
              <CardTitle>6. 您的权利</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">您对您的个人信息享有以下权利：</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>访问和查看您的个人信息</li>
                <li>更正或更新不准确的信息</li>
                <li>删除您的账户和个人信息</li>
                <li>限制或反对处理您的信息</li>
                <li>数据可携带性（导出您的数据）</li>
                <li>撤回同意（在适用的情况下）</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookie使用 */}
          <Card>
            <CardHeader>
              <CardTitle>7. Cookie和追踪技术</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们使用Cookie和类似技术来改善用户体验、分析网站使用情况和提供个性化服务。您可以通过浏览器设置管理Cookie偏好。
              </p>
            </CardContent>
          </Card>

          {/* 儿童隐私 */}
          <Card>
            <CardHeader>
              <CardTitle>8. 儿童隐私</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们的服务不面向13岁以下的儿童。如果我们发现收集了儿童的个人信息，将立即删除相关数据。
              </p>
            </CardContent>
          </Card>

          {/* 政策更新 */}
          <Card>
            <CardHeader>
              <CardTitle>9. 政策更新</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们可能会不时更新本隐私政策。重大变更将通过网站公告或邮件通知用户。继续使用我们的服务即表示您接受更新后的政策。
              </p>
            </CardContent>
          </Card>

          {/* 联系我们 */}
          <Card>
            <CardHeader>
              <CardTitle>10. 联系我们</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>邮箱：</strong>
                  <a href="mailto:xiongtingping@gmail.com" className="text-blue-600 hover:underline">
                    xiongtingping@gmail.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 