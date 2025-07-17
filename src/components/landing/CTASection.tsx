import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useUnifiedAuthContext } from "@/contexts/UnifiedAuthContext"

export function CTASection() {
  const { login, isAuthenticated } = useUnifiedAuthContext();
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
          准备好开始您的创作之旅了吗？
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          立即加入，让AI成为你最得力的内容创作伙伴。
        </p>
        <div className="flex justify-center items-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg text-lg transition-all duration-300 transform hover:scale-105"
            onClick={() => {
              console.log('CTA按钮被点击');
              console.log('当前认证状态:', isAuthenticated);
              
              // 优化跳转逻辑，减少延迟
              if (isAuthenticated) {
                console.log('用户已登录，跳转到适配页面');
                navigate('/adapt');
              } else {
                console.log('用户未登录，保存跳转目标并尝试登录');
                localStorage.setItem('login_redirect_to', '/adapt');
                try {
                  console.log('尝试调用登录方法');
                  login();
                } catch (error) {
                  console.warn('Authing登录服务不可用，直接跳转到登录页面');
                  navigate('/login');
                }
              }
            }}
          >
            免费开启高效创作之旅 →
          </Button>
        </div>
      </div>
    </section>
  )
}