import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const { toast } = useToast()


  // Handle Pro plan selection
  const handleProPlanClick = () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("userToken") || sessionStorage.getItem("userToken");
    
    if (isLoggedIn) {
      // User is logged in, go directly to payment
      localStorage.setItem("selectedPlan", billing === "monthly" ? "pro-monthly" : "pro-yearly");
      window.location.href = "/payment";
      
      toast({
        title: "正在为您跳转到支付页面",
        description: "请完成支付以开通专业版功能",
      });
    } else {
      // User is not logged in, redirect to registration first
      localStorage.setItem("selectedPlan", billing === "monthly" ? "pro-monthly" : "pro-yearly");
      window.location.href = "/register";
    
    toast({
      title: "正在为您跳转到注册页面",
      description: "完成注册后将为您导向支付页面",
      });
    }
  }

  return (
    <section id="pricing" className="py-20 opacity-0 animate-fadeIn">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">选择适合你的方案</h2>
          <p className="mt-4 text-lg text-gray-600">从免费试用到企业级方案，总有一款适合你。</p>
          
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

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="border border-gray-200 p-8 flex flex-col">
            <h3 className="text-2xl font-semibold">免费版</h3>
            <p className="mt-2 text-gray-500">适合个人体验者</p>
            <p className="mt-6 text-5xl font-extrabold">¥0</p>
            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
              <li className="flex items-center space-x-3">
                <span>✔️</span> 
                <div>
                  <span>每月赠送 10 次生成</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">月初自动发放</Badge>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <span>✔️</span> 
                <div>
                  <span>邀请奖励 +20 次/人</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">无上限</Badge>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <span>✔️</span> 
                <div>
                  <span>链接点击 +1 次/点击</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">上限100次/周</Badge>
                </div>
              </li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>默认AI模型（不可选）</span></li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>仅支持小红书、抖音</span></li>
              <li className="flex items-center space-x-3"><span>❌</span> <span className="line-through">品牌库</span></li>
              <li className="flex items-center space-x-3"><span>❌</span> <span className="line-through">团队协作</span></li>
            </ul>
            <Button variant="secondary" className="mt-8 w-full" asChild>
              <Link to="/adapt">开始使用</Link>
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-blue-600 p-8 flex flex-col relative shadow-2xl">
            <span className="absolute top-0 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">最受欢迎</span>
            <h3 className="text-2xl font-semibold">专业版</h3>
            <p className="mt-2 text-gray-500">适合个人创作者和小型团队</p>
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <p className="text-5xl font-extrabold">
                  {billing === "monthly" ? "¥29.9" : "¥288"}
                </p>
                <span className="text-gray-400 line-through font-medium text-xl">
                  {billing === "monthly" ? "¥39.9" : "¥478.8"}
                </span>
              </div>
              <p className="text-gray-500">{billing === "monthly" ? "/月" : "/年"}</p>
              
              {/* Countdown timer */}
              <div className="mt-2 flex items-center">
                <span className="text-red-500 font-semibold text-sm">限时促销优惠</span>
                <span className="ml-2 inline-block bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-mono font-bold">
                  2025年9月30日24:00前
                </span>
              </div>
            </div>
            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
              <li className="flex items-center space-x-3">
                <span>✔️</span> 
                <div>
                  <span>无限次生成</span>
                  <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">高级功能</Badge>
                </div>
              </li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>支持所有平台</span></li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>基础品牌库（开发中）</span></li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>可以选择更多AI模型（如GPT-4o、DeepSeek V3等）</span></li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>可优先使用主流AI平台最新模型</span></li>
              
            </ul>
            <Button 
              className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
              onClick={handleProPlanClick}
            >
              立即抢购
            </Button>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border border-gray-200 p-8 flex flex-col">
            <h3 className="text-2xl font-semibold">企业版</h3>
            <p className="mt-2 text-gray-500">适合中大型企业</p>
            <p className="mt-6 text-5xl font-extrabold">定制</p>
            <p className="text-gray-500">按需</p>
            <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
              <li className="flex items-center space-x-3"><span>✔️</span> <span>专业版所有功能</span></li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>完整品牌库功能</span></li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>高级团队协作与权限管理</span></li>

              <li className="flex items-center space-x-3"><span>✔️</span> <span>专属客户支持</span></li>
              <li className="flex items-center space-x-3"><span>✔️</span> <span>定制化解决方案</span></li>
            </ul>
            <Button 
              variant="default" 
              className="mt-8 w-full bg-gray-900 hover:bg-black"
              onClick={() => {
                window.location.href = "mailto:contact@wenpaiai.com?subject=企业版咨询&body=您好，我想了解文派企业版的相关信息。";
              }}
            >
              联系我们
            </Button>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">所有版本都包含核心功能</p>
          <div className="flex justify-center gap-8 flex-wrap">
            <span className="inline-flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              支持主流内容平台
            </span>
            <span className="inline-flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              平台风格内容适配
            </span>
            <span className="inline-flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              可视化生成过程
            </span>
            <span className="inline-flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              个性化设置保存
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}