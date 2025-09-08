/**
 * 内容适配器组件架构演示
 * 展示新的模块化组件如何协同工作
 */

import React from 'react';
import {
  ContentAdapterPage,
  ContentInputSection,
  PlatformSelector,
  GenerationControls,
  ResultsDisplay
} from '../components';

// 演示：完整的内容适配器页面
export const FullPageDemo: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">内容适配器 - 完整页面演示</h1>
      <ContentAdapterPage />
    </div>
  );
};

// 演示：独立组件使用
export const IndependentComponentsDemo: React.FC = () => {
  const [originalContent, setOriginalContent] = React.useState('');
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  
  // 模拟翻译函数
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'adapt.inputOriginalContent': '输入原始内容',
      'adapt.remainingUsage': '剩余使用次数',
      'adapt.selectPlatforms': '选择目标平台',
      'adapt.generateContent': '生成内容',
      'adapt.results': '生成结果'
    };
    return translations[key] || key;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">组件独立使用演示</h1>
      
      {/* 内容输入组件演示 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">1. 内容输入组件</h2>
        <ContentInputSection
          originalContent={originalContent}
          onContentChange={setOriginalContent}
          usageRemaining={100}
          currentTier="pro"
          t={t}
          placeholder="在这里输入您要适配的内容..."
          minHeight="150px"
        />
      </section>

      {/* 平台选择组件演示 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">2. 平台选择组件</h2>
        <PlatformSelector
          selectedPlatforms={selectedPlatforms}
          onPlatformsChange={setSelectedPlatforms}
          globalSettings={{
            charCount: 500,
            useEmoji: true,
            useMdFormat: false,
            useAutoFormat: true
          }}
          platformSettings={{}}
          onGlobalSettingsChange={() => {}}
          onPlatformSettingsChange={() => {}}
          settingsMode={{
            charCount: 'global',
            emoji: 'global',
            mdFormat: 'global'
          }}
          onSettingsModeChange={() => {}}
          t={t}
        />
      </section>

      {/* 生成控制组件演示 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">3. 生成控制组件</h2>
        <GenerationControls
          originalContent={originalContent}
          selectedPlatforms={selectedPlatforms}
          selectedFormId="article"
          selectedStyle="professional"
          selectedModel="gpt-4"
          useBrandLibrary={false}
          customPrompt=""
          onFormChange={() => {}}
          onStyleChange={() => {}}
          onModelChange={() => {}}
          onBrandLibraryChange={() => {}}
          onCustomPromptChange={() => {}}
          onGenerate={() => {
            console.log('开始生成内容...');
          }}
          generating={false}
          validationErrors={[]}
          t={t}
        />
      </section>

      {/* 结果展示组件演示 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">4. 结果展示组件</h2>
        <ResultsDisplay
          results={{
            xiaohongshu: {
              content: '🌟 今天要给大家分享一个超实用的小技巧！\n\n相信很多小伙伴都遇到过这样的问题...',
              title: '实用技巧分享',
              status: 'completed',
              timestamp: Date.now(),
              metadata: { charCount: 150, platform: 'xiaohongshu' }
            },
            douyin: {
              content: '🔥 这个技巧太实用了！\n\n#实用技巧 #生活小窍门 #必看',
              title: '实用技巧',
              status: 'completed',
              timestamp: Date.now(),
              metadata: { charCount: 80, platform: 'douyin' }
            }
          }}
          selectedPlatforms={['xiaohongshu', 'douyin']}
          generating={false}
          retryingPlatforms={[]}
          regeneratingVersions={[]}
          onRetryPlatform={() => {}}
          onRegenerateVersion={() => {}}
          onGenerateComparison={() => {}}
          onGenerateTitle={() => {}}
          onContentEdit={() => {}}
          onCopyContent={() => {}}
          onSaveContent={() => {}}
          onPublishContent={() => {}}
          generationSteps={[
            { status: 'completed', message: '分析原始内容' },
            { status: 'completed', message: '生成平台适配内容' },
            { status: 'completed', message: '优化内容质量' },
            { status: 'completed', message: '生成完成' }
          ]}
          t={t}
        />
      </section>
    </div>
  );
};

// 演示：自定义组合
export const CustomCompositionDemo: React.FC = () => {
  const [step, setStep] = React.useState(1);
  const [originalContent, setOriginalContent] = React.useState('');
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);

  const t = (key: string) => key;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">自定义组合演示 - 分步骤流程</h1>
      
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div
                className={`w-16 h-1 ${
                  step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="max-w-4xl mx-auto">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">步骤1: 输入内容</h2>
            <ContentInputSection
              originalContent={originalContent}
              onContentChange={setOriginalContent}
              usageRemaining={100}
              currentTier="pro"
              t={t}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!originalContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">步骤2: 选择平台</h2>
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformsChange={setSelectedPlatforms}
              globalSettings={{}}
              platformSettings={{}}
              onGlobalSettingsChange={() => {}}
              onPlatformSettingsChange={() => {}}
              settingsMode={{
                charCount: 'global',
                emoji: 'global',
                mdFormat: 'global'
              }}
              onSettingsModeChange={() => {}}
              t={t}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedPlatforms.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">步骤3: 配置生成</h2>
            <GenerationControls
              originalContent={originalContent}
              selectedPlatforms={selectedPlatforms}
              selectedFormId="article"
              selectedStyle="professional"
              selectedModel="gpt-4"
              useBrandLibrary={false}
              customPrompt=""
              onFormChange={() => {}}
              onStyleChange={() => {}}
              onModelChange={() => {}}
              onBrandLibraryChange={() => {}}
              onCustomPromptChange={() => {}}
              onGenerate={() => setStep(4)}
              generating={false}
              validationErrors={[]}
              t={t}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg"
              >
                上一步
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">步骤4: 查看结果</h2>
            <ResultsDisplay
              results={{}}
              selectedPlatforms={selectedPlatforms}
              generating={false}
              retryingPlatforms={[]}
              regeneratingVersions={[]}
              onRetryPlatform={() => {}}
              onRegenerateVersion={() => {}}
              onGenerateComparison={() => {}}
              onGenerateTitle={() => {}}
              onContentEdit={() => {}}
              onCopyContent={() => {}}
              onSaveContent={() => {}}
              onPublishContent={() => {}}
              generationSteps={[]}
              t={t}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg"
              >
                重新开始
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 导出所有演示组件
export default {
  FullPageDemo,
  IndependentComponentsDemo,
  CustomCompositionDemo
};
