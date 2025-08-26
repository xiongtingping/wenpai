// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu, HelpCircle } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { LogoWithText } from "@/components/ui/ThemeAwareLogo"
import { PermissionTestButton } from "@/components/dev/PermissionTestButton"

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
    },
    {
      title: "主题切换",
      content: "提供多种主题选择：体验版用户可使用浅色主题，专业版用户可使用浅色/深色主题，高级版用户可使用全部主题（浅色/深色/蓝色/米色/绿色）。"
    }
  ]
  
  return (
    <PopoverContent className="w-[380px]">
      <ScrollArea className="h-[400px] p-4">
        <h3 className="text-lg font-semibold mb-4">文派使用指南</h3>
        {topics.map((topic, index) => (
          <div key={index} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-primary font-medium">{topic.title}</h4>
            </div>
            <p className="text-foreground text-sm leading-relaxed">{topic.content}</p>
          </div>
        ))}
        <div className="mb-6">
          <h4 className="text-primary font-medium mb-2">平台风格差异</h4>
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
        <div className="pt-2">
          <p className="text-xs text-muted-foreground">更多详细使用说明将持续更新</p>
        </div>
      </ScrollArea>
    </PopoverContent>
  )
}

export function Header() {
  const isMobile = useIsMobile()
  const { user, isAuthenticated, login, register, resetAuthState } = useAuth()
  const navigate = useNavigate()

  /**
   * 检查是否应该显示升级按钮
   * 只有高级版用户（且在有效期内）不显示，其他用户都显示
   */
  const shouldShowUpgradeButton = () => {
    // 未登录用户显示
    if (!user || typeof user !== 'object') return true;

    const userObj = user as Record<string, unknown>;

    // 检查是否是高级版用户
    const isPremiumUser = userObj.tier === 'premium' ||
                         userObj.plan === 'premium' ||
                         userObj.subscriptionTier === 'premium' ||
                         userObj.userPlan === 'premium';

    // 如果是高级版用户，检查是否在有效期内
    if (isPremiumUser) {
      const subscriptionEndDate = userObj.subscriptionEndDate || userObj.endDate || userObj.expireDate;

      if (subscriptionEndDate) {
        const endDate = new Date(subscriptionEndDate as string);
        const now = new Date();

        // 如果在有效期内，不显示升级按钮
        if (endDate > now) {
          return false;
        }
      }
    }

    // 其他情况都显示升级按钮：
    // - 未登录用户
    // - 体验版用户 (trial)
    // - 专业版用户 (pro)
    // - 高级版用户但已过期
    return true;
  };
  
  return (
    <header className="theme-header-bg sticky top-0 z-50 shadow-e0 backdrop-blur-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo - 主题感知的熊猫Logo */}
        <Link to="/" className="group">
          <LogoWithText
            size="lg"
            textSize="xl"
            textClassName="rainbow-logo-text"
            showHoverEffect={true}
            showBackground={true}
          />
        </Link>
        
        {/* Desktop Menu */}
        {!isMobile && (
          <div className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition" onClick={() => {
              console.log('Header AI内容适配器按钮被点击');
              console.log('当前认证状态:', isAuthenticated);

              try {
                if (isAuthenticated) {
                  console.log('用户已登录，跳转到AI内容适配器页面');
                  navigate('/new-adapt');
                } else {
                  console.log('用户未登录，调用登录函数');
                  if (typeof login === 'function') {
                    login('/new-adapt');
                  } else {
                    console.error('❌ login函数不可用');
                    navigate('/login');
                  }
                }
              } catch (error) {
                console.error('❌ Header按钮点击出错:', error);
                navigate('/login');
              }
            }}>
              AI内容适配器
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary transition" onClick={() => {
              if (isAuthenticated) {
                navigate('/hot-topics');
              } else {
                login('/hot-topics');
              }
            }}>
              全网雷达
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition" onClick={() => {
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
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition" onClick={() => {
              if (isAuthenticated) {
                navigate('/bookmark');
              } else {
                login('/bookmark');
              }
            }}>
              我的收藏
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition" onClick={() => {
              if (isAuthenticated) {
                navigate('/brand-library');
              } else {
                login('/brand-library');
              }
            }}>
              品牌库
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition" onClick={() => {
              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              定价方案
            </Button>
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

            {/* 主题切换 */}
            <ThemeToggle />

            {/* 权限测试按钮 (仅开发环境) */}
            <PermissionTestButton />

            {isAuthenticated ? (
              <UserAvatar 
                size="md"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => login()}>
                  登录
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    register();
                  }}
                  className="bg-primary hover:bg-primary/90"
                  type="button" // 明确指定按钮类型
                >
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
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    if (isAuthenticated) {
                      navigate('/adapt');
                    } else {
                      login('/adapt');
                    }
                  }}>
                    AI内容适配器
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    if (isAuthenticated) {
                      navigate('/hot-topics');
                    } else {
                      login('/hot-topics');
                    }
                  }}>
                    全网雷达
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    if (isAuthenticated) {
                      navigate('/creative-studio');
                    } else {
                      login('/creative-studio');
                    }
                  }}>
                    创意魔方
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    if (isAuthenticated) {
                      navigate('/library');
                    } else {
                      login('/library');
                    }
                  }}>
                    我的资料库
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    if (isAuthenticated) {
                      navigate('/brand-library');
                    } else {
                      login('/brand-library');
                    }
                  }}>
                    品牌库
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    定价方案
                  </Button>
                </SheetClose>

                <Button variant="ghost" className="flex items-center justify-start px-2 gap-1">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  帮助文档
                </Button>

                {/* 移动端主题切换 */}
                <div className="flex items-center justify-start px-2">
                  <span className="text-sm font-medium mr-3">切换主题</span>
                  <ThemeToggle />
                </div>

                {/* 移除分割线 */}
                
                {isAuthenticated ? (
                  <UserAvatar 
                    size="md"
                  />
                ) : (
                  <div className="flex flex-col space-y-2">
                    <SheetClose asChild>
                      <Button variant="outline" onClick={() => login()}>
                        登录
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          register();
                        }}
                        type="button" // 明确指定按钮类型
                      >
                        注册
                      </Button>
                    </SheetClose>
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