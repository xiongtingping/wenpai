import { useEffect } from 'react'

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn')
            observer.unobserve(entry.target)
          }
        })
      },
      { 
        rootMargin: '0px', 
        threshold: 0.1 
      }
    )

    const sections = document.querySelectorAll('.opacity-0')
    sections.forEach(section => {
      observer.observe(section)
    })

    return () => {
      sections.forEach(section => {
        observer.unobserve(section)
      })
    }
  }, [])

  return null
}