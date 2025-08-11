import { Twitter, Mail, ExternalLink } from "lucide-react"

/**
 * 网站底部 Footer 组件
 * - 简洁设计，品牌感与专业感提升
 * - 响应式布局，移动端和桌面端优化
 */
export function Footer() {
  return (
    <footer className="surface-1 text-center text-sm text-muted-foreground mt-10 border-t border-border">
      <div className="py-4 px-6 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
        <span className="font-medium text-foreground">AI内容适配 · 创意生成</span>
        <span className="hidden md:inline">|</span>
        <span>© 2025 文派（<a href="https://www.wenpai.xyz" className="underline hover:text-foreground">www.wenpai.xyz</a>）All rights reserved.</span>
        <span className="hidden md:inline">|</span>
        <div className="flex gap-4">
          <a href="/terms" className="underline hover:text-foreground">服务条款</a>
          <a href="/privacy" className="underline hover:text-foreground">隐私政策</a>
          <a
            href="mailto:hello@wenpai.xyz"
            className="flex items-center gap-1 underline hover:text-foreground"
            title="发送邮件至 hello@wenpai.xyz"
          >
            <Mail className="w-4 h-4" />
            hello@wenpai.xyz
          </a>
          <a
            href="https://bento.me/pandatalk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4" />
            联系我们
          </a>
        </div>
      </div>
    </footer>
  )
}