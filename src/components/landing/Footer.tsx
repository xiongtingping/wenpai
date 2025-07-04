import { Twitter, Mail, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-16 gap-y-10">
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">产品</h4>
            <ul className="grid grid-cols-2 gap-3">
              <li><a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">功能</a></li>
              <li><a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">定价</a></li>
              <li><a href="/changelog" className="text-gray-600 hover:text-blue-600 transition-colors duration-200" target="_blank" rel="noopener noreferrer">更新日志</a></li>
              <li><a href="mailto:xiongtingping@gmail.com" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Bug反馈</a></li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">联系我们</h4>
            <ul className="grid grid-cols-2 gap-3">
              <li>
                <a href="https://twitter.com/xiongtingping" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 flex items-center group transition-colors duration-200">
                  <Twitter className="h-4 w-4 mr-2" />
                  <span>X</span>
                  <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="https://www.xiaohongshu.com/user/profile/63cf5e970000000026012cde" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 flex items-center group transition-colors duration-200">
                  <span className="h-4 w-4 mr-2 flex items-center justify-center text-rose-500 font-bold text-xs">小</span>
                  <span>小红书</span>
                  <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="mailto:xiongtingping@gmail.com" className="text-gray-600 hover:text-blue-600 flex items-center group transition-colors duration-200">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>邮箱</span>
                </a>
              </li>
              <li>
                <a href="https://bento.me/pandatalk" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 flex items-center group transition-colors duration-200">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>bento</span>
                  <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>

            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-gray-500 mb-4">&copy; 2024 文派 (www.aiwenpai.com). All rights reserved.</p>
            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
              「文派」是一款AI内容适配工具，用户可通过付费方式获得高级使用权限。本平台仅提供内容生成与适配技术支持，所有AI生成的内容均由算法自动生成，仅供用户参考与辅助使用。用户需自行对所生成内容的使用后果承担责任，确保在使用过程中遵守其所在地区的相关法律法规与平台规范。
            </p>
            <div className="mt-6">
              <div className="flex justify-center space-x-6">
                <a href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">隐私政策</a>
                <span className="text-gray-300">|</span>
                <a href="/terms" className="text-gray-500 hover:text-blue-600 transition-colors duration-200">服务条款</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}