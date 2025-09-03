import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
// 🔧 [DIRECT_AUTH_FIX_v2025.08.15] 使用DirectAuth替代UnifiedAuth
import { useAuth } from "@/hooks/useAuth"
import { useI18n } from "@/hooks/useI18n"

export function CTASection() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleButtonClick = async () => {
    try {
      console.log('=== CTA按钮点击事件开始 ===');
      console.log('CTA按钮被点击');
      console.log('当前认证状态:', isAuthenticated);
      console.log('login函数类型:', typeof login);
      console.log('navigate函数类型:', typeof navigate);
      
      // 修复跳转逻辑：跳转到AI内容适配器页面顶部
      if (isAuthenticated) {
        console.log('用户已登录，跳转到AI内容适配器页面');
        navigate('/new-adapt');
        // 页面加载后滚动到内容生成区
        setTimeout(() => {
          const contentArea = document.getElementById('content-generation-area');
          if (contentArea) {
            contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            // 如果内容生成区不存在，滚动到页面中部区域
            window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });
          }
        }, 500);
      } else {
        console.log('用户未登录，设置跳转目标并弹出登录弹窗');
        localStorage.setItem('login_redirect_to', '/new-adapt');
        await login();
      }
      
      console.log('=== CTA按钮点击事件完成 ===');
    } catch (error) {
      console.error('CTA按钮点击事件出错:', error);
      // 备用方案：直接跳转
      try {
        window.location.href = '/new-adapt';
      } catch (fallbackError) {
        console.error('备用跳转也失败:', fallbackError);
      }
    }
  };

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-6 text-center">
        {/* 1️⃣ 主标题 */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2 drop-shadow-sm">
          {t('home.cta.title')}
        </h2>

        {/* 2️⃣ 副标题 */}
        <p className="text-base text-muted-foreground text-center mb-6 max-w-xl mx-auto leading-relaxed">
          {t('home.cta.subtitle')}
        </p>
        
        {/* 3️⃣ CTA 按钮 */}
        <div className="flex justify-center">
          <Button
            size="lg"
            variant="gradient"
            className="relative px-10 py-5 rounded-xl font-bold cursor-pointer overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleButtonClick}
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {t('home.cta.buttonText')}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-smooth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Button>
        </div>
      </div>
    </section>
  )
} 