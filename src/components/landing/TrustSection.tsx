import { Book, Video, MessageSquare, Send, Twitter, SquarePlay, Globe, Rss, Zap } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-16 opacity-0 animate-fadeIn" id="trust-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            信赖我们的AI，适配您信赖的平台
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            覆盖全网主流内容平台，智能适配平台特性，打造多平台一体化内容方案
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* 简化的平台图标展示 */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-6 items-center justify-items-center">
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Book className="h-8 w-8 text-rose-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">小红书</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <MessageSquare className="h-8 w-8 text-green-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">微信公众号</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">知乎</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Video className="h-8 w-8 text-black mb-2" />
            <span className="text-sm font-medium text-gray-700">抖音</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Video className="h-8 w-8 text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">B站</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Send className="h-8 w-8 text-orange-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">微博</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Globe className="h-8 w-8 text-blue-700 mb-2" />
            <span className="text-sm font-medium text-gray-700">百家号</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Zap className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">快手</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Rss className="h-8 w-8 text-red-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">网易号</span>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <span className="inline-flex items-center text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-blue-600 mr-2">🔍</span>
            支持18+主流平台，AI智能适配平台特性与用户习惯
          </span>
        </div>
      </div>
    </section>
  )
}