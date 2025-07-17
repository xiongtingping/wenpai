import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useUnifiedAuthContext } from "@/contexts/UnifiedAuthContext"

export function CTASection() {
  const { isAuthenticated, login } = useUnifiedAuthContext();
  const navigate = useNavigate();

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
            onClick={() => {
              console.log('CTA按钮被点击');
              console.log('当前认证状态:', isAuthenticated);
              
              // 修复跳转逻辑：直接使用login方法
              if (isAuthenticated) {
                console.log('用户已登录，跳转到适配页面');
                navigate('/adapt');
              } else {
                console.log('用户未登录，直接弹出Authing Guard弹窗');
                login('/adapt');
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