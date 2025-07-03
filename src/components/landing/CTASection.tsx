import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function CTASection() {
  return (
    <section className="py-20 opacity-0 animate-fadeIn">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">准备好革新你的内容工作流了吗？</h2>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          立即加入，让AI成为你最得力的内容创作伙伴。
        </p>
        <div className="mt-10">
          <Link to="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-bold py-6 px-8 rounded-lg shadow-lg text-lg"
            >
              免费开启高效创作之旅 →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}