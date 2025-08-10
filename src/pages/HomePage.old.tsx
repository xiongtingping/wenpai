import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Zap,
  Target,
  Users,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Palette,
  BarChart3,
  MessageSquare,
  Star,
  Play
} from "lucide-react"
import PageTracker from "@/components/analytics/PageTracker"
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const features = [
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "AI内容创作",
      description: "智能生成高质量营销文案，让创意无限延伸",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "品牌语料库",
      description: "构建专属品牌知识库，确保内容风格一致",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "多平台适配",
      description: "一键适配小红书、抖音、微博等主流平台",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "智能对话",
      description: "与AI助手深度交流，获得专业创作建议",
      gradient: "from-green-400 to-emerald-500"
    }
  ]

  const testimonials = [
    {
      name: "张小美",
      role: "品牌营销总监",
      content: "文派让我们的内容创作效率提升了300%，AI生成的文案质量超出预期！",
      avatar: "👩‍💼"
    },
    {
      name: "李创意",
      role: "自媒体博主",
      content: "从此告别创作瓶颈，每天都能产出优质内容，粉丝增长明显加速。",
      avatar: "👨‍🎨"
    },
    {
      name: "王运营",
      role: "电商运营",
      content: "多平台内容适配功能太棒了，一份文案轻松覆盖所有渠道。",
      avatar: "👩‍💻"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 页面访问记录 */}
      <PageTracker
        title="文派 - AI驱动的创意内容平台"
        description="专业的AI内容创作工具，助力品牌营销和内容创作"
        metadata={{
          layout: 'glassmorphism',
          hasNavigation: false,
          pageType: 'home'
        }}
      />

      {/* 动态渐变背景 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-80" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

        {/* 几何装饰线条 */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 1000">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path d="M100,200 Q300,100 500,200 T900,200" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M200,400 Q400,300 600,400 T1000,400" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <path d="M0,600 Q200,500 400,600 T800,600" stroke="url(#lineGradient)" strokeWidth="2" fill="none" />
          <circle cx="150" cy="150" r="3" fill="white" opacity="0.6" />
          <circle cx="850" cy="250" r="3" fill="white" opacity="0.6" />
          <circle cx="300" cy="700" r="3" fill="white" opacity="0.6" />
          <circle cx="700" cy="800" r="3" fill="white" opacity="0.6" />
        </svg>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10">
        {/* 导航栏 */}
        <nav className="backdrop-blur-md bg-card/10 border-b border-white/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">文派</span>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-white/80 hover:text-white transition-colors">功能特色</a>
                <a href="#testimonials" className="text-white/80 hover:text-white transition-colors">用户评价</a>
                <a href="#pricing" className="text-white/80 hover:text-white transition-colors">价格方案</a>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-card/20"
                  onClick={() => navigate('/login')}
                >
                  登录
                </Button>
                <Button
                  className="bg-card text-foreground hover:bg-card/90"
                  onClick={() => navigate('/register')}
                >
                  开始使用
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-card/20 text-white border-white/30 hover:bg-card/30">
              <Zap className="h-4 w-4 mr-2" />
              AI驱动的内容创作平台
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              让AI成为你的
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                创意伙伴
              </span>
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              智能生成高质量营销文案，构建专属品牌语料库，一键适配多个平台。
              让创意无限延伸，让内容创作变得简单高效。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-card text-foreground hover:bg-card/90 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/register')}
              >
                <Play className="h-5 w-5 mr-2" />
                立即体验
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-card/20 px-8 py-4 text-lg"
                onClick={() => navigate('/demo')}
              >
                观看演示
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* 模拟聊天界面预览 */}
            <div className="relative max-w-2xl mx-auto">
              <Card className="backdrop-blur-md bg-card/10 border-white/20 p-6">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-card/20 backdrop-blur-sm rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-white text-sm">帮我写一篇小红书种草文案</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl px-4 py-2 max-w-xs">
                      <p className="text-white text-sm">好的！我来为你创作一篇吸引人的种草文案...</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">强大功能，简单易用</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              集成最先进的AI技术，为你提供全方位的内容创作解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="backdrop-blur-md bg-card/10 border-white/20 hover:bg-card/20 transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">三步开启创作之旅</h2>
            <p className="text-xl text-white/80">简单几步，即可体验AI创作的魅力</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "描述需求",
                description: "告诉AI你想要什么类型的内容，包括平台、风格、目标受众等",
                icon: <Target className="h-8 w-8" />
              },
              {
                step: "02",
                title: "AI智能生成",
                description: "基于你的品牌语料库和需求，AI快速生成高质量内容",
                icon: <Sparkles className="h-8 w-8" />
              },
              {
                step: "03",
                title: "一键发布",
                description: "内容自动适配各平台格式，一键复制即可发布到目标渠道",
                icon: <Zap className="h-8 w-8" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <Card className="backdrop-blur-md bg-card/10 border-white/20 p-8 hover:bg-card/20 transition-all duration-300">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">用户真实反馈</h2>
            <p className="text-xl text-white/80">看看其他创作者如何通过文派提升效率</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="backdrop-blur-md bg-card/10 border-white/20 p-6 hover:bg-card/20 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-muted-foreground fill-current" />
                  ))}
                </div>
                <p className="text-white/80 leading-relaxed">{testimonial.content}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">选择适合你的方案</h2>
            <p className="text-xl text-white/80">灵活的定价，满足不同需求</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "免费体验",
                price: "¥0",
                period: "/月",
                description: "适合个人用户试用",
                features: ["每日10次AI生成", "基础模板库", "社区支持"],
                popular: false
              },
              {
                name: "专业版",
                price: "¥99",
                period: "/月",
                description: "适合专业创作者",
                features: ["无限AI生成", "高级模板库", "品牌语料库", "多平台适配", "优先客服"],
                popular: true
              },
              {
                name: "企业版",
                price: "¥299",
                period: "/月",
                description: "适合团队和企业",
                features: ["团队协作", "API接入", "定制化服务", "专属客服", "数据分析"],
                popular: false
              }
            ].map((plan, index) => (
              <Card
                key={index}
                className={`backdrop-blur-md border-white/20 p-8 hover:scale-105 transition-all duration-300 relative ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-primary/50'
                    : 'bg-card/10 hover:bg-card/20'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    最受欢迎
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/60 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-white/80">
                      <CheckCircle className="h-4 w-4 text-foreground mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                      : 'bg-card/20 hover:bg-card/30 text-white'
                  }`}
                  onClick={() => navigate('/register')}
                >
                  {plan.price === '¥0' ? '免费开始' : '立即订阅'}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <Card className="backdrop-blur-md bg-card/10 border-white/20 p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">准备好开始创作了吗？</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              加入数万创作者的行列，让AI助力你的内容创作之旅
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/register')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                免费开始创作
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-card/20 px-8 py-4 text-lg"
                onClick={() => navigate('/contact')}
              >
                <Users className="h-5 w-5 mr-2" />
                联系我们
              </Button>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="backdrop-blur-md bg-card/5 border-t border-white/20 py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">文派</span>
                </div>
                <p className="text-white/60 text-sm">
                  AI驱动的创意内容平台，让创作变得简单高效
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">产品</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">AI内容创作</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">品牌语料库</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">多平台适配</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">支持</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">用户反馈</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">关于</h4>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">服务条款</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/20 mt-8 pt-8 text-center">
              <p className="text-white/60 text-sm">
                © 2024 文派. 保留所有权利.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default HomePage