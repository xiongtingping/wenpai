/**
 * 服务条款页面
 * 针对AI内容创作和适配工具的文派平台服务条款
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, FileText, Shield, Users, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            文派服务条款
          </CardTitle>
          <p className="text-muted-foreground">最后更新：2024年12月</p>
          <p className="text-sm text-gray-600">
            文派是专业的AI内容创作和适配工具，帮助用户快速生成和优化多平台内容
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              1. 服务概述
            </h3>
            <div className="space-y-3 text-gray-700">
              <p className="leading-relaxed">
                文派（以下简称"我们"）是一个基于人工智能的内容创作和适配平台，为用户提供以下核心服务：
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>AI内容生成：</strong>基于用户输入生成原创内容</li>
                <li><strong>多平台适配：</strong>将内容适配到不同社交媒体平台</li>
                <li><strong>品牌库管理：</strong>存储和管理品牌风格指南</li>
                <li><strong>热点话题分析：</strong>提供热门话题和趋势分析</li>
                <li><strong>内容优化：</strong>AI驱动的内容质量提升</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              2. 账户与使用
            </h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">2.1 账户注册</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>您需要注册账户才能使用我们的AI服务</li>
                  <li>注册时请提供真实、准确的个人信息</li>
                  <li>您有责任保护账户安全，不得与他人共享账户</li>
                  <li>如发现账户异常，请立即联系我们</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">2.2 使用限制</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>体验版用户有每日使用次数限制</li>
                  <li>专业版和高级版用户享受更多使用配额</li>
                  <li>不得使用自动化工具批量调用API</li>
                  <li>不得进行任何可能影响服务稳定性的操作</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              3. 订阅与付费
            </h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">3.1 订阅计划</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>体验版：</strong>免费使用，有使用次数限制</li>
                  <li><strong>专业版：</strong>月付29元/年付288元（年付比月付省80元），适合个人创作者</li>
                  <li><strong>高级版：</strong>月付79元/年付788元（年付比月付省202元），适合团队和企业</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">3.2 付费规则</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>订阅费用按选择的周期（月付/年付）收取</li>
                  <li>订阅会自动续费，您可以随时取消</li>
                  <li>取消后，服务将在当前计费周期结束后停止</li>
                  <li>年付用户享受更多优惠和功能</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              4. 内容规范与责任
            </h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">4.1 内容要求</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>您输入的内容必须合法、真实、准确</li>
                  <li>不得包含违法、有害、虚假或侵权信息</li>
                  <li>不得生成可能误导他人的内容</li>
                  <li>您对生成内容的最终使用承担全部责任</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">4.2 禁止行为</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>不得使用服务进行任何违法活动</li>
                  <li>不得生成或传播有害、虚假或侵权内容</li>
                  <li>不得滥用我们的服务或干扰系统运行</li>
                  <li>不得尝试破解或绕过我们的安全措施</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              5. AI生成内容
            </h3>
            <div className="space-y-3 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">5.1 内容所有权</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>您对AI生成的内容拥有使用权</li>
                  <li>我们不会对您的内容主张任何权利</li>
                  <li>您可以将生成内容用于商业用途</li>
                  <li>建议在使用前对内容进行人工审核</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">5.2 内容质量</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>AI生成的内容基于训练数据，可能存在不准确之处</li>
                  <li>我们建议您对重要内容进行人工验证</li>
                  <li>我们不保证生成内容的准确性或适用性</li>
                  <li>您有责任确保内容的最终质量</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">6. 知识产权</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>文派平台、技术、算法和界面设计受知识产权保护</li>
                <li>您不得复制、修改、分发或反向工程我们的专有技术</li>
                <li>您生成的内容归您所有，但您授予我们改进服务的使用许可</li>
                <li>我们尊重第三方知识产权，如发现侵权内容请及时举报</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">7. 服务可用性</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>我们努力保持服务的高可用性，目标99.9%的正常运行时间</li>
                <li>可能会进行定期维护和系统更新</li>
                <li>维护期间服务可能暂时不可用</li>
                <li>我们保留修改、暂停或终止服务的权利</li>
                <li>重大变更会提前通知用户</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">8. 免责声明</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>我们的服务按"现状"提供，不提供任何明示或暗示的保证</li>
                <li>我们不保证生成内容的准确性、完整性或适用性</li>
                <li>您使用服务产生的任何直接或间接损失，我们不承担责任</li>
                <li>我们不对第三方服务或内容承担责任</li>
                <li>在法律允许的最大范围内，我们的责任限制在您支付的费用金额内</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">9. 争议解决</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>本条款受中华人民共和国法律管辖</li>
                <li>任何争议应首先通过友好协商解决</li>
                <li>协商不成的，可向有管辖权的人民法院提起诉讼</li>
                <li>争议解决期间，本条款的其他部分继续有效</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">10. 条款修改</h3>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>我们可能会不时修改这些条款以适应服务发展</li>
                <li>重大修改会通过邮件、网站公告或应用内通知</li>
                <li>继续使用服务即表示您接受修改后的条款</li>
                <li>如不同意修改内容，请停止使用服务并联系我们</li>
              </ul>
            </div>
          </section>

          <div className="border-t pt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">联系我们</h4>
            <p className="text-sm text-blue-800">
              如果您对这些条款有任何疑问或需要帮助，请通过以下方式联系我们：
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• 客服邮箱：<a href="mailto:support@wenpai.com" className="underline">support@wenpai.com</a></li>
              <li>• 应用内客服：通过平台内置客服功能</li>
              <li>• 工作时间：周一至周五 9:00-18:00</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 