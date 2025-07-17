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
    <section className="py-20 bg-gradient-to-br from-gray-50to-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5ont-extrabold text-gray-900 mb-6">
          准备好开始您的创作之旅了吗？
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3l mx-auto mb-10">
          立即加入，让AI成为你最得力的内容创作伙伴。
        </p>
        <div className="flex justify-center items-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500o-purple-600over:from-blue-600over:to-purple-70xt-white font-bold py-6 rounded-lg shadow-lg text-lg transition-all duration-300nsform hover:scale-105"
            onClick={handleButtonClick}
            style={{ cursor: 'pointer' }}
          >
            免费开启高效创作之旅 →
          </Button>
        </div>
      </div>
    </section>
  )
} 