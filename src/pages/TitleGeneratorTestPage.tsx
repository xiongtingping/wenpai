import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import TitleGenerator from '../components/TitleGeneratorIntelligent';
import { testContents, runTitleGenerationTest, testSpecificGrammarFixes } from '../test/titleGeneratorTest';

const TitleGeneratorTestPage: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<{ name: string; content: string; expectedIssues: string[] }>(testContents[0]);
  const [customContent, setCustomContent] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');

  const handleContentSelect = (content: { name: string; content: string; expectedIssues: string[] }) => {
    setSelectedContent(content);
    setCustomContent(content.content);
  };

  const handleTitleChange = (title: string) => {
    console.log('标题已更新:', title);
    setGeneratedTitle(title);
  };

  const runTest = async () => {
    setIsRunningTest(true);
    try {
      const results = await runTitleGenerationTest();
      setTestResults(results);
    } catch (error) {
      console.error('测试失败:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const runGrammarTest = async () => {
    setIsRunningTest(true);
    try {
      const results = await testSpecificGrammarFixes();
      setTestResults(results);
    } catch (error) {
      console.error('语法测试失败:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">智能标题生成器测试</h1>
        <p className="text-gray-600">测试AI驱动的智能标题生成功能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：测试内容选择 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>测试内容选择</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {testContents.map((content, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3"
                    onClick={() => handleContentSelect(content)}
                  >
                    <div className="text-left">
                      <div className="font-medium">测试内容 {index + 1}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {content.substring(0, 50)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">自定义内容</label>
                <Textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="输入您要测试的内容..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={runTest} disabled={isRunningTest}>
                  {isRunningTest ? '运行中...' : '运行完整测试'}
                </Button>
                <Button onClick={runGrammarTest} disabled={isRunningTest} variant="outline">
                  {isRunningTest ? '运行中...' : '语法测试'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 测试结果 */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>测试结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "通过" : "失败"}
                        </Badge>
                        <span className="font-medium">{result.testName}</span>
                      </div>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：标题生成器 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>智能标题生成器</CardTitle>
            </CardHeader>
            <CardContent>
              <TitleGenerator
                content={customContent}
                platformId="xiaohongshu"
                platformName="小红书"
                onTitleChange={handleTitleChange}
                versions={[
                  {
                    id: 'test-version',
                    title: '测试版本',
                    content: customContent,
                    style: 'standard' as const,
                    charCount: customContent.length
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* 生成的标题显示 */}
          {generatedTitle && (
            <Card>
              <CardHeader>
                <CardTitle>生成的标题</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-lg font-medium text-blue-900">{generatedTitle}</p>
                  <p className="text-sm text-blue-600 mt-2">字符数: {generatedTitle.length}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TitleGeneratorTestPage;
