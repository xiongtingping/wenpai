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

        {/* 文字平台 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">文字平台</h3>
          <div className="grid grid-cols-3 justify-items-center items-center gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-green-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <Book className="h-16 w-16 text-rose-500 mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">小红书</span>
              </div>
              <span className="text-sm text-gray-500 text-center">图文社区平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-green-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <MessageSquare className="h-16 w-16 text-green-500 mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">公众号</span>
              </div>
              <span className="text-sm text-gray-500 text-center">内容订阅平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-green-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <MessageSquare className="h-16 w-16 text-blue-500 mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">知乎</span>
              </div>
              <span className="text-sm text-gray-500 text-center">问答社区平台</span>
            </div>
          </div>
        </div>

        {/* 短视频平台 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">短视频平台</h3>
          <div className="grid grid-cols-3 justify-items-center items-center gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-blue-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <Video className="h-16 w-16 text-black mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">抖音</span>
              </div>
              <span className="text-sm text-gray-500 text-center">短视频平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-blue-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <Video className="h-16 w-16 text-blue-400 mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">B站</span>
              </div>
              <span className="text-sm text-gray-500 text-center">视频社区平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-blue-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <SquarePlay className="h-16 w-16 text-green-600 mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">视频号</span>
              </div>
              <span className="text-sm text-gray-500 text-center">短视频平台</span>
            </div>
          </div>
        </div>

        {/* 社交媒体 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">社交媒体</h3>
          <div className="grid grid-cols-2 justify-items-center items-center gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-orange-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <Send className="h-16 w-16 text-orange-500 mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">微博</span>
              </div>
              <span className="text-sm text-gray-500 text-center">社交媒体平台</span>
            </div>
            
            <div className="flex flex-col items-center justify-center transition py-6 bg-white rounded-lg p-8 shadow-sm hover:shadow-md transform hover:-translate-y-1 duration-300 border border-orange-100 w-full max-w-48">
              <div className="flex flex-col items-center mb-4">
                <Twitter className="h-16 w-16 text-black mb-3" />
                <span className="text-gray-800 font-medium text-xl text-center">X</span>
              </div>
              <span className="text-sm text-gray-500 text-center">国际社交媒体</span>
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