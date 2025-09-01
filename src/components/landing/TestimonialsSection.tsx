import { Card } from "@/components/ui/card"
import { useI18n } from "@/hooks/useI18n"

type TestimonialProps = {
  content: string
  name: string
  position: string
  index: number
}

// 替换头像为虚拟SVG
const VirtualAvatar = ({ index }: { index: number }) => {
  const colors = [
    'text-primary', 'text-foreground', 'text-muted-foreground', 'text-foreground'
  ];
  const color = colors[index % colors.length];
  return (
    <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 ${color}`}>
      {/* 简单AI机器人SVG */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="20" height="14" rx="6" fill="currentColor" />
        <rect x="12" y="6" width="8" height="6" rx="3" fill="currentColor" />
        <circle cx="12" cy="17" r="2" fill="hsl(var(--background))" />
        <circle cx="20" cy="17" r="2" fill="hsl(var(--background))" />
        <rect x="14" y="21" width="4" height="2" rx="1" fill="hsl(var(--background))" />
      </svg>
    </div>
  );
};

function TestimonialCard({ content, name, position, index }: TestimonialProps) {
  return (
    <Card className="bg-card p-8 rounded-xl shadow-lg border border-border">
      <p className="text-muted-foreground">{content}</p>
      <div className="mt-6 flex items-start">
        <VirtualAvatar index={index} />
        <div className="ml-4 flex-1">
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{position}</p>
        </div>
      </div>
    </Card>
  )
}

export function TestimonialsSection() {
  const { t } = useI18n()

  const testimonials = [
    {
      content: t('home.testimonials.testimonial1.content'),
      name: t('home.testimonials.testimonial1.name'),
      position: t('home.testimonials.testimonial1.position')
    },
    {
      content: t('home.testimonials.testimonial2.content'),
      name: t('home.testimonials.testimonial2.name'),
      position: t('home.testimonials.testimonial2.position')
    },
    {
      content: t('home.testimonials.testimonial3.content'),
      name: t('home.testimonials.testimonial3.name'),
      position: t('home.testimonials.testimonial3.position')
    },
    {
      content: t('home.testimonials.testimonial4.content'),
      name: t('home.testimonials.testimonial4.name'),
      position: t('home.testimonials.testimonial4.position')
    }
  ]

  // ✅ FIXED: 暂时隐藏专家推荐部分
  return null;

  // return (
  //   <section id="testimonials" className="py-10 opacity-0 animate-fadeIn">
  //     <div className="container mx-auto px-6">
  //       <div className="text-center max-w-3xl mx-auto">
  //         <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('home.testimonials.sectionTitle')}</h2>
  //       </div>
  //       <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  //         {testimonials.map((testimonial, index) => (
  //           <TestimonialCard
  //             key={index}
  //             content={testimonial.content}
  //             name={testimonial.name}
  //             position={testimonial.position}
  //             index={index}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   </section>
  // )
}