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
    <section className="py-20 bg-white" id="how-it-works-section">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">三步搞定，就这么简单</h2>
          <p className="mt-2 text-lg text-gray-600">告别繁琐的内容适配流程，把时间用在创意上。</p>
          <div className="border border-green-200 bg-green-50 px-4 py-2 rounded-lg flex items-center gap-2 text-green-700 text-sm font-medium mt-4 mx-auto w-fit shadow-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            每天帮您节省45分钟内容创作时间，提高内容转化效率200%
          </div>
        </div>
        <div className="mt-16 flex flex-col md:flex-row items-stretch justify-center gap-8 md:gap-4 relative">
          {stepTitles.map((title, i) => {
            const Icon = stepIcons[i]
            return (
              <div
                key={title}
                className={`group flex-1 flex flex-col items-center px-2 md:px-0 animate-fadeInUp`}
                style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
              >
                <div className={`relative flex flex-col items-center mb-6`}>
                  <div
                    className={`flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${stepGradients[i]} shadow-lg border-4 border-white dark:border-slate-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}
                  >
                    <span className="absolute top-2 left-2 text-xs text-white/80 font-bold opacity-80 select-none">{i + 1}</span>
                    <Icon className="w-9 h-9 md:w-10 md:h-10 text-white drop-shadow" />
                  </div>
                </div>
                <div className="text-center max-w-xs mx-auto">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="mx-auto text-gray-600 leading-[1.7] text-base md:text-lg max-w-[18rem]">{stepDescs[i]}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-12 max-w-3xl mx-auto text-center">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">提高效率，节省时间</h3>
            <p className="text-sm text-gray-600">
              传统多平台内容适配每篇需要<span className="line-through mx-1">60-90分钟</span>
              <span className="text-green-600 font-medium mx-1">现在只需15分钟</span>
              即可完成全平台内容分发，让您专注于创意本身！
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}