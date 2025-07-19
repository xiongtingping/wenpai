import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, HelpCircle } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { useToast } from "@/hooks/use-toast"

const HelpDocumentation = () => {
  const topics = [
    {
      title: "内容适配",
      content: "文派AI可根据平台特性智能转换您的内容，调整文风、排版和互动元素，无需手动修改即可适配各平台。"
    },
    {
      title: "创意魔方",
      content: "九宫格创意魔方、营销日历、文案管理等创意工具，帮助您快速生成创意内容，提升创作效率。"
    },
    {
      title: "全网雷达",
      content: "全网雷达"
    },
    {
      title: "我的资料库",
      content: "管理网络收藏、内容提取、文案库等，为您的创作提供丰富的素材支持。"
    },
    {
              title: "内容提取",
      content: "智能提取网页、文档内容，支持多种格式转换，快速获取创作素材。"
    },
    {
      title: "Emoji生成器",
      content: "AI驱动的emoji图片生成器，支持多种风格和定制选项，提升内容视觉表现力。"
    },
    {
      title: "品牌库",
      content: "品牌库"
    },
    {
      title: "一键转发",
      content: "支持一键将内容转发到多个平台，自动适配各平台格式要求。"
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
  const { user, isAuthenticated, login, register } = useUnifiedAuth()
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
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition" onClick={() => {
              console.log('Header AI内容适配器按钮被点击');
              console.log('当前认证状态:', isAuthenticated);
              
              if (isAuthenticated) {
                console.log('用户已登录，跳转到适配页面');
                navigate('/adapt');
              } else {
                console.log('用户未登录，直接弹出Authing Guard弹窗');
                login('/adapt');
              }
            }}>
              AI内容适配器
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition" onClick={() => {
              console.log('Header 创意魔方按钮被点击');
              console.log('当前认证状态:', isAuthenticated);
              
              if (isAuthenticated) {
                console.log('用户已登录，跳转到创意魔方页面');
                navigate('/creative-studio');
              } else {
                console.log('用户未登录，直接弹出Authing Guard弹窗');
                login('/creative-studio');
              }
            }}>
              创意魔方
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition" onClick={() => {
              if (isAuthenticated) {
                navigate('/hot-topics');
              } else {
                login('/hot-topics');
              }
            }}>
              全网雷达
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition" onClick={() => {
              if (isAuthenticated) {
                navigate('/library');
              } else {
                login('/library');
              }
            }}>
              我的资料库
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition" onClick={() => {
              if (isAuthenticated) {
                navigate('/brand-library');
              } else {
                login('/brand-library');
              }
            }}>
              品牌库
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 transition" onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              定价方案
            </Button>
          </div>
        )}
        
        {/* Action Buttons */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              onClick={() => {
                if (isAuthenticated) {
                  // 已登录用户直接跳转到支付页面
                  navigate('/payment');
                } else {
                  // 未登录用户先登录再跳转
                  login('/payment');
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              立即解锁高级功能
            </Button>
            
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
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => login()}>
                  登录
                </Button>
                <Button onClick={() => register()} className="bg-blue-600 hover:bg-blue-700">
                  注册
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
                <Button 
                  onClick={() => {
                    if (isAuthenticated) {
                      // 已登录用户直接跳转到支付页面
                      navigate('/payment');
                    } else {
                      // 未登录用户先登录再跳转
                      login('/payment');
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:shadow-lg w-full"
                >
                  立即解锁高级功能
                </Button>
                
                <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                  if (isAuthenticated) {
                    navigate('/adapt');
                  } else {
                    login('/adapt');
                  }
                }}>
                  AI内容适配器
                </Button>
                <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                  if (isAuthenticated) {
                    navigate('/creative-studio');
                  } else {
                    login('/creative-studio');
                  }
                }}>
                  创意魔方
                </Button>
                <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                  if (isAuthenticated) {
                    navigate('/hot-topics');
                  } else {
                    login('/hot-topics');
                  }
                }}>
                  全网雷达
                </Button>
                <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                  if (isAuthenticated) {
                    navigate('/library');
                  } else {
                    login('/library');
                  }
                }}>
                  我的资料库
                </Button>
                <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                  if (isAuthenticated) {
                    navigate('/brand-library');
                  } else {
                    login('/brand-library');
                  }
                }}>
                  品牌库
                </Button>
                <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  定价方案
                </Button>

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
                  />
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" onClick={() => login()}>
                      登录
                    </Button>
                    <Button onClick={() => register()}>
                      注册
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