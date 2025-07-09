import { Card } from "@/components/ui/card"

type TestimonialProps = {
  content: string
  name: string
  position: string
  index: number
}

function TestimonialCard({ content, name, position, index }: TestimonialProps) {
  // Generate consistent avatar based on name and position
  const getAvatarUrl = (index: number) => {
    const avatarTypes = ['business', 'marketing', 'tech', 'creative'];
    const type = avatarTypes[index % avatarTypes.length];
    
    // Use index to ensure different avatars for each testimonial
    switch(type) {
      case 'business':
        return `https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop`;
      case 'marketing':
        return `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop`;
      case 'tech':
        return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop`;
      case 'creative':
        return `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop`;
      default:
        return `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop`;
    }
  };

  return (
    <Card className="bg-gray-100 p-8 rounded-xl shadow-lg">
      <p className="text-gray-700">{content}</p>
      <div className="mt-6 flex items-start">
        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
          <img src={getAvatarUrl(index)} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="ml-4 flex-1">
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{position}</p>
        </div>
      </div>
    </Card>
  )
}

export function TestimonialsSection() {
  const testimonials = [
    {
              content: "过去一个团队半天的工作量，现在用AI内容适配器10分钟就搞定了，而且内容质量和品牌一致性都非常有保障。这是我们团队今年引入的最有价值的工具。",
      name: "王经理",
      position: "某快消品牌市场总监"
    },
    {
      content: "我能把更多精力放在视频创意上，而不是头疼怎么把一篇深度稿件改成适合短视频的脚本。这个工具真正解放了我的生产力！",
      name: "科技博主阿文",
      position: "B站百大UP主"
    },
    {
      content: "作为一家MCN机构，效率就是生命线。这款工具帮我们把内容分发效率提升了至少5倍，让我们能服务更多客户，强烈推荐！",
      name: "李总",
      position: "新媒体代运营机构创始人"
    },
    {
      content: "文派不仅节省了我大量撰写多平台内容的时间，而且生成的内容质量超出预期。每个平台风格都恰到好处，完美保持了品牌核心信息。",
      name: "张女士",
      position: "知名美妆品牌社交媒体主管"
    }
  ]

  return (
    <section id="testimonials" className="py-20 bg-white opacity-0 animate-fadeIn">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">看看内容专家们怎么说</h2>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              content={testimonial.content}
              name={testimonial.name}
              position={testimonial.position}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}