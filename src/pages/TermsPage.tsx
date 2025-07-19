/**
 * 服务条款页面
 * 针对AI内容创作和适配工具的文派平台服务条款
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, FileText, Shield, Users, CreditCard, Calendar, Mail, MessageSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* 返回按钮 */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:bg-blue-50 text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一页
        </Button>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                文派服务条款
              </CardTitle>
              <p className="text-blue-600 font-medium">Wenpai Terms of Service</p>
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
            文派是专业的AI内容创作和适配工具，帮助用户快速生成和优化多平台内容。
            请仔细阅读以下条款，使用我们的服务即表示您同意这些条款。
          </p>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-blue-900">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              1. 服务概述
            </h3>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed text-lg">
                文派（以下简称"我们"）是一个基于人工智能的内容创作和适配平台，为用户提供以下核心服务：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-700 mb-2">🤖 AI内容生成</h4>
                  <p className="text-sm">基于用户输入生成原创内容</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-700 mb-2">🌐 多平台适配</h4>
                  <p className="text-sm">将内容适配到不同社交媒体平台</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-700 mb-2">🏢 品牌库管理</h4>
                  <p className="text-sm">存储和管理品牌风格指南</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-700 mb-2">📡 热点话题分析</h4>
                  <p className="text-sm">提供热门话题和趋势分析</p>
                </div>
              </div>
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

          <section className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-green-900">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              3. 订阅与付费
            </h3>
            <div className="space-y-6 text-gray-700">
              <div>
                <h4 className="font-semibold mb-3 text-green-800">3.1 订阅计划</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎯</span>
                      <h5 className="font-bold text-green-700">体验版</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">免费使用，有使用次数限制</p>
                    <div className="text-lg font-bold text-green-600">¥0</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">⭐</span>
                      <h5 className="font-bold text-green-700">专业版</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">适合个人创作者</p>
                    <div className="space-y-1">
                      <div className="text-sm">月付：<span className="font-bold text-green-600">¥39</span></div>
                      <div className="text-sm">年付：<span className="font-bold text-green-600">¥388</span></div>
                      <div className="text-xs text-green-500">年付省¥80</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">👑</span>
                      <h5 className="font-bold text-green-700">高级版</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">适合团队和企业</p>
                    <div className="space-y-1">
                      <div className="text-sm">月付：<span className="font-bold text-green-600">¥99</span></div>
                      <div className="text-sm">年付：<span className="font-bold text-green-600">¥986</span></div>
                      <div className="text-xs text-green-500">年付省¥202</div>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600">💡</span>
                    <h5 className="font-semibold text-orange-800">限时优惠</h5>
                  </div>
                  <p className="text-sm text-orange-700">
                    新用户注册后30分钟内可享受特惠价格：
                  </p>
                  <ul className="text-sm text-orange-700 mt-2 space-y-1">
                    <li>• 专业版：月付¥29 / 年付¥288</li>
                    <li>• 高级版：月付¥79 / 年付¥788</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-green-800">3.2 付费规则</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h5 className="font-medium text-green-700 mb-2">💰 费用收取</h5>
                    <ul className="text-sm space-y-1">
                      <li>• 订阅费用按选择的周期（月付/年付）收取</li>
                      <li>• 订阅会自动续费，您可以随时取消</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h5 className="font-medium text-green-700 mb-2">🎁 优惠政策</h5>
                    <ul className="text-sm space-y-1">
                      <li>• 年付用户享受更多优惠和功能</li>
                      <li>• 取消后，服务将在当前计费周期结束后停止</li>
                    </ul>
                  </div>
                </div>
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

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-blue-900">联系我们</h4>
            </div>
            <p className="text-blue-800 mb-4">
              如果您对这些条款有任何疑问或需要帮助，请通过以下方式联系我们：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <h5 className="font-semibold text-blue-700">客服邮箱</h5>
                </div>
                <a href="mailto:xiongtingping@gmail.com" className="text-blue-600 hover:underline">
                  xiongtingping@gmail.com
                </a>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <h5 className="font-semibold text-blue-700">应用内客服</h5>
                </div>
                <p className="text-sm text-gray-600">通过平台内置客服功能</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h5 className="font-semibold text-blue-700">工作时间</h5>
                </div>
                <p className="text-sm text-gray-600">周一至周五 9:00-18:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 