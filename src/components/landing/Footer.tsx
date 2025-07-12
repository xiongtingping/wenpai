import { Twitter, Mail, ExternalLink } from "lucide-react"

/**
 * 网站底部 Footer 组件
 * - 三列布局，品牌感与专业感提升
 * - 导航链接、外链icon、版权区、响应式与动效全面优化
 */
export function Footer() {
  return (
    <footer className="bg-[#f9f9f9] text-gray-800 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10 items-start">
          {/* 产品 */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:pr-8">
            <h4 className="font-bold text-base md:text-lg text-gray-900 mb-4 tracking-wide">产品</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="#features" className="footer-link">功能</a></li>
              <li><a href="#pricing" className="footer-link">定价</a></li>
              <li><a href="/changelog" className="footer-link flex items-center group" target="_blank" rel="noopener noreferrer">更新日志<ExternalLink className="h-4 w-4 ml-1 text-gray-400 group-hover:text-blue-500 transition-transform group-hover:scale-110" /></a></li>
              <li><a href="mailto:xiongtingping@gmail.com" className="footer-link">Bug反馈</a></li>
            </ul>
          </div>
          {/* 联系我们 */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-gray-100 pb-8 md:pb-0 md:px-8">
            <h4 className="font-bold text-base md:text-lg text-gray-900 mb-4 tracking-wide">联系我们</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <a href="https://twitter.com/xiongtingping" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center group">
                  <Twitter className="h-4 w-4 mr-2 text-blue-400 group-hover:text-blue-500 transition-transform group-hover:scale-110" />
                  <span>X</span>
                  <ExternalLink className="h-3 w-3 ml-1 text-gray-400 group-hover:text-blue-500 transition-transform group-hover:scale-110" />
                </a>
              </li>
              <li>
                <a href="https://www.xiaohongshu.com/user/profile/63cf5e970000000026012cde" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center group">
                  <span className="h-4 w-4 mr-2 flex items-center justify-center text-rose-500 font-bold text-xs">小</span>
                  <span>小红书</span>
                  <ExternalLink className="h-3 w-3 ml-1 text-gray-400 group-hover:text-pink-500 transition-transform group-hover:scale-110" />
                </a>
              </li>
              <li>
                <a href="mailto:xiongtingping@gmail.com" className="footer-link flex items-center group">
                  <Mail className="h-4 w-4 mr-2 text-green-500 group-hover:text-green-600 transition-transform group-hover:scale-110" />
                  <span>邮箱</span>
                </a>
              </li>
              <li>
                <a href="https://bento.me/pandatalk" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center group">
                  <ExternalLink className="h-4 w-4 mr-2 text-indigo-400 group-hover:text-indigo-500 transition-transform group-hover:scale-110" />
                  <span>bento</span>
                  <ExternalLink className="h-3 w-3 ml-1 text-gray-400 group-hover:text-indigo-500 transition-transform group-hover:scale-110" />
                </a>
              </li>
            </ul>
          </div>
          {/* 品牌/LOGO或空白列，可自定义 */}
          <div className="flex flex-col items-center md:items-end justify-between h-full pt-4 md:pt-0">
            {/* 可放LOGO或品牌标语 */}
            <span className="text-xl font-extrabold text-indigo-600 mb-2 select-none">文派</span>
            <span className="text-sm text-gray-400">AI内容适配 · 创意生成</span>
          </div>
        </div>
      </div>
      {/* 版权与条款区域 */}
      <div className="bg-[#f3f4f6] border-t border-gray-200 py-4 px-4 md:px-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-y-2">
          <div className="mb-1 md:mb-0">© 2025 文派（www.wenpai.xyz）All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:underline transition-colors">隐私政策</a>
            <span className="text-gray-300">|</span>
            <a href="/terms" className="hover:underline transition-colors">服务条款</a>
          </div>
        </div>
      </div>
      <style>{`
        .footer-link {
          @apply text-gray-600 hover:text-blue-600 hover:underline transition-all duration-200 flex items-center;
        }
      `}</style>
    </footer>
  )
}