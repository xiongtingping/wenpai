import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("adapt")
  
  return (
    <section id="features" className="py-20 opacity-0 animate-fadeIn">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">为高效内容团队打造的核心功能</h2>
          <p className="mt-4 text-lg text-gray-600">我们不仅仅是改写，更是您的智能内容策略中枢。</p>
        </div>
        
        <div className="mt-12">
          <Tabs 
            defaultValue="adapt" 
            className="max-w-3xl mx-auto"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="adapt">智能平台适配</TabsTrigger>
              <TabsTrigger value="brand">品牌库</TabsTrigger>
              <TabsTrigger value="collab">高效协作</TabsTrigger>
            </TabsList>
            
            <TabsContent value="adapt">
              <Card className="mt-6 border-0 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-6">
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900">不止于改写，更是深度"翻译"</h3>
                    <p className="mt-4 text-lg text-gray-600">
                      我们的AI学习了数百万篇各平台爆款内容，能自动生成符合平台文化的脚本、文案和文章结构，让你的内容获得更高点击和互动。
                    </p>
                  </div>
                  <div className="bg-blue-50 h-[300px] rounded-lg flex items-center justify-center text-blue-500 font-semibold">
                    智能适配演示
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="brand">
              <Card className="mt-6 border-0 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-6">
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900">让AI说"品牌话"</h3>
                    <p className="mt-4 text-lg text-gray-600">
                      上传您的品牌资料库，AI在创作时会自动遵循您的语言规范，融入品牌价值，规避公关风险。分发再多平台，品牌形象始终如一。
                    </p>
                  </div>
                  <div className="bg-gray-200 h-[300px] rounded-lg flex items-center justify-center text-gray-700 font-semibold">
                    品牌库演示
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="collab">
              <Card className="mt-6 border-0 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-6">
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900">内容工作流，从未如此顺畅</h3>
                    <p className="mt-4 text-lg text-gray-600">
                      生成内容后，一键分享链接给团队审核。支持导出多种格式，无缝对接到您现有的协同工具中，告别繁琐的复制粘贴。
                    </p>
                  </div>
                  <div className="bg-red-50 h-[300px] rounded-lg flex items-center justify-center text-red-500 font-semibold">
                    团队协作演示
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}