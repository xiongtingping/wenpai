import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Sparkles, Zap, TrendingUp, Palette, FileText, Globe, Users } from "lucide-react"
import { Link } from "react-router-dom"

export function FeaturesSection() {
  const [, setActiveTab] = useState("adapt")
  
  return (
    <section id="features" className="py-20 opacity-0 animate-fadeIn">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">全方位赋能新媒体创意工作者</h2>
          <p className="mt-4 text-lg text-gray-600">从内容适配到创意生成，从热点追踪到品牌管理，让您专注于创意，释放生产力。</p>
        </div>
        
        {/* 功能权限概览 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                免费10次/月
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-2">AI内容适配</h3>
            <p className="text-gray-600 text-sm">智能适配各平台风格，一键生成符合平台特性的高质量内容</p>
          </Card>
          
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="w-8 h-8 text-green-600" />
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                完全免费
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-2">创意工具</h3>
            <p className="text-gray-600 text-sm">九宫格创意魔方、营销日历、文案管理，快速生成创意内容</p>
          </Card>
          
          <Card className="p-6 border-2 border-green-200 bg-green-50">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                完全免费
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-2">热点话题</h3>
            <p className="text-gray-600 text-sm">实时获取各平台热门话题和趋势，为创作提供灵感和方向</p>
          </Card>
          
          <Card className="p-6 border-2 border-purple-200 bg-purple-50">
            <div className="flex items-center justify-between mb-4">
              <Crown className="w-8 h-8 text-purple-600" />
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                <Crown className="w-3 h-3 mr-1" />
                专业版
              </Badge>
            </div>
            <h3 className="font-bold text-lg mb-2">专业功能</h3>
            <p className="text-gray-600 text-sm">Emoji表情库、内容提取、品牌资料库、一键转发等高级功能</p>
          </Card>
        </div>
        
        <div className="mt-16">
          <Tabs 
            defaultValue="adapt" 
            className="max-w-4xl mx-auto"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="adapt" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                内容适配
              </TabsTrigger>
              <TabsTrigger value="creative" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                创意工具
              </TabsTrigger>
              <TabsTrigger value="hot" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                热点话题
              </TabsTrigger>
              <TabsTrigger value="pro" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                专业版
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="adapt">
              <Card className="mt-6 border-0 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-6">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">智能平台适配</h3>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        免费10次/月
                      </Badge>
                    </div>
                    <p className="mt-4 text-lg text-gray-600">
                      我们的AI学习了数百万篇各平台爆款内容，能自动生成符合平台文化的脚本、文案和文章结构，让你的内容获得更高点击和互动。
                    </p>
                    <div className="mt-6">
                      <Link to="/adapt">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          立即试用
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-blue-50 h-[300px] rounded-lg flex items-center justify-center text-blue-500 font-semibold relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 animate-pulse"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-6xl mb-4 animate-bounce">🤖</div>
                      <div className="text-lg font-bold">智能适配演示</div>
                      <div className="text-sm text-blue-600 mt-2">AI正在分析内容...</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="creative">
              <Card className="mt-6 border-0 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-6">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">创意工具套件</h3>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        完全免费
                      </Badge>
                    </div>
                    <p className="mt-4 text-lg text-gray-600">
                      九宫格创意魔方、营销日历、文案管理、任务清单等创意工具，帮助您快速生成创意内容，提升创作效率，让创意工作更加高效。
                    </p>
                    <div className="mt-6">
                      <Link to="/creative-studio">
                        <Button className="bg-green-600 hover:bg-green-700">
                          开始创作
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-green-50 h-[300px] rounded-lg flex items-center justify-center text-green-500 font-semibold relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 animate-pulse"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-6xl mb-4 animate-spin">🎨</div>
                      <div className="text-lg font-bold">创意工具演示</div>
                      <div className="text-sm text-green-600 mt-2">正在生成创意...</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="hot">
              <Card className="mt-6 border-0 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-6">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">全网热点话题</h3>
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        完全免费
                      </Badge>
                    </div>
                    <p className="mt-4 text-lg text-gray-600">
                      实时监控各大平台热门话题，智能分析热点趋势，为您的创作提供灵感。结合热点话题，让您的内容更具时效性和传播力。
                    </p>
                    <div className="mt-6">
                      <Link to="/hot-topics">
                        <Button className="bg-orange-600 hover:bg-orange-700">
                          查看热点
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-orange-50 h-[300px] rounded-lg flex items-center justify-center text-orange-500 font-semibold relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 animate-pulse"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-6xl mb-4 animate-pulse">🔥</div>
                      <div className="text-lg font-bold">热门话题演示</div>
                      <div className="text-sm text-orange-600 mt-2">正在获取最新热点...</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="pro">
              <Card className="mt-6 border-0 shadow-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-6">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">专业版功能</h3>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                        <Crown className="w-3 h-3 mr-1" />
                        专业版
                      </Badge>
                    </div>
                    <p className="mt-4 text-lg text-gray-600">
                      升级专业版，解锁Emoji表情库、内容提取、品牌资料库、一键转发等高级功能，享受无限制的内容适配次数，让您的工作效率更上一层楼。
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Palette className="w-4 h-4" />
                        Emoji表情库 - 一键生成符合平台调性的表情组合
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        内容提取 - 智能提取网页、文档内容，支持多种格式转换
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        品牌资料库 - AI自动学习品牌调性，确保品牌声音一致
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4" />
                        一键转发 - 支持一键将内容转发到多个平台
                      </div>
                    </div>
                    <div className="mt-6">
                      <a href="#pricing">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Crown className="w-4 h-4 mr-2" />
                          升级专业版
                        </Button>
                      </a>
                    </div>
                  </div>
                  <div className="bg-purple-50 h-[300px] rounded-lg flex items-center justify-center text-purple-500 font-semibold relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 animate-pulse"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-6xl mb-4 animate-bounce">👑</div>
                      <div className="text-lg font-bold">专业版演示</div>
                      <div className="text-sm text-purple-600 mt-2">解锁更多高级功能...</div>
                    </div>
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