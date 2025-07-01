import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          文派：<span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">你的专属AI内容策略师</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          一键智能改写任意内容，让内容精准适配每一个平台。精准适配小红书、公众号、抖音、B站、知乎、微博等平台风格，确保内容风格各异、表达一致，始终严守品牌口径。
        </p>
        <div className="mt-10">
          <Link to="/adapt">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-bold py-6 px-8 rounded-lg shadow-lg text-lg"
            >
              立即免费试用 →
            </Button>
          </Link>
          {/* Removed "无需信用卡，10秒完成注册" text */}
          <p className="mt-6 text-sm text-green-600 font-medium">
            <span className="inline-flex items-center bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <span className="mr-1">⏱️</span>
              每天帮您节省45分钟内容适配时间
            </span>
          </p>
        </div>

        {/* Product Demo Visual */}
        <div className="mt-16 max-w-5xl mx-auto p-4 md:p-8 bg-gray-100 rounded-2xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Input */}
            <Card className="p-6 border-0 shadow-md">
              <h3 className="font-bold text-lg mb-2 text-left flex items-center">
                <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-gray-700 text-xs">原</div>
                原始文案
              </h3>
              <div className="text-left text-gray-700 space-y-3">
                <p>今天试了一款XXX身体乳，味道太治愈了！🌿</p>
                <p>像小时候喝的牛奶糖味道，甜而不腻，闻着就想咬一口！</p>
                <p>质地是那种冰淇淋慕斯感，推开超水润，吸收嗖嗖的，一点不粘腻。秋冬干皮姐妹们，闭眼冲它！
                #身体乳 #秋冬护肤 #干皮救星</p>
              </div>
            </Card>
            {/* Output */}
            <div className="space-y-4">
              {/* Douyin Output */}
              <Card className="p-4 flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-md transform transition-transform hover:scale-105">
                <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center text-xs">抖音</div>
                <div className="text-left">
                  <h4 className="font-semibold flex items-center">
                    抖音脚本
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">AI升级</span>
                  </h4>
                  <p className="text-sm text-gray-600">【镜头特写】干皮姐妹们！秋冬身体乳还在乱选吗？【试用】这个牛奶糖味道，一秒回到童年！【涂抹】冲！</p>
                </div>
              </Card>
              {/* Zhihu Output */}
              <Card className="p-4 flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-blue-100 border-0 shadow-md transform transition-transform hover:scale-105">
                <div className="h-10 w-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">知乎</div>
                <div className="text-left">
                  <h4 className="font-semibold flex items-center">
                    知乎风格
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">AI升级</span>
                  </h4>
                  <p className="text-sm text-gray-600">从成分党角度分析，秋冬身体乳的核心诉求是保湿与肤感。XXX身体乳在采用传统保湿剂的基础上，通过其香氛设计提升了用户体验...</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}