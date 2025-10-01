import { useEffect } from "react"
import { CheckCircle, FileText, Settings, Sparkles } from "lucide-react"
import { useI18n } from "@/hooks/useI18n"

export function HowItWorks() {
  const { t } = useI18n()
  
  useEffect(() => {
    // 🔧 性能优化：使用节流防止频繁DOM计算，减少Forced reflow
    let timeoutId: number | null = null;
    let lastScrollTime = 0;
    
    const handleScroll = () => {
      const now = Date.now();
      // 节流：限制执行频率为每100ms最多一次
      if (now - lastScrollTime < 100) {
        return;
      }
      lastScrollTime = now;
      
      // 使用requestAnimationFrame确保在下一帧执行，避免阻塞滚动
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
      
      timeoutId = requestAnimationFrame(() => {
        const section = document.getElementById("how-it-works-section");
        if (section) {
          // 🔧 性能优化：批量读取DOM属性，减少布局重计算
          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          if (rect.top < windowHeight * 0.7 && rect.bottom > 0) {
            // 可加动画触发逻辑
            section.classList.add('in-view');
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初始检查
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        cancelAnimationFrame(timeoutId);
      }
    };
  }, [])

  // 使用设计令牌的步骤图标样式
  const stepIconClasses = [
    "ds-step-icon-1",
    "ds-step-icon-2", 
    "ds-step-icon-3"
  ]
  const stepIcons = [FileText, Settings, Sparkles]
  
  // 使用工厂函数或在渲染时调用，避免在组件外部调用t函数
  const getStepTitles = () => [
    t('home.howItWorks.step1.title'),
    t('home.howItWorks.step2.title'),
    t('home.howItWorks.step3.title')
  ]
  
  const getStepDescs = () => [
    t('home.howItWorks.step1.description'),
    t('home.howItWorks.step2.description'),
    t('home.howItWorks.step3.description')
  ]
  
  const stepTitles = getStepTitles()
  const stepDescs = getStepDescs()

  return (
    <section id="how-it-works-section">
      <div className="ds-container">
        {/* 1️⃣ 标题区优化 */}
        <div className="ds-text-centered ds-container-narrow">
          <h2 className="ds-title-main ds-text-primary mb-4">
            {t('home.howItWorks.title')}
          </h2>
          <p className="ds-title-section ds-text-primary mb-4">
            {t('home.howItWorks.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 ds-text-helper ds-text-primary mt-4">
            <span className="text-lg">✅</span>
            {t('home.howItWorks.benefits')}
          </div>
        </div>

        {/* 2️⃣ 三步内容卡片优化 */}
        <div className="mt-16 ds-grid-3 ds-container-wide">
          {stepTitles.map((title, i) => {
            const Icon = stepIcons[i]
            return (
              <div
                key={title}
                className="group ds-card ds-card-padding ds-transition-standard ds-hover-lift how-it-works-step"
                style={{ '--animation-delay': `${i * 0.1 + 0.1}s` } as React.CSSProperties}
              >
                <div className="ds-text-centered ds-space-y-standard">
                  {/* 设计令牌圆形背景图标 */}
                  <div
                    className={`ds-icon-main ${stepIconClasses[i]} group-hover:scale-110`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* 主标题 */}
                  <h3 className="ds-title-section ds-text-primary">
                    {title}
                  </h3>

                  {/* 描述文字 */}
                  <p className="ds-text-body ds-text-secondary leading-relaxed max-w-xs mx-auto">
                    {stepDescs[i]}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* 3️⃣ 最下方蓝色提示条优化 */}
        <div className="mt-16 ds-container-narrow">
          <div className="ds-card ds-text-centered px-6 py-4">
            <h3 className="ds-title-section ds-text-primary mb-2">
              {t('home.howItWorks.efficiency.title')}
            </h3>
            <p className="ds-text-body ds-text-primary">
              {t('home.howItWorks.efficiency.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}