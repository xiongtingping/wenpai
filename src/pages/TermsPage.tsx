import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * 服务条款页面组件
 * 详细说明文派平台的服务条款和用户协议
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Link>
            <Link to="/adapt" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回内容适配器
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">服务条款</h1>
          <p className="text-gray-600">最后更新：2024年12月19日</p>
        </div>

        <div className="space-y-6">
          {/* 概述 */}
          <Card>
            <CardHeader>
              <CardTitle>1. 服务概述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                欢迎使用文派AI内容适配工具。本服务条款是您与文派之间就使用我们的AI内容适配服务所达成的协议。使用我们的服务即表示您同意遵守这些条款。
              </p>
            </CardContent>
          </Card>

          {/* 服务内容 */}
          <Card>
            <CardHeader>
              <CardTitle>2. 服务内容</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">2.1 核心功能</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>AI内容生成与适配</li>
                  <li>多平台内容优化</li>
                  <li>风格定制与品牌库</li>
                  <li>内容编辑与翻译</li>
                  <li>用户账户管理</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2.2 服务限制</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>免费用户有使用次数限制</li>
                  <li>部分高级功能需要付费订阅</li>
                  <li>服务可能因维护或更新而暂时中断</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 用户义务 */}
          <Card>
            <CardHeader>
              <CardTitle>3. 用户义务</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>提供真实、准确的注册信息</li>
                <li>遵守相关法律法规和平台规范</li>
                <li>不得生成违法、有害、侵权的内容</li>
                <li>对使用生成内容承担相应责任</li>
              </ul>
            </CardContent>
          </Card>

          {/* 知识产权 */}
          <Card>
            <CardHeader>
              <CardTitle>4. 知识产权</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">4.1 平台知识产权</h4>
                <p className="text-gray-700 mb-2">
                  文派平台及其内容（包括但不限于软件、界面、算法、商标等）的知识产权归我们所有。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.2 用户内容</h4>
                <p className="text-gray-700 mb-2">
                  您输入的内容仍归您所有，但我们有权在提供服务过程中使用这些内容。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4.3 AI生成内容</h4>
                <p className="text-gray-700">
                  AI生成的内容基于您提供的输入和我们的算法。您可以使用这些内容，但需遵守相关法律法规和平台规范。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 免责声明 */}
          <Card>
            <CardHeader>
              <CardTitle>5. 免责声明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                我们提供"按现状"的服务，不保证服务完全准确或无错误。用户需自行验证和使用生成内容。
              </p>
            </CardContent>
          </Card>

          {/* 责任限制 */}
          <Card>
            <CardHeader>
              <CardTitle>6. 责任限制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                在法律允许的最大范围内，我们的责任限制如下：
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>我们的总责任不超过您支付的费用金额</li>
                <li>不承担间接损失、利润损失或数据丢失</li>
                <li>不承担第三方行为造成的损失</li>
                <li>不承担不可抗力造成的服务中断</li>
              </ul>
            </CardContent>
          </Card>

          {/* 服务变更 */}
          <Card>
            <CardHeader>
              <CardTitle>7. 服务变更与终止</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">7.1 服务变更</h4>
                <p className="text-gray-700">
                  我们保留随时修改、暂停或终止服务的权利。重大变更将提前通知用户。
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">7.2 账户终止</h4>
                <p className="text-gray-700">
                  您可随时停止使用服务。我们可在您违反条款时暂停或终止您的账户。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 费用与支付 */}
          <Card>
            <CardHeader>
              <CardTitle>8. 费用与支付</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>部分服务需要付费订阅</li>
                <li>费用标准以网站公示为准</li>
                <li>付费服务不支持退款（除非法律要求）</li>
                <li>我们可能调整价格，会提前通知</li>
                <li>逾期未付费可能导致服务中断</li>
              </ul>
            </CardContent>
          </Card>

          {/* 争议解决 */}
          <Card>
            <CardHeader>
              <CardTitle>9. 争议解决</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                因本条款产生的争议，双方应友好协商解决。协商不成的，可向有管辖权的人民法院提起诉讼。
              </p>
            </CardContent>
          </Card>

          {/* 法律适用 */}
          <Card>
            <CardHeader>
              <CardTitle>10. 法律适用</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                本条款适用中华人民共和国法律。如条款任何部分被认定为无效，不影响其他部分的效力。
              </p>
            </CardContent>
          </Card>

          {/* 联系我们 */}
          <Card>
            <CardHeader>
              <CardTitle>11. 联系我们</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                如有疑问，请联系：
                <a href="mailto:xiongtingping@gmail.com" className="text-blue-600 hover:underline ml-1">
                  xiongtingping@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 