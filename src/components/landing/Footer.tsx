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
      </div>
    </footer>
  )
}