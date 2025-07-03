import { Book, Video, MessageSquare, Send, Twitter, SquarePlay } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-16 opacity-0 animate-fadeIn" id="trust-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            信赖我们的AI，适配您信赖的平台
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            覆盖全网主流内容平台，深度理解平台特性，打造多平台一体化内容方案
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        {/* 视频平台 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">视频平台</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 justify-center items-center gap-4">
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-blue-100">
              <div className="flex items-center mb-2">
                <Video className="h-7 w-7 text-black mr-2" />
                <span className="text-gray-800 font-medium">抖音</span>
              </div>
              <span className="text-xs text-gray-500">短视频平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-blue-100">
              <div className="flex items-center mb-2">
                <Video className="h-7 w-7 text-blue-400 mr-2" />
                <span className="text-gray-800 font-medium">B站</span>
              </div>
              <span className="text-xs text-gray-500">视频社区平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-blue-100">
              <div className="flex items-center mb-2">
                <SquarePlay className="h-7 w-7 text-green-600 mr-2" />
                <span className="text-gray-800 font-medium">视频号</span>
              </div>
              <span className="text-xs text-gray-500">短视频平台</span>
            </div>
          </div>
        </div>

        {/* 文字平台 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">文字平台</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 justify-center items-center gap-4">
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-green-100">
              <div className="flex items-center mb-2">
                <Book className="h-7 w-7 text-rose-500 mr-2" />
                <span className="text-gray-800 font-medium">小红书</span>
              </div>
              <span className="text-xs text-gray-500">图文社区平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-green-100">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-7 w-7 text-green-500 mr-2" />
                <span className="text-gray-800 font-medium">公众号</span>
              </div>
              <span className="text-xs text-gray-500">内容订阅平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-green-100">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-7 w-7 text-blue-500 mr-2" />
                <span className="text-gray-800 font-medium">知乎</span>
              </div>
              <span className="text-xs text-gray-500">问答社区平台</span>
            </div>
          </div>
        </div>

        {/* 社交媒体 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">社交媒体</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 justify-center items-center gap-4">
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-orange-100">
              <div className="flex items-center mb-2">
                <Send className="h-7 w-7 text-orange-500 mr-2" />
                <span className="text-gray-800 font-medium">微博</span>
              </div>
              <span className="text-xs text-gray-500">社交媒体平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-orange-100">
              <div className="flex items-center mb-2">
                <Twitter className="h-7 w-7 text-black mr-2" />
                <span className="text-gray-800 font-medium">X</span>
              </div>
              <span className="text-xs text-gray-500">国际社交媒体</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <span className="inline-flex items-center text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-blue-600 mr-2">🔍</span>
            每个平台深度适配，确保内容精准匹配平台特性与用户习惯
          </span>
        </div>
      </div>
    </section>
  )
}