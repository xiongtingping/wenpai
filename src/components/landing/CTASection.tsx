import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext"

export function CTASection() {
  const { isAuthenticated, login } = useUnifiedAuth();
  const navigate = useNavigate();

  const handleButtonClick = () => {
    try {
      console.log('=== CTA按钮点击事件开始 ===');
      console.log('CTA按钮被点击');
      console.log('当前认证状态:', isAuthenticated);
      console.log('login函数类型:', typeof login);
      console.log('navigate函数类型:', typeof navigate);
      
      // 修复跳转逻辑：直接使用login方法
      if (isAuthenticated) {
        console.log('用户已登录，跳转到适配页面');
        navigate('/adapt');
      } else {
        console.log('用户未登录，直接弹出Authing Guard弹窗');
        login('/adapt');
      }
      
      console.log('=== CTA按钮点击事件完成 ===');
    } catch (error) {
      console.error('CTA按钮点击事件出错:', error);
      // 备用方案：直接跳转
      try {
        window.location.href = '/adapt';
      } catch (fallbackError) {
        console.error('备用跳转也失败:', fallbackError);
      }
    }
  };

  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden">
      {/* 装饰背景 - 增强视觉层次 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-pink-50/30"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        {/* 1️⃣ 主标题 */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">
          准备好开始您的创作之旅了吗？
        </h2>
        
        {/* 2️⃣ 副标题 */}
        <p className="text-base text-gray-500 text-center mb-6 max-w-xl mx-auto leading-relaxed">
          立即加入，让AI成为你最得力的内容创作伙伴。
        </p>
        
        {/* 3️⃣ CTA 按钮 */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
            onClick={handleButtonClick}
          >
            立即开启高效创作之旅
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  )
} 