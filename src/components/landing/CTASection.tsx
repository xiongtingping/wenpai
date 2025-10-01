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
      console.log('=== CTAbutton点击eventstarts ===');
      console.log('CTAbutton被点击');
      console.log('currentauthenticatingstate:', isAuthenticated);
      console.log('loginfunctiontype:', typeof login);
      console.log('navigatefunctiontype:', typeof navigate);
      
      // 修复跳转逻辑：跳转到AI内容适配页面顶部
      if (isAuthenticated) {
        console.log('useralreadylogin，跳转到AIcontent适配page');
        navigate('/content-adapter');
        // 页面加载后滚动到页面顶部
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
      } else {
        console.log('usernotlogin，setting跳转目标并弹出loginpopup');
        localStorage.setItem('login_redirect_to', '/content-adapter');
        await login();
      }
      
      console.log('=== CTAbutton点击eventcompleted ===');
    } catch (error) {
      console.error('CTAbutton点击event出错:', error);
      // 备用方案：直接跳转
      try {
        window.location.href = '/content-adapter';
      } catch (fallbackError) {
        console.error('备用跳转也failed:', fallbackError);
      }
    }
  };

  return (
    <section className="cta-section">
      <div className="ds-container ds-text-centered">
        {/* 1️⃣ 主标题 */}
        <h2 className="ds-title-main text-foreground mb-2 drop-shadow-sm">
          {t('home.cta.title')}
        </h2>

        {/* 2️⃣ 副标题 */}
        <p className="ds-text-body text-muted-foreground mb-6 ds-container-narrow leading-relaxed">
          {t('home.cta.subtitle')}
        </p>

        {/* 3️⃣ CTA 按钮 */}
        <div className="w-full flex justify-center">
          <Button
            size="lg"
            className="cta-button ds-btn-centered"
            onClick={handleButtonClick}
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {t('home.cta.buttonText')}
            <svg className="w-5 h-5 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  )
}
