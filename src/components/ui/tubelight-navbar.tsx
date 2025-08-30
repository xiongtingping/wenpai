import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  positionClassName?: string
}

export function NavBar({ items, className, positionClassName }: NavBarProps) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  // 根据当前路径确定激活的tab - 优化匹配逻辑
  const getActiveTab = () => {
    const currentPath = location.pathname
    
    // 精确匹配首页
    if (currentPath === '/') {
      return '首页'
    }

    // 为其他路径进行精确匹配
    const activeItem = items.find(item => {
      if (item.url === '/') {
        return currentPath === '/'
      }
      // 更精确的路径匹配
      return currentPath === item.url || currentPath.startsWith(item.url + '/')
    })

    // 如果没有找到匹配项，检查是否是子路径
    if (!activeItem) {
      const fallbackItem = items.find(item => {
        if (item.url === '/') return false
        // 检查是否为该模块的子页面
        return currentPath.includes(item.url.split('/')[1] || '')
      })
      return fallbackItem?.name || '首页'
    }

    return activeItem.name
  }

  const activeTab = getActiveTab()
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // 监听路径变化，强制重新计算activeTab
  useEffect(() => {
    forceUpdate({})
  }, [location.pathname])

  return (
    <div
      className={cn(
        positionClassName || "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={(e) => {
                item.onClick?.(e)
              }}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
