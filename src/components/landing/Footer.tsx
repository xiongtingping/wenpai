import { Twitter, Mail, ExternalLink } from "lucide-react"

/**
 * 网站底部 Footer 组件
 * - 简洁设计，品牌感与专业感提升
 * - 响应式布局，移动端和桌面端优化
 */
export function Footer() {
  return (
    <footer className="bg-gray-50 text-center text-sm text-gray-500 mt-10 border-t">
      <div className="py-4 px-6 flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4">
        <span className="font-medium text-gray-600">AI内容适配 · 创意生成</span>
        <span className="hidden md:inline">|</span>
        <span>© 2025 文派（<a href="https://www.wenpai.xyz" className="underline hover:text-black">www.wenpai.xyz</a>）All rights reserved.</span>
        <span className="hidden md:inline">|</span>
        <div className="flex gap-4">
          <a href="/terms" className="underline hover:text-black">服务条款</a>
          <a href="/privacy" className="underline hover:text-black">隐私政策</a>
          <a 
            href="https://bento.me/pandatalk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline hover:text-black"
          >
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              {/* Bento Logo - 简化的餐盒图标 */}
              <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z"/>
            </svg>
            联系我们
          </a>
        </div>
      </div>
    </footer>
  )
}