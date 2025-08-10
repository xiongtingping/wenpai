import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import TitleGenerator from '../components/TitleGeneratorIntelligent';

const TitleFixTestPage: React.FC = () => {
  const [testContent, setTestContent] = useState(`发现3小打工人必备效率工具！真的
成短视频脚本+热方法详解｜实用指南
感受就是终于不用在不同平台间切换了，真心话`);

  const [selectedTitle, setSelectedTitle] = useState('');

  const testCases = [
    {
      name: '问题案例1',
      content: '发现3小打工人必备效率工具！真的很好用，包括AI写作助手、自动化脚本工具等。',
      expectedIssue: '标题可能出现截断'
    },
    {
      name: '问题案例2', 
      content: '成短视频脚本+热方法详解｜实用指南，教你如何快速制作吸引人的短视频内容。',
      expectedIssue: '标题格式可能异常'
    },
    {
      name: '问题案例3',
      content: '感受就是终于不用在不同平台间切换了，真心话分享我的使用体验和心得。',
      expectedIssue: '标题可能语法错误'
    }
  ];

  const handleTestCase = (testCase: any) => {
    setTestContent(testCase.content);
  };

  return (
    <div className="min-h-screen bg-accent py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">标题生成修复测试</h1>
          <p className="text-muted-foreground">测试修复后的标题生成功能，确保不再出现格式问题</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：测试用例 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>测试用例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testCases.map((testCase, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{testCase.name}</h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTestCase(testCase)}
                      >
                        使用此案例
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{testCase.content}</p>
                    <Badge variant="secondary" className="text-xs">
                      {testCase.expectedIssue}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>自定义测试内容</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="输入测试内容..."
                />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：标题生成测试 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>标题生成测试</CardTitle>
              </CardHeader>
              <CardContent>
                <TitleGenerator
                  content={testContent}
                  platformId="xiaohongshu"
                  platformName="小红书"
                  versions={[
                    {
                      id: 'test-a',
                      title: '测试版本A',
                      content: testContent,
                      style: 'standard' as const,
                      charCount: testContent.length
                    }
                  ]}
                  onTitleChange={(title) => {
                    setSelectedTitle(title);
                    console.log('选中标题:', title);
                  }}
                />
              </CardContent>
            </Card>

            {/* 选中的标题显示 */}
            {selectedTitle && (
              <Card>
                <CardHeader>
                  <CardTitle>当前选中标题</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-accent border border-border rounded-lg p-4">
                    <p className="text-lg font-medium text-blue-900">{selectedTitle}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-primary">
                      <span>长度: {selectedTitle.length} 字符</span>
                      <span>状态: {selectedTitle.length <= 20 ? '✅ 符合要求' : '⚠️ 超出限制'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 修复说明 */}
            <Card>
              <CardHeader>
                <CardTitle>修复内容说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <h4 className="font-medium text-green-700">✅ 已修复的问题：</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>标题格式异常（如"感受就是终于不用在不同平｜真心话"）</li>
                    <li>标题截断问题（如"成短视频脚本+热方法详解"）</li>
                    <li>语法错误和不完整表达</li>
                    <li>字符串拼接时的空格缺失</li>
                    <li>标题长度超限时的智能截断</li>
                  </ul>
                </div>
                
                <div className="text-sm space-y-2">
                  <h4 className="font-medium text-primary">🔧 修复措施：</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>增加输入验证，确保提取的关键词长度合理</li>
                    <li>修复标题模板，添加必要的连接词和空格</li>
                    <li>优化智能截断算法，在合适的标点处截断</li>
                    <li>增强语法验证，过滤有问题的标题候选</li>
                    <li>添加详细的调试日志，便于问题追踪</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleFixTestPage;
