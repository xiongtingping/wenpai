/**
 * 标题生成器平台切换测试页面
 * 用于验证平台切换时的标题生成功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TitleGenerator from '../components/TitleGeneratorIntelligent';

const platforms = [
  { id: "xiaohongshu", name: "小红书", limit: 20 },
  { id: "wechat", name: "公众号", limit: 28 },
  { id: "weibo", name: "微博", limit: 25 },
  { id: "douyin", name: "抖音", limit: 18 },
  { id: "bilibili", name: "B站", limit: 30 },
  { id: "zhihu", name: "知乎", limit: 50 }
];

const testContent = `文派AI内容适配器是一款强大的多平台内容生成工具。它能够根据不同平台的特点和用户习惯，自动调整内容的风格、长度和表达方式。

主要功能包括：
1. 智能内容分析和语义理解
2. 多平台风格自动适配
3. 字符数智能控制
4. 话题标签自动生成
5. 品牌调性一致性保持

使用文派后，内容创作者可以一次创作，多平台发布，大大提升了工作效率。无论是小红书的种草文案、知乎的专业回答，还是微博的热点评论，都能生成高质量的内容。`;

export default function TitlePlatformSwitchTestPage() {
  const [selectedPlatform, setSelectedPlatform] = useState("xiaohongshu");
  const [content, setContent] = useState(testContent);
  const [generatedTitles, setGeneratedTitles] = useState<Record<string, string>>({});
  const [switchCount, setSwitchCount] = useState(0);

  const handlePlatformSwitch = (platformId: string) => {
    console.log(`🔄 平台切换测试: ${selectedPlatform} -> ${platformId}`);
    setSelectedPlatform(platformId);
    setSwitchCount(prev => prev + 1);
  };

  const handleTitleChange = (title: string) => {
    console.log(`📝 标题更新 (${selectedPlatform}):`, title);
    setGeneratedTitles(prev => ({
      ...prev,
      [selectedPlatform]: title
    }));
  };

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 标题生成器平台切换测试
            <Badge variant="outline">切换次数: {switchCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧：测试控制 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">选择平台</label>
                <Select value={selectedPlatform} onValueChange={handlePlatformSwitch}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name} ({platform.limit}字)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">当前平台信息</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>平台:</strong> {currentPlatform?.name}</p>
                  <p><strong>字符限制:</strong> {currentPlatform?.limit}字</p>
                  <p><strong>平台ID:</strong> {selectedPlatform}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">测试内容</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                  placeholder="输入测试内容..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">快速平台切换测试</label>
                <div className="grid grid-cols-3 gap-2">
                  {platforms.map(platform => (
                    <Button
                      key={platform.id}
                      variant={selectedPlatform === platform.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlatformSwitch(platform.id)}
                    >
                      {platform.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：标题生成器 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  标题生成器 - {currentPlatform?.name}
                </label>
                <TitleGenerator
                  content={content}
                  platformId={selectedPlatform}
                  platformName={currentPlatform?.name || selectedPlatform}
                  onTitleChange={handleTitleChange}
                  versions={[
                    {
                      id: 'test-version',
                      title: '测试版本',
                      content: content,
                      style: 'standard' as const,
                      charCount: content.length
                    }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* 底部：生成历史 */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">各平台生成的标题历史</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map(platform => (
                <Card key={platform.id} className={selectedPlatform === platform.id ? 'ring-2 ring-blue-500' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      {platform.name}
                      <Badge variant="outline" className="text-xs">
                        {platform.limit}字
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {generatedTitles[platform.id] ? (
                        <div>
                          <p className="font-medium text-green-600">
                            {generatedTitles[platform.id]}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            长度: {generatedTitles[platform.id].length}/{platform.limit}字
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">暂未生成标题</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 测试说明 */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🧪 测试说明</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 切换平台时，标题生成器应该自动适配新平台的字符限制</li>
              <li>• 已生成的标题应该保持在历史记录中，不会丢失</li>
              <li>• 重新生成时应该考虑当前平台的特点</li>
              <li>• 控制台会输出详细的调试信息</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
