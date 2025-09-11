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
          useBrandLibrary={false}
          onBrandLibraryChange={() => {}}
          t={t}
          placeholder="在这里输入您要适配的内容..."
          minHeight="150px"
        />
      </section>

      {/* 平台选择组件演示 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">2. 平台选择组件</h2>
        <PlatformSelector
          availablePlatforms={[
            { id: 'weibo', name: '微博', maxCharCount: 140 },
            { id: 'wechat', name: '微信', maxCharCount: 2000 },
            { id: 'xiaohongshu', name: '小红书', maxCharCount: 1000 }
          ]}
          selectedPlatforms={selectedPlatforms}
          onPlatformToggle={(platformId) => {
            setSelectedPlatforms(prev =>
              prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId]
            );
          }}
          globalSettings={{
            charCountPreset: '500',
            globalEmoji: true,
            globalMd: false,
            globalAutoFormat: true
          }}
          platformSettings={{}}
          onGlobalSettingsUpdate={{
            charCountPreset: () => {},
            globalEmoji: () => {},
            globalMd: () => {},
            globalAutoFormat: () => {}
          }}
          onPlatformSettingUpdate={() => {}}
          settingsMode={{
            charCount: 'global',
            emoji: 'global',
            mdFormat: 'global',
            autoFormat: 'global'
          }}
          onSettingsModeChange={() => {}}
          getPlatformIcon={(platformId: string) => <span>📱</span>}
          getPlatformName={(platformId: string) => platformId}
          getPlatformMaxCharCount={(platformId: string) => 1000}
          getPlatformRecommendedCharCount={(platformId: string) => 500}
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
          queueRunning={false}
          availableModels={[
            { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI GPT-4', tier: 'premium', company: 'OpenAI' }
          ]}
          onStopGeneration={() => {}}
          onStartAutomation={() => {}}
          onStopAutomation={() => {}}
          onClearResults={() => {}}
          validationErrors={[]}
          t={t}
        />
      </section>

      {/* 结果展示组件演示 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">4. 结果展示组件</h2>
        <ResultsDisplay
          results={[
            {
              platformId: 'xiaohongshu',
              content: '🌟 今天要给大家分享一个超实用的小技巧！\n\n相信很多小伙伴都遇到过这样的问题...',
              steps: [
                { name: 'prepare', status: 'completed', message: '准备完成' },
                { name: 'prompt', status: 'completed', message: '提示词构建完成' },
                { name: 'ai', status: 'completed', message: 'AI生成完成' },
                { name: 'process', status: 'completed', message: '处理完成' }
              ],
              source: 'ai',
              versions: [{
                id: '1',
                content: '🌟 今天要给大家分享一个超实用的小技巧！\n\n相信很多小伙伴都遇到过这样的问题...',
                style: 'standard' as const,
                title: '实用技巧分享',
                charCount: 150
              }]
            },
            {
              platformId: 'douyin',
              content: '🔥 这个技巧太实用了！\n\n#实用技巧 #生活小窍门 #必看',
              steps: [
                { name: 'prepare', status: 'completed', message: '准备完成' },
                { name: 'prompt', status: 'completed', message: '提示词构建完成' },
                { name: 'ai', status: 'completed', message: 'AI生成完成' },
                { name: 'process', status: 'completed', message: '处理完成' }
              ],
              source: 'ai',
              versions: [{
                id: '1',
                content: '🔥 这个技巧太实用了！\n\n#实用技巧 #生活小窍门 #必看',
                style: 'creative' as const,
                title: '实用技巧',
                charCount: 80
              }]
            }
          ]}
          retryingPlatforms={new Set()}
          generatingComparison={new Set()}
          titleStates={{}}
          comparisonContent={{}}
          showComparison={{}}
          extractedTagsMap={{}}
          selectedVersions={{}}
          favoriteStates={new Set()}
          persistentFavorites={new Set()}
          onContentUpdate={() => {}}
          onRetry={() => {}}
          onGenerateComparison={() => {}}
          onGenerateTitle={() => {}}
          onCopyContent={() => {}}
          onSaveToFavorites={() => {}}
          onPublishToPlatform={() => {}}
          onVersionSelect={() => {}}
          getPlatformIcon={() => <span>📱</span>}
          getPlatformName={(id) => id}
          getEffectiveCharCount={() => 500}
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
                  ? 'bg-primary text-background'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {stepNum}
            </div>
            {stepNum < 4 && (
              <div
                className={`w-16 h-1 ${
                  step > stepNum ? 'bg-primary' : 'bg-muted'
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
              useBrandLibrary={false}
              onBrandLibraryChange={() => {}}
              t={t}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!originalContent.trim()}
                className="px-6 py-2 bg-primary text-background rounded-lg disabled:opacity-50"
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
              availablePlatforms={[
                { id: 'weibo', name: '微博', maxCharCount: 140 },
                { id: 'wechat', name: '微信', maxCharCount: 2000 },
                { id: 'xiaohongshu', name: '小红书', maxCharCount: 1000 }
              ]}
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={(platformId) => {
                setSelectedPlatforms(prev =>
                  prev.includes(platformId)
                    ? prev.filter(id => id !== platformId)
                    : [...prev, platformId]
                );
              }}
              globalSettings={{
                charCountPreset: '500',
                globalEmoji: true,
                globalMd: false,
                globalAutoFormat: true
              }}
              platformSettings={{}}
              onGlobalSettingsUpdate={{
                charCountPreset: () => {},
                globalEmoji: () => {},
                globalMd: () => {},
                globalAutoFormat: () => {}
              }}
              onPlatformSettingUpdate={() => {}}
              settingsMode={{
                charCount: 'global',
                emoji: 'global',
                mdFormat: 'global',
                autoFormat: 'global'
              }}
              onSettingsModeChange={() => {}}
              getPlatformIcon={(platformId: string) => <span>📱</span>}
              getPlatformName={(platformId: string) => platformId}
              getPlatformMaxCharCount={(platformId: string) => 1000}
              getPlatformRecommendedCharCount={(platformId: string) => 500}
              t={t}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-600 text-background rounded-lg"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedPlatforms.length === 0}
                className="px-6 py-2 bg-primary text-background rounded-lg disabled:opacity-50"
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
              queueRunning={false}
              availableModels={[
                { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI GPT-4', tier: 'premium', company: 'OpenAI' }
              ]}
              onStopGeneration={() => {}}
              onStartAutomation={() => {}}
              onStopAutomation={() => {}}
              onClearResults={() => {}}
              validationErrors={[]}
              t={t}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-gray-600 text-background rounded-lg"
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
              results={[]}
              retryingPlatforms={new Set()}
              generatingComparison={new Set()}
              titleStates={{}}
              comparisonContent={{}}
              showComparison={{}}
              extractedTagsMap={{}}
              selectedVersions={{}}
              favoriteStates={new Set()}
              persistentFavorites={new Set()}
              onContentUpdate={() => {}}
              onRetry={() => {}}
              onGenerateComparison={() => {}}
              onGenerateTitle={() => {}}
              onCopyContent={() => {}}
              onSaveToFavorites={() => {}}
              onPublishToPlatform={() => {}}
              onVersionSelect={() => {}}
              getPlatformIcon={() => <span>📱</span>}
              getPlatformName={(id) => id}
              getEffectiveCharCount={() => 500}
              t={t}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-gray-600 text-background rounded-lg"
              >
                上一步
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-success text-background rounded-lg"
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
