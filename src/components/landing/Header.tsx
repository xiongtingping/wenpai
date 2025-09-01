// 🔧 [UNIFIED_AUTH_ROLLBACK_v2025.08.27] 回滚到历史成功版本架构
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

import { UserAvatar } from "@/components/auth/UserAvatar"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { LogoWithText } from "@/components/ui/ThemeAwareLogo"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { Home, Radar, Sparkles, Library, FolderOpen, CreditCard } from "lucide-react"




export function Header() {
  const isMobile = useIsMobile()
  const { user, isAuthenticated, login, register } = useUnifiedAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

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

  // 设置 CSS 变量 --header-height 以便各处自适应
  useEffect(() => {
    const el = document.querySelector('header.theme-header-bg') as HTMLElement | null;
    const update = () => {
      const h = el?.offsetHeight || 64;
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <header className="theme-header-bg fixed top-0 left-0 right-0 z-[99999] shadow-lg backdrop-blur-md border-b border-border/10" style={{ position: 'fixed' }}>
      <nav className="container mx-auto px-6 py-4 flex items-center">
        {/* Logo - 固定在左侧 */}
        <div className="flex-shrink-0">
          <Link to="/" className="group">
            <LogoWithText
              size="lg"
              textSize="xl"
              textClassName="rainbow-logo-text"
              showHoverEffect={true}
              showBackground={true}
            />
          </Link>
        </div>

        {/* Desktop Menu - 居中显示 */}
        {!isMobile && (
          <div className="flex-1 flex justify-center">
            <NavBar
              positionClassName="relative z-[60]"
              items={[
                { name: t('nav.home'), url: '/', icon: Home, onClick: (e) => { e.preventDefault(); navigate('/'); } },
                { name: t('nav.adapt'), url: '/adapt', icon: Sparkles, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/adapt'); } else { login('/adapt'); } } },
                { name: t('nav.hotTopics'), url: '/hot-topics', icon: Radar, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/hot-topics'); } else { login('/hot-topics'); } } },
                { name: t('nav.creative'), url: '/creative-studio', icon: Sparkles, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/creative-studio'); } else { login('/creative-studio'); } } },
                { name: t('nav.bookmark'), url: '/library', icon: FolderOpen, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/library'); } else { login('/library'); } } },
                { name: t('nav.brandLibrary'), url: '/brand-library', icon: Library, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/brand-library'); } else { login('/brand-library'); } } },
                { name: t('nav.upgrade'), url: '/payment', icon: CreditCard, onClick: (e) => { e.preventDefault(); navigate('/payment'); } },
              ]}
            />
          </div>
        )}

        {/* Action Buttons - 固定在右侧 */}
        {!isMobile && (
          <div className="flex-shrink-0 hidden md:flex items-center space-x-4 relative z-[60]">
            {/* 主题切换 */}
            <LanguageSwitcher />
            <ThemeToggle />

            {/* 开发环境权限切换 */}


            {isAuthenticated ? (
              <UserAvatar
                size="md"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => {
                  console.log('🧪 Header 登录按钮点击');
                  try {
                    setTimeout(() => {
                      try {
                        const root = document.querySelector('.authing-ant-modal-root') as HTMLElement | null;
                        const wrap = root?.querySelector('.authing-ant-modal-wrap') as HTMLElement | null;
                        const modal = root?.querySelector('.authing-ant-modal') as HTMLElement | null;
                        const rect = root?.getBoundingClientRect();
                        const elementsAtCenter = document.elementsFromPoint(window.innerWidth/2, window.innerHeight/2)
                          .slice(0,5)
                          .map(el => (el as HTMLElement).className || (el as HTMLElement).id || (el as HTMLElement).tagName);
                        console.log('🧪 Header DOM Probe (pre-login):', {
                          hasRoot: !!root, rect,
                          visibility: root ? getComputedStyle(root).visibility : 'n/a',
                          opacity: root ? getComputedStyle(root).opacity : 'n/a',
                          zIndex: root ? getComputedStyle(root).zIndex : 'n/a',
                          transform: root ? getComputedStyle(root).transform : 'n/a',
                          scrollY: window.scrollY,
                          elementsAtCenter
                        });
                      } catch (e) { console.warn('🧪 Header DOM Probe error(pre):', e); }
                    }, 0);
                  } catch (err) { console.warn('Header DOM probe failed', err); }
                  login();
                }}>
                  {t('auth.login')}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    register();
                  }}
                  className="bg-primary hover:bg-primary/90"
                  type="button" // 明确指定按钮类型
                >
                  {t('auth.register')}
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
                    {t('nav.adapt')}
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
                    {t('nav.hotTopics')}
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
                    {t('nav.creative')}
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
                    {t('nav.bookmark')}
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
                    {t('nav.brandLibrary')}
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    navigate('/payment');
                  }}>
                    {t('nav.upgrade')}
                  </Button>
                </SheetClose>

                {/* 移动端主题切换 */}
                <div className="flex items-center justify-start px-2">
                  <span className="text-sm font-medium mr-3">{t('settings.theme')}</span>
                  <LanguageSwitcher />
            <ThemeToggle />
                </div>

                {/* 移动端开发环境权限切换 */}
                <div className="flex items-center justify-start px-2">
                  <span className="text-sm font-medium mr-3">{t('settings.devTools')}</span>
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
                        {t('auth.login')}
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
                        {t('auth.register')}
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