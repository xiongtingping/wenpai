export function HowItWorks() {
  return (
    <section className="py-20 bg-white opacity-0 animate-fadeIn" id="how-it-works-section">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">三步搞定，就这么简单</h2>
          <p className="mt-4 text-lg text-gray-600">告别繁琐的内容适配流程，把时间用在创意上。</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Step 1 */}
          <div className="step">
            <div className="flex justify-center items-center h-20 w-20 mx-auto bg-blue-100 text-blue-600 rounded-full text-3xl font-bold">1</div>
            <h3 className="mt-6 text-xl font-semibold">输入任意内容</h3>
            <p className="mt-2 text-gray-600">粘贴您的原始文案、文章段落，甚至是已发布的文章链接。</p>
          </div>
          {/* Step 2 */}
          <div className="step">
            <div className="flex justify-center items-center h-20 w-20 mx-auto bg-indigo-100 text-indigo-600 rounded-full text-3xl font-bold">2</div>
            <h3 className="mt-6 text-xl font-semibold">选择目标平台</h3>
            <p className="mt-2 text-gray-600">勾选您想分发的所有平台，并可选择精细化风格。</p>
          </div>
          {/* Step 3 */}
          <div className="step">
            <div className="flex justify-center items-center h-20 w-20 mx-auto bg-purple-100 text-purple-600 rounded-full text-3xl font-bold">3</div>
            <h3 className="mt-6 text-xl font-semibold">一键获取所有版本</h3>
            <p className="mt-2 text-gray-600">AI瞬间为您生成所有适配版本，一键复制、导出或分享。</p>
          </div>
        </div>
      </div>
    </section>
  )
}