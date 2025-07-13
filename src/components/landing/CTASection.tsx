import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
          准备好开始您的创作之旅了吗？
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          立即加入，让AI成为你最得力的内容创作伙伴。
        </p>
        <div className="flex justify-center items-center gap-4">
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="font-bold py-6 px-8 rounded-lg text-lg transition-all duration-300"
            >
              登录
            </Button>
          </Link>
          <Link to="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg text-lg transition-all duration-300 transform hover:scale-105"
            >
              免费开启高效创作之旅 →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}