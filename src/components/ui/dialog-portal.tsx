"use client"

import * as React from "react"
import { createPortal } from "react-dom"

/**
 * 独立的Dialog Portal容器
 * 确保Dialog组件不受#root容器的CSS样式影响
 */
export interface DialogPortalProps {
  children: React.ReactNode
  container?: Element | null
}

export const DialogPortal: React.FC<DialogPortalProps> = ({ 
  children, 
  container 
}) => {
  const [mounted, setMounted] = React.useState(false)
  const [portalContainer, setPortalContainer] = React.useState<Element | null>(null)

  React.useEffect(() => {
    // 优先使用指定的容器
    if (container) {
      setPortalContainer(container)
      setMounted(true)
      return
    }

    // 尝试使用独立的dialog-portal-root容器
    let dialogRoot = document.getElementById('dialog-portal-root')
    
    // 如果不存在，创建一个
    if (!dialogRoot) {
      dialogRoot = document.createElement('div')
      dialogRoot.id = 'dialog-portal-root'
      dialogRoot.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1000;
        contain: none;
        isolation: auto;
        transform: none;
        translate: none;
        clip-path: none;
        filter: none;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        background: transparent;
        overflow: visible;
      `
      document.body.appendChild(dialogRoot)
    }

    setPortalContainer(dialogRoot)
    setMounted(true)
  }, [container])

  // 服务端渲染时不渲染Portal
  if (!mounted || !portalContainer) {
    return null
  }

  return createPortal(children, portalContainer)
}
