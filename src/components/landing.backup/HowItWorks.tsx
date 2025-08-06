import { useEffect } from "react"
import { CheckCircle, FileText, Settings, Sparkles } from "lucide-react"

export function HowItWorks() {
  useEffect(() => {
    // 动效可选，保留原有滚动监听
    const handleScroll = () => {
      const section = document.getElementById("how-it-works-section")
      if (section) {
        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight
        if (rect.top < windowHeight * 0.7 && rect.bottom > 0) {
          // 可加动画触发逻辑
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 渐变色配置
  const stepGradients = [
    "from-blue-400 via-blue-500 to-indigo-500",
    "from-purple-400 via-indigo-400 to-pink-400",
    "from-pink-400 via-pink-500 to-red-400"
  ]
  const stepIcons = [FileText, Settings, Sparkles]
  const stepTitles = ["输入原始内容", "选择目标平台", "一键获取所有版本"]
  const stepDescs = [
    "粘贴或输入您想要适配的内容，AI将智能分析结构和核心信息。",
    "勾选需要适配的平台，支持多平台同时生成，每个平台都有独特优化。",
    "AI瞬间为您生成所有适配版本，一键复制、导出或分享。"
  ]

  return (
    <section className="py-16 bg-white" id="how-it-works-section">
      <div className="container mx-auto px-6">
        {/* 1️⃣ 标题区优化 */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            三步搞定，就这么简单
          </h2>
          <p className="text-lg text-gray-500 mb-4">
            告别繁琐的内容适配流程，把时间用在创意上。
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 mt-4">
            <span className="text-lg">✅</span>
            每天帮您节省45分钟内容创作时间，提高内容转化效率200%
          </div>
        </div>

        {/* 2️⃣ 三步内容卡片优化 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {stepTitles.map((title, i) => {
            const Icon = stepIcons[i]
            return (
              <div
                key={title}
                className="group bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* 渐变圆形背景图标 */}
                  <div
                    className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${stepGradients[i]} shadow-lg mb-6 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* 主标题 */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {title}
                  </h3>
                  
                  {/* 描述文字 */}
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                    {stepDescs[i]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* 3️⃣ 最下方蓝色提示条优化 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-lg bg-blue-50 text-center px-6 py-4 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">
              提高效率，节省时间
            </h3>
            <p className="text-sm text-gray-600">
              传统多平台内容适配每篇需要
              <span className="line-through mx-1">60-90分钟</span>
              <span className="text-green-600 font-semibold mx-1">现在只需15分钟</span>
              即可完成全平台内容分发，让您专注于创意本身！
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}