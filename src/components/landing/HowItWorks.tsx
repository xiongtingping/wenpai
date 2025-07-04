import { useEffect } from "react"

export function HowItWorks() {
  // Animate the progress line on scroll
  // const [lineProgress, setLineProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById("how-it-works-section")
      if (section) {
        const rect = section.getBoundingClientRect()
        const windowHeight = window.innerHeight
        
        if (rect.top < windowHeight * 0.7 && rect.bottom > 0) {
          // const progress = Math.min(1, (windowHeight * 0.7 - rect.top) / (windowHeight * 0.4))
          // setLineProgress(progress) // This line was removed as per the edit hint
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="py-20 bg-white" id="how-it-works-section">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">三步搞定，就这么简单</h2>
          <p className="mt-4 text-lg text-gray-600">告别繁琐的内容适配流程，把时间用在创意上。</p>
          <div className="mt-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg inline-flex items-center text-sm font-medium">
            <span className="mr-2">⏱️</span>
            每天帮您节省45分钟内容创作时间，提高内容转化效率200%
          </div>
        </div>
        
        <div className="mt-16 relative">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
            {/* Step 1: Input */}
            <div className="step flex flex-col items-center group">
              <div className="relative">
                <div className="flex justify-center items-center h-24 w-24 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-full text-4xl font-bold shadow-lg border-4 border-blue-200 group-hover:border-blue-300 transition-all duration-300 group-hover:scale-110">
                  1
                </div>
                <div className="absolute -top-3 -right-3 flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500 text-sm text-white items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                {/* Arrow for mobile */}
                <div className="md:hidden absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="mt-8 text-center max-w-xs">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">输入原始内容</h3>
                <p className="text-gray-600 leading-relaxed">粘贴或输入您想要适配的内容，AI将智能分析内容结构和核心信息，为后续适配做准备。</p>
              </div>
              
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 left-[calc(33.33%+2rem)] transform -translate-y-1/2">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full opacity-30"></div>
                  <svg className="w-12 h-8 text-indigo-500 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Step 2: Select */}
            <div className="step flex flex-col items-center group">
              <div className="relative">
                <div className="flex justify-center items-center h-24 w-24 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 rounded-full text-4xl font-bold shadow-lg border-4 border-indigo-200 group-hover:border-indigo-300 transition-all duration-300 group-hover:scale-110">
                  2
                </div>
                <div className="absolute -top-3 -right-3 flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-indigo-500 text-sm text-white items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                {/* Arrow for mobile */}
                <div className="md:hidden absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4L12 20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="mt-8 text-center max-w-xs">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">选择目标平台</h3>
                <p className="text-gray-600 leading-relaxed">勾选需要适配的平台，支持多平台同时生成。每个平台都有独特的风格和优化设置。</p>
              </div>
              
              {/* Arrow for desktop */}
              <div className="hidden md:block absolute top-1/2 left-[calc(66.66%+2rem)] transform -translate-y-1/2">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full opacity-30"></div>
                  <svg className="w-12 h-8 text-purple-500 relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Step 3: Generate */}
            <div className="step flex flex-col items-center group">
              <div className="relative">
                <div className="flex justify-center items-center h-24 w-24 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 rounded-full text-4xl font-bold shadow-lg border-4 border-purple-200 group-hover:border-purple-300 transition-all duration-300 group-hover:scale-110">
                  3
                </div>
                <div className="absolute -top-3 -right-3 flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-purple-500 text-sm text-white items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
              </div>
              <div className="mt-8 text-center max-w-xs">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">一键获取所有版本</h3>
                <p className="text-gray-600 leading-relaxed">AI瞬间为您生成所有适配版本，一键复制、导出或分享。每个版本都完美适配对应平台特性。</p>
              </div>
            </div>
          </div>
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