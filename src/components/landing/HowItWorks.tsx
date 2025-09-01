import { useEffect } from "react"
import { CheckCircle, FileText, Settings, Sparkles } from "lucide-react"
import { useI18n } from "@/hooks/useI18n"

export function HowItWorks() {
  const { t } = useI18n()
  
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
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 统一渐变色彩配置
  const stepColors = [
    "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
    "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
    "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
  ]
  const stepIcons = [FileText, Settings, Sparkles]
  const stepTitles = [
    t('home.howItWorks.step1.title'),
    t('home.howItWorks.step2.title'),
    t('home.howItWorks.step3.title')
  ]
  const stepDescs = [
    t('home.howItWorks.step1.description'),
    t('home.howItWorks.step2.description'),
    t('home.howItWorks.step3.description')
  ]

  return (
    <section className="py-10" id="how-it-works-section">
      <div className="container mx-auto px-6">
        {/* 1️⃣ 标题区优化 */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            {t('home.howItWorks.title')}
          </h2>
          <p className="text-lg text-foreground mb-4">
            {t('home.howItWorks.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-foreground mt-4">
            <span className="text-lg">✅</span>
            {t('home.howItWorks.benefits')}
          </div>
        </div>

        {/* 2️⃣ 三步内容卡片优化 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {stepTitles.map((title, i) => {
            const Icon = stepIcons[i]
            return (
              <div
                key={title}
                className="group bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* 渐变圆形背景图标 */}
                  <div
                    className={`homepage-icon how-it-works-icon flex items-center justify-center w-20 h-20 rounded-full ${stepColors[i]} shadow-lg mb-6 transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon className="w-10 h-10" />
                  </div>
                  
                  {/* 主标题 */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {title}
                  </h3>
                  
                  {/* 描述文字 */}
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {stepDescs[i]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* 3️⃣ 最下方蓝色提示条优化 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="rounded-lg bg-card text-center px-6 py-4 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('home.howItWorks.efficiency.title')}
            </h3>
            <p className="text-sm text-foreground">
              {t('home.howItWorks.efficiency.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}