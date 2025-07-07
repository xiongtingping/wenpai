import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, HelpCircle, Crown, Sparkles } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import UserAvatar from "@/components/auth/UserAvatar"
import { useToast } from "@/hooks/use-toast"

const HelpDocumentation = () => {
  const topics = [
    {
      title: "内容适配",
      content: "文派AI可根据平台特性智能转换您的内容，调整文风、排版和互动元素，无需手动修改即可适配各平台。免费版每月10次，专业版无限制使用。"
    },
    {
      title: "创意工具",
      content: "九宫格创意魔方、营销日历、文案管理等创意工具，帮助您快速生成创意内容，提升创作效率。所有用户免费使用。"
    },
    {
      title: "全网热点话题",
      content: "实时获取各平台热门话题和趋势，为您的创作提供灵感和方向。所有用户免费使用。"
    },
    {
      title: "Emoji表情库",
      content: "丰富的emoji表情库，一键生成符合平台调性的表情组合，提升内容互动性。专业版功能。"
    },
    {
      title: "内容提取",
      content: "智能提取网页、文档内容，支持多种格式转换，快速获取创作素材。专业版功能。"
    },
    {
      title: "品牌资料库",
      content: "上传品牌资料，AI自动学习品牌调性，确保跨平台传播时品牌声音一致。专业版功能。"
    },
    {
      title: "一键转发",
      content: "支持一键将内容转发到多个平台，自动适配各平台格式要求。专业版功能。"
    }
  ]
  
  return (
    <PopoverContent className="w-[380px]">
      <ScrollArea className="h-[400px] p-4">
        <h3 className="text-lg font-semibold mb-4">文派使用指南</h3>
        {topics.map((topic, index) => (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-blue-600 font-medium">{topic.title}</h4>
              {topic.content.includes('专业版') && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  专业版
                </Badge>
              )}
              {topic.content.includes('免费') && !topic.content.includes('专业版') && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  免费
                </Badge>
              )}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{topic.content}</p>
          </div>
        ))}
        <div className="mb-6">
          <h4 className="text-blue-600 font-medium mb-2">平台风格差异</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">小红书</span>：轻松活泼风格，多用emoji表情，个人化视角，首尾互动引导</p>
            <p><span className="font-medium">公众号</span>：专业严谨风格，段落清晰，标题引人，适合深度阅读</p>
            <p><span className="font-medium">抖音</span>：简短有力台词，节奏感强，互动性高，引人共鸣</p>
            <p><span className="font-medium">B站</span>：二次元文化元素，圈层词汇，专业知识融合娱乐表达</p>
            <p><span className="font-medium">知乎</span>：逻辑严密，分点论述，理性客观，有深度的专业分析</p>
            <p><span className="font-medium">微博</span>：简短有话题性，互动元素多，情绪化表达</p>
            <p><span className="font-medium">视频号</span>：亲和力强，互动感高，视觉描述清晰</p>
            <p><span className="font-medium">X(推特)</span>：精简直接，多用标签，国际化表达</p>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">更多详细使用说明将持续更新</p>
        </div>
      </ScrollArea>
    </PopoverContent>
  )
}

export function Header() {
  const isMobile = useIsMobile()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="https://static.devv.ai/ep7eod98hhq8.png" alt="文派" className="h-8 w-8" />
          <span className="font-bold text-xl text-gray-800">文派</span>
        </Link>
        
        {/* Desktop Menu */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/adapt" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              AI内容适配
              <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                免费10次/月
              </Badge>
            </Link>
            <Link to="/creative-studio" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              创意工具
              <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200 text-xs">
                免费
              </Badge>
            </Link>
            <Link to="/hot-topics" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              热点话题
              <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200 text-xs">
                免费
              </Badge>
            </Link>
            <Link to="/emojis" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              Emoji表情库
              <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                专业版
              </Badge>
            </Link>
            <Link to="/content-extractor" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              内容提取
              <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                专业版
              </Badge>
            </Link>
            <Link to="/brand-library" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              品牌资料库
              <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                专业版
              </Badge>
            </Link>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">定价方案</a>
          </div>
        )}
        
        {/* Action Buttons */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  帮助文档
                </Button>
              </PopoverTrigger>
              <HelpDocumentation />
            </Popover>
            
            {isAuthenticated ? (
              <UserAvatar 
                user={user}
                showDropdown={true}
                size="md"
                showUsername={false}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  登录
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700">
                  免费注册
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/adapt" className="text-lg font-medium py-2 flex items-center justify-between">
                  AI内容适配
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    免费10次/月
                  </Badge>
                </Link>
                <Link to="/creative-studio" className="text-lg font-medium py-2 flex items-center justify-between">
                  创意工具
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    免费
                  </Badge>
                </Link>
                <Link to="/hot-topics" className="text-lg font-medium py-2 flex items-center justify-between">
                  热点话题
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    免费
                  </Badge>
                </Link>
                <Link to="/emojis" className="text-lg font-medium py-2 flex items-center justify-between">
                  Emoji表情库
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                </Link>
                <Link to="/content-extractor" className="text-lg font-medium py-2 flex items-center justify-between">
                  内容提取
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                </Link>
                <Link to="/brand-library" className="text-lg font-medium py-2 flex items-center justify-between">
                  品牌资料库
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </Badge>
                </Link>
                <a href="#pricing" className="text-lg font-medium py-2">定价方案</a>

                <Button variant="ghost" className="flex items-center justify-start px-2 gap-1">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  帮助文档
                </Button>
                <hr className="my-4" />
                
                {isAuthenticated ? (
                  <UserAvatar 
                    user={user}
                    showDropdown={true}
                    size="md"
                    showUsername={true}
                  />
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" onClick={() => navigate('/login')}>
                      登录
                    </Button>
                    <Button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700">
                      免费注册
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </header>
  )
}