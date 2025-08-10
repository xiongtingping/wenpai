import { Book, Video, MessageSquare, Send, Twitter, SquarePlay, Globe, Rss, Zap, Facebook, Linkedin, Instagram, Newspaper, User, Hash } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-16 opacity-0 animate-fadeIn bg-[#f9f9f9] relative" id="trust-section">
      {/* 顶部渐变过渡层 - 从白色过渡到浅灰色 */}
      <div 
        className="absolute top-0 left-0 right-0 h-10"
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%)'
        }}
      />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            信赖我们的AI，适配您信赖的平台
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            覆盖全网主流内容平台，智能适配平台特性，打造多平台一体化内容方案
          </p>
          <div className="w-32 h-0.5 bg-gradient-to-r btn-gradient-primary mx-auto rounded-full relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-20 h-2 bg-gradient-to-b from-blue-400/30 to-transparent rounded-full -mt-1"></div>
          </div>
        </div>

        {/* 简化的平台图标展示 */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-6 items-center justify-items-center mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Book className="h-8 w-8 text-rose-500 mb-2" />
            <span className="text-sm font-medium text-foreground">小红书</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <MessageSquare className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">微信公众号</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <MessageSquare className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">知乎</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Video className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">抖音</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Video className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">B站</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Send className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">微博</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Globe className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">百家号</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Zap className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">快手</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Rss className="h-8 w-8 text-destructive mb-2" />
            <span className="text-sm font-medium text-foreground">网易号</span>
          </div>
          {/* 新增平台logo */}
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Newspaper className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">头条号</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Facebook className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">Facebook</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Twitter className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">X（Twitter）</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Linkedin className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">LinkedIn</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <Instagram className="h-8 w-8 text-primary mb-2" />
            <span className="text-sm font-medium text-foreground">Instagram</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <User className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">豆瓣</span>
          </div>

          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border hover:shadow-md transition-shadow mx-auto">
            <SquarePlay className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">视频号</span>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <span className="inline-flex items-center text-sm text-muted-foreground bg-accent px-4 py-2 rounded-full">
            <span className="text-primary mr-2">🔍</span>
            支持14+主流平台，AI智能适配平台特性与用户习惯
          </span>
        </div>
      </div>
      
      {/* 底部渐变过渡层 - 从浅灰色过渡到白色 */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-10"
        style={{
          background: 'linear-gradient(to top, #ffffff 0%, #f9f9f9 100%)'
        }}
      />
    </section>
  )
}