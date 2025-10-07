import { Mail, ExternalLink, User, FileText, Check, ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

/**
 * 飞书图标组件
 */
const FeishuIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5zm0-3h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5zm-2-3h-7c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h7c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
  </svg>
)

/**
 * 网站底部 Footer 组件
 * - 美观设计，品牌感与专业感提升
 * - 响应式布局，移动端和桌面端优化
 * - 重新设计的联系方式布局
 */
export function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  // 返回顶部按钮显示控制
  const [showBackTop, setShowBackTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      window.scrollTo(0, 0)
    }
  }

  const { t } = useTranslation()

  // 复制邮箱地址
  const handleEmailCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await navigator.clipboard.writeText('hello@wenpai.xyz')
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      // 如果复制失败，仍然打开邮件客户端
      window.location.href = 'mailto:hello@wenpai.xyz'
    }
  }

  return (
    <footer className="bg-gradient-to-t from-muted/30 to-background border-t border-border/50">
      <div className="ds-container py-8">
        {/* 主要内容区域 - 紧凑设计 */}
        <div className="max-w-4xl mx-auto">
          {/* 品牌标语区域 - 精简 */}
          <div className="ds-text-centered mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src="/ikigai_4circles_multiply.svg"
                alt="WenPai Logo"
                className="w-6 h-6 flex-shrink-0 footer-logo"
                style={{
                  filter: 'drop-shadow(0 0 0 transparent)',
                  mixBlendMode: 'multiply'
                }}
              />
              <h3 className="ds-title-section ds-text-primary leading-none">文派</h3>
            </div>
            <p className="ds-text-helper ds-text-secondary max-w-sm mx-auto">
              AI驱动的内容创作平台，让内容更出彩。
            </p>
          </div>

          {/* 联系方式区域 - 精简横向布局 */}
          <div className="mb-6">
            <div className="flex flex-wrap justify-center items-center gap-4 max-w-3xl mx-auto">
              {/* 建议反馈 */}
              <a
                href="https://w5vi53wcc1.feishu.cn/wiki/CUPlw67YsiKT2skn190cWEVwnkh?from=from_copylink"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 ds-transition-standard"
                title={t('components.labels.标题')}
              >
                <div className="ds-icon-small bg-primary/10 text-primary group-hover:bg-primary/20 ds-transition-standard">
                  <FeishuIcon className="w-3 h-3" />
                </div>
                <span className="ds-text-helper ds-text-primary font-medium">{t('footer.feedback')}</span>
              </a>

              {/* 邮箱联系 */}
              <button
                onClick={handleEmailCopy}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 ds-transition-standard relative"
                title={t('components.labels.标题')}
              >
                <div className="ds-icon-small bg-success/10 text-success group-hover:bg-success/20 ds-transition-standard">
                  {emailCopied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Mail className="w-3 h-3" />
                  )}
                </div>
                <span className="ds-text-helper ds-text-primary font-medium">
                  {emailCopied ? '已复制!' : t('footer.contactUs')}
                </span>
                {emailCopied && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-success text-background text-xs px-2 py-1 rounded shadow-lg">
                    已复制到剪贴板
                  </div>
                )}
              </button>

              {/* 交个朋友 */}
              <a
                href="https://bento.me/pandatalk"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 ds-transition-standard"
                title={t('components.labels.标题')}
              >
                <div className="ds-icon-small bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/20 ds-transition-standard">
                  <User className="w-3 h-3" />
                </div>
                <span className="ds-text-helper ds-text-primary font-medium">交个朋友</span>
              </a>

              {/* 客服二维码 */}
              <div className="relative">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 ds-transition-standard"
                >
                  <div className="ds-icon-small bg-orange-500/10 text-orange-600 group-hover:bg-orange-500/20 ds-transition-standard">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 2.5c0 .83-.67 1.5-1.5 1.5S12 7.33 12 6.5 12.67 5 13.5 5s1.5.67 1.5 1.5zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                    </svg>
                  </div>
                  <span className="ds-text-helper ds-text-primary font-medium">客服支持</span>
                </button>

                {/* 二维码弹窗 - 精简版 */}
                {showQRCode && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                    <div className="bg-background rounded-xl shadow-xl border border-border p-4 min-w-[200px]">
                      <div className="text-center">
                        <h3 className="ds-text-helper ds-text-primary font-semibold mb-2">客服支持</h3>

                        <div className="bg-gray-50 dark:bg-foreground rounded-lg p-2 mb-3">
                          <img
                            src="/微信图片_2025-09-02_134203_916.png"
                            alt="客服二维码"
                            className="w-24 h-24 object-contain mx-auto rounded"
                          />
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">工作时间：9:00-18:00</p>

                        <button
                          onClick={() => setShowQRCode(false)}
                          className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 text-foreground rounded ds-transition-standard"
                        >
                          关闭
                        </button>
                      </div>
                    </div>
                    {/* 箭头指示器 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-background"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-border/50 my-4"></div>

          {/* 资源链接区域 */}
          <div className="mb-6">
            <h4 className="ds-text-helper ds-text-primary font-semibold text-center mb-3">资源中心</h4>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <a
                href="/docs.html"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/50 ds-transition-standard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="ds-text-helper ds-text-primary hover:text-foreground">产品文档</span>
              </a>

              <a
                href="/faq.html"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/50 ds-transition-standard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="ds-text-helper ds-text-primary hover:text-foreground">常见问题</span>
              </a>

              <a
                href="/guide.html"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/50 ds-transition-standard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="ds-text-helper ds-text-primary hover:text-foreground">使用指南</span>
              </a>

              <a
                href="/api.html"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/50 ds-transition-standard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="ds-text-helper ds-text-primary hover:text-foreground">API文档</span>
              </a>

              <a
                href="/about.html"
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/50 ds-transition-standard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span className="ds-text-helper ds-text-primary hover:text-foreground">关于我们</span>
              </a>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-border/50 my-4"></div>

          {/* 底部信息 - 精简版 */}
          <div className="ds-text-centered">
            <div className="flex flex-wrap justify-center items-center gap-4 mb-2">
              <a
                href="/terms"
                className="ds-text-helper ds-text-secondary hover:text-foreground ds-transition-standard"
              >
                服务条款
              </a>
              <span className="ds-text-helper text-muted-foreground/30">|</span>
              <a


                href="/privacy"
                className="ds-text-helper ds-text-secondary hover:text-foreground ds-transition-standard"
              >
                {t('footer.privacyPolicy')}
              </a>
              <span className="ds-text-helper text-muted-foreground/30">|</span>
              <a
                href="https://www.wenpai.xyz"
                className="ds-text-helper ds-text-secondary hover:text-foreground ds-transition-standard"
              >
                www.wenpai.xyz
              </a>
            </div>
            <div className="ds-text-helper ds-text-secondary">
              © 2025 {t('footer.brandDescription')}
            </div>
          </div>
        </div>
      </div>
      {/* 返回顶部（右下角固定） */}
      {showBackTop && (
        <Button
          aria-label="返回顶部"
          onClick={scrollToTop}
          variant="secondary"
          size="icon"
          className="fixed bottom-6 right-6 z-[1000] rounded-full shadow-lg"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}

    </footer>
  )
}