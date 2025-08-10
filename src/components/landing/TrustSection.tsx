import { Book, Video, MessageSquare, Send, Twitter, SquarePlay, Globe, Rss, Zap, Facebook, Linkedin, Instagram, Newspaper, User, Hash } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-16 opacity-0 animate-fadeIn bg-background relative" id="trust-section">
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            信赖我们的AI，适配您信赖的平台
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            覆盖全网主流内容平台，智能适配平台特性，打造多平台一体化内容方案
          </p>
          <div className="w-32 h-0.5 bg-accent mx-auto rounded-full relative border border-border">
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-20 h-2 bg-accent rounded-full -mt-1 border border-border"></div>
          </div>
        </div>

        {/* 简化的平台图标展示 */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-6 items-center justify-items-center mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Book className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">小红书</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <MessageSquare className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">微信公众号</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <MessageSquare className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">知乎</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Video className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">抖音</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Video className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">B站</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Send className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">微博</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Globe className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">百家号</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Zap className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">快手</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Rss className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">网易号</span>
          </div>
          {/* 新增平台logo */}
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Newspaper className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">头条号</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Facebook className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">Facebook</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Twitter className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">X（Twitter）</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Linkedin className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">LinkedIn</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <Instagram className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">Instagram</span>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <User className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">豆瓣</span>
          </div>

          <div className="flex flex-col items-center justify-center w-28 h-28 p-0 bg-card rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow mx-auto">
            <SquarePlay className="h-8 w-8 text-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">视频号</span>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <span className="inline-flex items-center text-sm text-muted-foreground bg-accent px-4 py-2 rounded-full">
            <span className="text-foreground mr-2">🔍</span>
            支持14+主流平台，AI智能适配平台特性与用户习惯
          </span>
        </div>
      </div>
    </section>
  )
}