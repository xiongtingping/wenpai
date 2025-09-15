import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Sun, Moon, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AnimatedAuthShellProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

// 采用 21st.dev animated-sign-in 组件相同的结构与特效，确保视觉100%一致
export const AnimatedAuthShell: React.FC<any> = ({ title = 'Welcome',
  subtitle = 'Please sign in to continue',
  children }) => { const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 初始化主题
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(prefersDark)
    if (prefersDark) document.documentElement.classList.add('dark-mode')
   }, [])

  // 粒子特效（与原组件一致的颜色与速度逻辑）
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    class Particle {
      x: number; y: number; size: number; speedX: number; speedY: number; color: string
      constructor() {
        this.x = Math.random() * (canvas?.width || 800)
        this.y = Math.random() * (canvas?.height || 600)
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = isDarkMode
          ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
          : `rgba(0, 0, 100, ${Math.random() * 0.2})`
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > (canvas?.width || 800)) this.x = 0
        if (this.x < 0) this.x = canvas?.width || 800
        if (this.y > (canvas?.height || 600)) this.y = 0
        if (this.y < 0) this.y = canvas?.height || 600
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const particles: Particle[] = []
    const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000))
    for (let i = 0; i < particleCount; i++) particles.push(new Particle())

    let raf = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) { p.update(); p.draw() }
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', setSize)
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(v => !v)
    document.documentElement.classList.toggle('dark-mode')
  }

  const navigate = useNavigate()
  return (
    <div className={`login-container ${isDarkMode ? 'dark' : 'light'}`}>
      <canvas id="particles" ref={canvasRef} className="particles-canvas"></canvas>

      <button className="auth-nav-back" aria-label= onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> <span className="auth-nav-back-text">返回</span>
      </button>

      <div className="theme-toggle" onClick={toggleDarkMode}>
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </div>

      <div className="login-card">
        <div className="login-card-inner">
          <div className="login-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AnimatedAuthShell
