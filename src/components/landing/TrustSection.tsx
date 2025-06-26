import { Book, Video, MessageSquare, Send, Twitter, SquarePlay } from "lucide-react";

export function TrustSection() {
  return (
    <section className="py-16 opacity-0 animate-fadeIn" id="trust-section">
      <div className="container mx-auto px-6">
        <h2 className="text-center text-gray-500 font-semibold uppercase tracking-wider">
          信赖我们的AI，适配您信赖的平台
        </h2>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 justify-center items-center gap-4">
          {/* Platform icons with clear names in a symmetric grid */}
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <Book className="h-6 w-6 text-rose-500 mr-2" />
              <span className="text-gray-800 font-medium">小红书</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <Video className="h-6 w-6 text-black mr-2" />
              <span className="text-gray-800 font-medium">抖音</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <MessageSquare className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-gray-800 font-medium">知乎</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <Send className="h-6 w-6 text-orange-500 mr-2" />
              <span className="text-gray-800 font-medium">微博</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <MessageSquare className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-gray-800 font-medium">公众号</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <Video className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-gray-800 font-medium">B站</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <Twitter className="h-6 w-6 text-black mr-2" />
              <span className="text-gray-800 font-medium">X</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition py-3">
            <div className="flex items-center mb-1">
              <SquarePlay className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-gray-800 font-medium">视频号</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}