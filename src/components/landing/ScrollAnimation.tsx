import { useEffect } from 'react'

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 移除opacity-0类并添加动画类
            entry.target.classList.remove('opacity-0')
            entry.target.classList.add('animate-fadeIn')
            observer.unobserve(entry.target)
          }
        })
      },
      { 
        rootMargin: '0px 0px -50px 0px', // 提前50px触发动画
        threshold: 0.1 
      }
    )

    // 查找所有需要动画的元素
    const sections = document.querySelectorAll('.opacity-0')
    sections.forEach(section => {
      observer.observe(section)
    })

    // 清理函数
    return () => {
      sections.forEach(section => {
        observer.unobserve(section)
      })
    }
  }, [])

  return null
}