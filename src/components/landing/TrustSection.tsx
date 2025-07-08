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
            覆盖全网主流内容平台，深度理解平台特性，打造多平台一体化内容方案
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 图文社区平台 */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Book className="h-8 w-8 text-rose-500" />
                <h3 className="font-semibold text-rose-600">小红书</h3>
              </div>
              <p className="text-sm text-gray-600">轻松活泼风格，多用emoji表情，个人化视角，首尾互动引导，注重生活化和体验感</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <h3 className="font-semibold text-green-600">微信公众号</h3>
              </div>
              <p className="text-sm text-gray-600">专业严谨风格，段落清晰，标题引人，适合深度阅读，注重价值输出和专业性</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-8 w-8 text-blue-700" />
                <h3 className="font-semibold text-blue-700">百家号</h3>
              </div>
              <p className="text-sm text-gray-600">长篇深度内容，SEO友好，权威感强，适合资讯类、知识类内容输出</p>
            </div>
          </div>

          {/* 问答和知识平台 */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <h3 className="font-semibold text-blue-600">知乎</h3>
              </div>
              <p className="text-sm text-gray-600">逻辑严密，分点论述，理性客观，有深度的专业分析，注重论证过程和数据支撑</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Rss className="h-8 w-8 text-red-500" />
                <h3 className="font-semibold text-red-600">网易号</h3>
              </div>
              <p className="text-sm text-gray-600">注重原创性，文笔流畅，观点独特，适合深度评论和独家视角分析</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="h-8 w-8 text-purple-600" />
                <h3 className="font-semibold text-purple-600">头条号</h3>
              </div>
              <p className="text-sm text-gray-600">标题党友好，热点敏感，算法推荐，适合时事评论和热点追踪</p>
            </div>
          </div>

          {/* 短视频平台 */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Video className="h-8 w-8 text-black" />
                <h3 className="font-semibold text-black">抖音</h3>
              </div>
              <p className="text-sm text-gray-600">简短有力台词，节奏感强，互动性高，引人共鸣，适合口语化表达和视觉描述</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Video className="h-8 w-8 text-blue-400" />
                <h3 className="font-semibold text-blue-400">B站</h3>
              </div>
              <p className="text-sm text-gray-600">二次元文化元素，圈层词汇，专业知识融合娱乐表达，年轻化语言风格</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-8 w-8 text-yellow-600" />
                <h3 className="font-semibold text-yellow-600">快手</h3>
              </div>
              <p className="text-sm text-gray-600">接地气表达，真实朴实，亲民风格，适合生活记录和草根创作者</p>
            </div>
          </div>

          {/* 社交媒体平台 */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Send className="h-8 w-8 text-orange-500" />
                <h3 className="font-semibold text-orange-600">微博</h3>
              </div>
              <p className="text-sm text-gray-600">简短有话题性，互动元素多，情绪化表达，热点结合，适合快速传播</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <SquarePlay className="h-8 w-8 text-green-600" />
                <h3 className="font-semibold text-green-700">视频号</h3>
              </div>
              <p className="text-sm text-gray-600">亲和力强，互动感高，视觉描述清晰，适合中老年群体，注重情感共鸣</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Twitter className="h-8 w-8 text-black" />
                <h3 className="font-semibold text-gray-600">X(推特)</h3>
              </div>
              <p className="text-sm text-gray-600">精简直接，多用标签，国际化表达，适合观点输出和快速互动</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <span className="inline-flex items-center text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-blue-600 mr-2">🔍</span>
            每个平台深度适配，确保内容精准匹配平台特性与用户习惯
          </span>
        </div>
      </div>
    </section>
  )
}