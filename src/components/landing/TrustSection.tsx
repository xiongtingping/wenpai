import { Book, Video, MessageSquare, Send, Twitter, SquarePlay, Globe, Rss, Zap, Facebook, Linkedin, Instagram, Newspaper, User, Hash } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

export function TrustSection() {
  const { t } = useI18n()
  
  return (
    <section className="py-8 opacity-0 animate-fadeIn relative" id="trust-section">
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold theme-hero-title mb-4">
            {t('home.trust.title')}
          </h2>
          <p className="theme-hero-subtitle max-w-2xl mx-auto mb-4">
            {t('home.trust.subtitle')}
          </p>
          <div className="w-32 h-0.5 bg-accent mx-auto rounded-full relative border border-border">
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-20 h-2 bg-accent rounded-full -mt-1 border border-border"></div>
          </div>
        </div>

        {/* 简化的平台图标展示 */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-6 items-center justify-items-center mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Book className="h-8 w-8 theme-platform-icon-1 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.xiaohongshu')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <MessageSquare className="h-8 w-8 theme-platform-icon-2 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.wechat')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <MessageSquare className="h-8 w-8 theme-platform-icon-3 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.zhihu')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Video className="h-8 w-8 theme-platform-icon-1 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.douyin')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Video className="h-8 w-8 theme-platform-icon-2 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.bilibili')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Send className="h-8 w-8 theme-platform-icon-3 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.weibo')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Globe className="h-8 w-8 theme-platform-icon-1 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.baijiahao')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Zap className="h-8 w-8 theme-platform-icon-2 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.kuaishou')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Rss className="h-8 w-8 theme-platform-icon-3 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.toutiao')}</span>
          </div>
          {/* 新增平台logo */}
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Newspaper className="h-8 w-8 theme-platform-icon-1 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.wangyi')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Facebook className="h-8 w-8 theme-platform-icon-2 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.facebook')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Twitter className="h-8 w-8 theme-platform-icon-3 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.twitter')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Linkedin className="h-8 w-8 theme-platform-icon-1 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.linkedin')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <Instagram className="h-8 w-8 theme-platform-icon-2 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.instagram')}</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <User className="h-8 w-8 theme-platform-icon-3 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.douban')}</span>
          </div>

          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 theme-platform-card-bg rounded-xl shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 mx-auto group">
            <SquarePlay className="h-8 w-8 theme-platform-icon-1 mb-2 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">{t('home.trust.platforms.youtube')}</span>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <span className="inline-flex items-center text-sm text-foreground bg-card px-4 py-2 rounded-full border border-border shadow-sm">
            <span className="text-foreground mr-2">🔍</span>
{t('home.trust.supportText')}
          </span>
        </div>
      </div>
    </section>
  )
}