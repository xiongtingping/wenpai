// Header组件 - 统一导航栏
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LogoWithText } from "@/components/ui/ThemeAwareLogo";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Home, Radar, Sparkles, Library, FolderOpen, CreditCard } from "lucide-react";

export function Header() {
  const isMobile = useIsMobile();
  const { user, isAuthenticated, login, register } = useUnifiedAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const headerRef = useRef<HTMLElement>(null);
  
  // 获取当前主题
  const [currentTheme, setCurrentTheme] = React.useState<string>('light');
  
  React.useEffect(() => {
    // 检测当前主题
    const detectTheme = () => {
      const theme = localStorage.getItem('theme') || 'light';
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : theme);
    };
    
    // 初始检测
    detectTheme();
    
    // 监听主题变化
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    
    return () => observer.disconnect();
  }, []);

  // 确保页面初始滚动位置
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // 根据主题动态设置样式
  const getThemeStyles = () => {
    const isDark = currentTheme === 'dark';
    
    return {
      backgroundColor: 'hsl(var(--background) / 0.95)', // 使用背景色设计令牌
      color: 'hsl(var(--foreground))', // 使用前景色设计令牌
      borderBottom: '1px solid hsl(var(--border) / 0.1)' // 使用边框色设计令牌
    };
  };

  return (
    <div 
      ref={headerRef}
      style={{
        position: 'fixed',
        top: '0px', // 顶部固定位置
        left: '0px',
        right: '0px',
        width: '100vw',
        height: '64px',
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif', // 现代字体栈
        ...getThemeStyles() // 动态主题样式
      }}
    >
      <nav 
        className="container mx-auto flex items-center h-full px-4 py-2"
      >
        {/* Logo */}
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

        {/* Desktop Menu */}
        {!isMobile && (
          <div className="flex-1 flex justify-center">
            <NavBar
              positionClassName="relative z-[999]"
              items={[
                { name: t('nav.home'), url: '/', icon: Home, onClick: (e) => { e.preventDefault(); navigate('/'); } },
                { name: t('nav.adapt'), url: '/content-adapter', icon: Sparkles, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/content-adapter'); } else { localStorage.setItem('login_redirect_to', '/content-adapter'); login(); } } },
                { name: t('nav.hotTopics'), url: '/hot-topics', icon: Radar, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/hot-topics'); } else { localStorage.setItem('login_redirect_to', '/hot-topics'); login(); } } },
                { name: t('nav.creative'), url: '/creative-studio', icon: Sparkles, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/creative-studio'); } else { localStorage.setItem('login_redirect_to', '/creative-studio'); login(); } } },
                { name: t('nav.bookmark'), url: '/my-library', icon: FolderOpen, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/my-library'); } else { localStorage.setItem('login_redirect_to', '/my-library'); login(); } } },
                { name: t('nav.brandLibrary'), url: '/brand-library', icon: Library, onClick: (e) => { e.preventDefault(); if (isAuthenticated) { navigate('/brand-library'); } else { localStorage.setItem('login_redirect_to', '/brand-library'); login(); } } },
                { name: t('nav.upgrade'), url: '/payment-center', icon: CreditCard, onClick: (e) => { e.preventDefault(); navigate('/payment-center'); } },
              ]}
            />
          </div>
        )}

        {/* Action Buttons */}
        {!isMobile && (
          <div 
            className="flex-shrink-0 hidden md:flex items-center relative z-[1001] gap-3"
            style={{
              overflow: 'visible'
            }}
          >
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <UserAvatar size="md" />
            ) : (
              <div 
                className="flex items-center gap-1"
              >
                <Button variant="outline" onClick={() => login()}>
                  {t('auth.login')}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    register();
                  }}
                  className="bg-primary hover:bg-primary/90"
                  type="button"
                >
                  {t('auth.register')}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
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
                    if (isAuthenticated) { navigate('/content-adapter'); } else { login('/content-adapter'); }
                  }}>
                    {t('nav.adapt')}
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="ghost" className="text-lg font-medium py-2 w-full justify-start" onClick={() => {
                    if (isAuthenticated) { navigate('/hot-topics'); } else { login('/hot-topics'); }
                  }}>
                    {t('nav.hotTopics')}
                  </Button>
                </SheetClose>

                <div className="flex items-center justify-start px-2">
                  <span className="text-sm font-medium mr-3">主题</span>
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>

                {isAuthenticated ? (
                  <UserAvatar size="md" />
                ) : (
                  <div className="flex flex-col space-y-2">
                    <SheetClose asChild>
                      <Button variant="outline" onClick={() => login()}>
                        {t('auth.login')}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button onClick={() => register()} type="button">
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
    </div>
  );
}