import { Mail, ExternalLink, User, FileText, Check } from "lucide-react"
import { useState } from "react"

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
      <div className="container mx-auto px-6 py-12">
        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto">
          {/* 品牌标语区域 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <img
                src="/logo-panda.svg"
                alt="文派Logo"
                className="w-8 h-8"
              />
              <h3 className="text-xl font-bold text-foreground">文派</h3>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              AI驱动的智能内容创作平台，让创意在每个平台都闪闪发光
            </p>
          </div>

          {/* 联系方式区域 */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* 建议反馈 */}
              <a
                href="https://w5vi53wcc1.feishu.cn/wiki/CUPlw67YsiKT2skn190cWEVwnkh?from=from_copylink"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:scale-105"
                title="在飞书文档中提交建议和反馈"
              >
                <div className="w-8 h-8 bg-blue-500/10 rounded-md flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <FeishuIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground text-sm">建议反馈</div>
                  <div className="text-xs text-muted-foreground">飞书文档</div>
                </div>
              </a>

              {/* 邮箱联系 */}
              <button
                onClick={handleEmailCopy}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:scale-105 relative"
                title="点击复制邮箱地址"
              >
                <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  {emailCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Mail className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground text-sm">
                    {emailCopied ? '已复制!' : '邮箱联系'}
                  </div>
                  <div className="text-xs text-muted-foreground">hello@wenpai.xyz</div>
                </div>
                {emailCopied && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                    邮箱已复制到剪贴板
                  </div>
                )}
              </button>

              {/* 关于我 */}
              <a
                href="https://bento.me/pandatalk"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200 hover:scale-105"
                title="了解更多关于开发者"
              >
                <div className="w-8 h-8 bg-purple-500/10 rounded-md flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground text-sm">关于我</div>
                  <div className="text-xs text-muted-foreground">开发者信息</div>
                </div>
              </a>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-border/50 mb-6"></div>

          {/* 底部信息 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            {/* 法律链接 */}
            <div className="flex items-center gap-4">
              <a
                href="/terms"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                服务条款
              </a>
              <span className="text-muted-foreground/30">|</span>
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                隐私政策
              </a>
            </div>

            {/* 版权信息 */}
            <div className="text-center sm:text-right">
              <div>© 2025 文派 · 让创意在每个平台都闪闪发光</div>
              <div className="mt-1">
                <a
                  href="https://www.wenpai.xyz"
                  className="hover:text-foreground transition-colors"
                >
                  www.wenpai.xyz
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}