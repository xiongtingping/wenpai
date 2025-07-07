import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Crown, Sparkles, Check, X } from "lucide-react"

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Handle Pro plan selection
  const handleProPlanClick = () => {
    if (isAuthenticated) {
      // User is logged in, go directly to payment
      localStorage.setItem("selectedPlan", billing === "monthly" ? "pro-monthly" : "pro-yearly");
      navigate("/payment");
      
      toast({
        title: "正在为您跳转到支付页面",
        description: "请完成支付以开通专业版功能",
      });
    } else {
      // User is not logged in, redirect to login/register choice page
      localStorage.setItem("selectedPlan", billing === "monthly" ? "pro-monthly" : "pro-yearly");
      navigate("/register");
    
      toast({
        title: "正在为您跳转到登录页面",
        description: "完成登录后将为您导向支付页面",
      });
    }
  }

  return (
    <section id="pricing" className="py-20 opacity-0 animate-fadeIn">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">选择适合您的方案</h2>
          <p className="mt-4 text-lg text-gray-600">从免费体验到专业版，全方位赋能新媒体创意工作者</p>
          
          <div className="mt-8 flex justify-center items-center space-x-4">
            <span className={billing === "monthly" ? "text-blue-600 font-semibold" : ""}>
              按月支付
            </span>
            <Switch
              checked={billing === "yearly"}
              onCheckedChange={(checked) => setBilling(checked ? "yearly" : "monthly")}
            />
            <span className={billing === "yearly" ? "text-blue-600 font-semibold" : ""}>
              按年支付 <span className="text-sm text-green-500">(立省20%)</span>
            </span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-semibold">免费版</h3>
            </div>
            <p className="mt-2 text-gray-500">适合个人体验者和初学者</p>
            <p className="mt-6 text-5xl font-extrabold">¥0</p>
            <p className="text-gray-500">永久免费</p>
            
            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">AI内容适配</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                    每月10次
                  </Badge>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">创意工作室</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    免费
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">九宫格创意魔方、营销日历、文案管理、任务清单</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">全网热点话题</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                    免费
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">实时获取各平台热门话题和趋势</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <span className="font-medium">基础AI模型</span>
                  <p className="text-sm text-gray-500 mt-1">支持主流平台内容适配</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <X className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <span className="text-gray-400 line-through">Emoji表情库</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <X className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <span className="text-gray-400 line-through">内容提取功能</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <X className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <span className="text-gray-400 line-through">品牌资料库</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <X className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <span className="text-gray-400 line-through">一键转发</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                </div>
              </li>
            </ul>
            <Button variant="outline" className="mt-8 w-full" asChild>
              <Link to="/adapt">开始免费使用</Link>
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-purple-600 p-8 flex flex-col relative shadow-2xl bg-gradient-to-br from-purple-50 to-blue-50">
            <span className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full">
              <Crown className="w-3 h-3 mr-1 inline" />
              最受欢迎
            </span>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl font-semibold">专业版</h3>
            </div>
            <p className="mt-2 text-gray-500">适合专业创作者和内容团队</p>
            <div className="mt-6">
              {billing === "monthly" ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-5xl font-extrabold text-purple-600">¥29.9</p>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-purple-500 font-semibold">限时特惠</span>
                      <span className="text-xs text-purple-500">原价¥39.9</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-5xl font-extrabold text-purple-600">¥288</p>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-purple-500 font-semibold">限时特惠</span>
                      <span className="text-xs text-purple-500">原价¥358.8</span>
                    </div>
                  </div>
                </>
              )}
              <p className="text-gray-500">{billing === "monthly" ? "/月" : "/年"}</p>
            </div>
            
            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">AI内容适配</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    无限制
                  </Badge>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">创意工作室</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    免费
                  </Badge>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">全网热点话题</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                    免费
                  </Badge>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">Emoji表情库</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">一键生成符合平台调性的表情组合</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">内容提取功能</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">智能提取网页、文档内容，支持多种格式转换</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">品牌资料库</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">AI自动学习品牌调性，确保品牌声音一致</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">一键转发</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">支持一键将内容转发到多个平台</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">高级AI模型</span>
                  <p className="text-sm text-gray-500 mt-1">GPT-4o、DeepSeek V3等最新模型</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <span className="font-medium">优先技术支持</span>
                  <p className="text-sm text-gray-500 mt-1">专业客服团队，快速响应</p>
                </div>
              </li>
            </ul>
            <Button 
              className="mt-8 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90"
              onClick={handleProPlanClick}
            >
              <Crown className="w-4 h-4 mr-2" />
              立即升级专业版
            </Button>
          </Card>
        </div>

        {/* 功能对比表 */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">功能详细对比</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 p-4 text-left font-semibold">功能</th>
                  <th className="border border-gray-200 p-4 text-center font-semibold">免费版</th>
                  <th className="border border-gray-200 p-4 text-center font-semibold bg-purple-50">专业版</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">AI内容适配</td>
                  <td className="border border-gray-200 p-4 text-center">每月10次</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">无限制</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">创意工作室</td>
                  <td className="border border-gray-200 p-4 text-center">✅ 免费</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">✅ 免费</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">全网热点话题</td>
                  <td className="border border-gray-200 p-4 text-center">✅ 免费</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">✅ 免费</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">Emoji表情库</td>
                  <td className="border border-gray-200 p-4 text-center">❌</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">✅ 专业版</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">内容提取功能</td>
                  <td className="border border-gray-200 p-4 text-center">❌</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">✅ 专业版</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">品牌资料库</td>
                  <td className="border border-gray-200 p-4 text-center">❌</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">✅ 专业版</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">一键转发</td>
                  <td className="border border-gray-200 p-4 text-center">❌</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">✅ 专业版</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">AI模型选择</td>
                  <td className="border border-gray-200 p-4 text-center">基础模型</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">高级模型</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-4 font-medium">技术支持</td>
                  <td className="border border-gray-200 p-4 text-center">社区支持</td>
                  <td className="border border-gray-200 p-4 text-center bg-purple-50">优先支持</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}