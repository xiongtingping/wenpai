// Header组件 - 统一导航栏
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LogoWithText } from "@/components/ui/ThemeAwareLogo";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Home, Radar, Sparkles, Library, FolderOpen, CreditCard } from "lucide-react";
import {
  calculateRemainingTime,
  formatTimeLeft,
  shouldShowPromoOffer
} from "@/utils/paymentTimer";
import { useUserTier } from "@/hooks/useUserTier";

export function Header() {
  const isMobile = useIsMobile();
  const { user, isAuthenticated, login, register } = useUnifiedAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const headerRef = useRef<HTMLElement>(null);

  // 🔧 2025-01: 使用useUserTier获取订阅等级（优先使用Store）
  const { tier: userTier, loading: tierLoading, displayName: tierDisplayName } = useUserTier();

  // 获取当前主题
  const [currentTheme, setCurrentTheme] = useState<string>('light');

  // 限时优惠倒计时状态
  const [showPromoCountdown, setShowPromoCountdown] = useState(false);
  const [promoTimeLeft, setPromoTimeLeft] = useState(0);
  
  useEffect(() => {
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

  // 检查并显示限时优惠倒计时
  useEffect(() => {
    const checkPromo = async () => {
      if (user?.id && isAuthenticated && !tierLoading) {
        // 🔧 2025-01: 使用useUserTier的结果
        const shouldShow = await shouldShowPromoOffer(user.id, userTier);
        setShowPromoCountdown(shouldShow);
      } else {
        setShowPromoCountdown(false);
      }
    };

    checkPromo();
  }, [user?.id, isAuthenticated, userTier, tierLoading]);

  // 更新倒计时
  useEffect(() => {
    if (!showPromoCountdown || !user?.id) return;

    const updateCountdown = () => {
      const remaining = calculateRemainingTime(user.id);
      setPromoTimeLeft(remaining);

      // 倒计时结束，隐藏提示
      if (remaining <= 0) {
        setShowPromoCountdown(false);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [showPromoCountdown, user?.id]);

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
      ref={headerRef as any}
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
              textClassName=""
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
                { name: t('nav.home'), url: '/', icon: Home },
                { name: t('nav.adapt'), url: '/content-adapter', icon: Sparkles, onClick: (e) => { if (!isAuthenticated) { e.preventDefault(); localStorage.setItem('login_redirect_to', '/content-adapter'); login(); } } },
                { name: t('nav.hotTopics'), url: '/hot-topics', icon: Radar, onClick: (e) => { if (!isAuthenticated) { e.preventDefault(); localStorage.setItem('login_redirect_to', '/hot-topics'); login(); } } },
                { name: t('nav.creative'), url: '/creative-studio', icon: Sparkles, onClick: (e) => { if (!isAuthenticated) { e.preventDefault(); localStorage.setItem('login_redirect_to', '/creative-studio'); login(); } } },
                { name: t('nav.bookmark'), url: '/my-library', icon: FolderOpen, onClick: (e) => { if (!isAuthenticated) { e.preventDefault(); localStorage.setItem('login_redirect_to', '/my-library'); login(); } } },
                { name: t('nav.brandLibrary'), url: '/brand-library', icon: Library, onClick: (e) => { if (!isAuthenticated) { e.preventDefault(); localStorage.setItem('login_redirect_to', '/brand-library'); login(); } } },
                { name: t('nav.upgrade'), url: '/payment-center', icon: CreditCard },
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
            {/* 限时优惠倒计时 - 显示在升级套餐按钮旁边 */}
            {showPromoCountdown && isAuthenticated && (
              <div
                className="relative cursor-pointer group"
                onClick={() => navigate('/payment-center')}
              >
                <Badge
                  variant="destructive"
                  className="animate-pulse bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold px-3 py-1.5 shadow-lg"
                >
                  <Clock className="w-3.5 h-3.5 mr-1.5 inline-block" />
                  限时优惠 {formatTimeLeft(promoTimeLeft)}
                </Badge>

                {/* Hover提示 */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  点击查看优惠详情
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45"></div>
                </div>
              </div>
            )}

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
          <div className="flex-1 flex justify-end items-center gap-2">
            {/* 移动端限时优惠倒计时 */}
            {showPromoCountdown && isAuthenticated && (
              <Badge
                variant="destructive"
                className="animate-pulse bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-xs px-2 py-1 cursor-pointer"
                onClick={() => navigate('/payment-center')}
              >
                <Clock className="w-3 h-3 mr-1 inline-block" />
                {formatTimeLeft(promoTimeLeft)}
              </Badge>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* 移动端菜单内的优惠提示 */}
                  {showPromoCountdown && isAuthenticated && (
                    <div
                      className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg border-2 border-red-200 dark:border-red-800 cursor-pointer"
                      onClick={() => navigate('/payment-center')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="font-bold text-red-600 dark:text-red-400">限时优惠</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatTimeLeft(promoTimeLeft)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        点击查看优惠详情
                      </div>
                    </div>
                  )}
                <SheetClose asChild>
                  <Link to="/content-adapter" onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      localStorage.setItem('login_redirect_to', '/content-adapter');
                      login();
                    }
                  }}>
                    <Button variant="ghost" size="lg" className="w-full justify-start">
                      {t('nav.adapt')}
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/hot-topics" onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      localStorage.setItem('login_redirect_to', '/hot-topics');
                      login();
                    }
                  }}>
                    <Button variant="ghost" size="lg" className="w-full justify-start">
                      {t('nav.hotTopics')}
                    </Button>
                  </Link>
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
          </div>
        )}
      </nav>
    </div>
  );
}