import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, HelpCircle, UserPlus } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const HelpDocumentation = () => {
  const topics = [
    {
      title: "内容适配",
      content: "文派AI可根据平台特性智能转换您的内容，调整文风、排版和互动元素，无需手动修改即可适配各平台。选择目标平台，调整参数，一键生成符合平台特性的高质量内容。"
    },
    {
      title: "品牌一致性",
      content: "上传品牌资料库中的品牌手册、文案指南等资料，AI将自动学习并保持您的品牌语调、核心信息和表达方式，确保跨平台传播时品牌声音始终一致。"
    },
    {
      title: "平台特性优化",
      content: "文派深度分析各平台算法偏好和用户行为，为内容添加平台特有元素：如小红书的emoji表情、公众号的排版格式、视频平台的互动设计等，提升内容表现。"
    },
    {
      title: "使用次数与邀请",
      content: "每月免费赠送20次内容适配机会。邀请朋友注册可获得额外使用次数：每成功邀请1人注册，双方各获20次；每次有效链接点击奖励1次（同IP仅奖励一次）。"
    }
  ]
  
  return (
    <PopoverContent className="w-[380px]">
      <ScrollArea className="h-[400px] p-4">
        <h3 className="text-lg font-semibold mb-4">文派使用指南</h3>
        {topics.map((topic, index) => (
          <div key={index} className="mb-6">
            <h4 className="text-blue-600 font-medium mb-2">{topic.title}</h4>
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
  
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="https://static.devv.ai/ep7eod98hhq8.png" alt="文派" className="h-8 w-8" />
          <span className="font-bold text-xl text-gray-800">文派</span>
        </Link>
        
        {/* Desktop Menu - Reordered as requested */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition">产品功能</a>
            <Link to="/brand-library" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              品牌库
              <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200">
                开发中
              </Badge>
            </Link>
            <Link to="/invite" className="text-gray-600 hover:text-blue-600 transition flex items-center">
              邀请奖励
              <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
                登录可查
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
            
            {/* Direct login/register button - no dropdown */}
            <Link to="/login-register">
              <Button variant="outline" className="flex items-center gap-1">
                <UserPlus className="h-4 w-4 mr-1" />
                登录/注册
              </Button>
            </Link>
            
            <Link to="/adapt">
              <Button className="bg-blue-600 hover:bg-blue-700">免费开始</Button>
            </Link>
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
                {/* Reordered mobile menu items */}
                <a href="#features" className="text-lg font-medium py-2">产品功能</a>
                <Link to="/brand-library" className="text-lg font-medium py-2 flex items-center">
                  品牌库
                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                    开发中
                  </Badge>
                </Link>
                <Link to="/invite" className="text-lg font-medium py-2 flex items-center">
                  邀请奖励
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    登录可查
                  </Badge>
                </Link>
                <a href="#pricing" className="text-lg font-medium py-2">定价方案</a>
                <a href="#testimonials" className="text-lg font-medium py-2">客户案例</a>

                <Button variant="ghost" className="flex items-center justify-start px-2 gap-1">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  帮助文档
                </Button>
                <hr className="my-4" />
                
                {/* Direct login/register for mobile */}
                <Link to="/login-register">
                  <Button variant="outline" className="w-full flex items-center justify-center">
                    <UserPlus className="h-4 w-4 mr-1" />
                    登录/注册
                  </Button>
                </Link>
                
                <Link to="/adapt">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">免费开始</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </header>
  )
}