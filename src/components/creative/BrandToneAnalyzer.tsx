import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  MessageSquare, 
  Hash, 
  Key, 
  Shield, 
  TrendingUp,
  Star,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import BrandProfileService from '@/services/brandProfileService';
import { BrandToneAnalysis } from '@/types/brand';

/**
 * 品牌调性分析组件
 * @description 展示品牌调性的各个维度分析结果
 */
export default function BrandToneAnalyzer() {
  const [analysis, setAnalysis] = useState<BrandToneAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const brandService = BrandProfileService.getInstance();

  useEffect(() => {
    loadBrandAnalysis();
  }, []);

  /**
   * 加载品牌分析数据
   */
  const loadBrandAnalysis = async () => {
    setIsLoading(true);
    try {
      const hasProfile = await brandService.hasBrandProfile();
      if (!hasProfile) {
        toast({
          title: "未找到品牌档案",
          description: "请先上传品牌资料进行分析",
          variant: "destructive"
        });
        return;
      }

      // 这里应该调用实际的 AI 分析服务
      // 暂时使用模拟数据
      const mockAnalysis: BrandToneAnalysis = {
        coreValues: {
          values: ['创新', '可靠', '环保'],
          descriptions: ['持续创新技术', '产品可靠稳定', '环保可持续发展'],
          strength: 8
        },
        tone: {
          primary: '专业友好',
          variations: {
            formal: '专业正式',
            casual: '亲切轻松',
            professional: '技术专业',
            friendly: '温暖友好'
          },
          emotionalTendency: '积极温暖',
          languageStyle: '简洁直接',
          consistency: 7
        },
        topics: {
          coreTopics: ['技术创新', '产品体验', '行业趋势'],
          contentDirections: ['教育', '资讯', '分享'],
          industryFocus: ['科技', '用户体验', '可持续发展'],
          relevance: 9
        },
        hashtags: {
          brandHashtags: ['#品牌名', '#产品系列'],
          campaignHashtags: ['#活动名', '#主题标签'],
          trendingHashtags: ['#热门话题', '#行业标签'],
          effectiveness: 6
        },
        keywords: {
          primary: ['创新', '可靠', '环保', '技术', '体验'],
          categories: {
            product: ['产品名', '功能特性'],
            service: ['服务内容', '解决方案'],
            feature: ['核心功能', '技术优势'],
            benefit: ['用户价值', '使用体验']
          },
          frequency: {
            '创新': 15,
            '可靠': 12,
            '环保': 8
          },
          impact: 8
        },
        riskControl: {
          forbiddenWords: ['禁用词1', '禁用词2'],
          sensitiveTopics: ['敏感话题1', '敏感话题2'],
          tabooExpressions: ['禁忌表达1', '禁忌表达2'],
          riskLevel: 3
        },
        overallScore: {
          valueAlignment: 8,
          toneConsistency: 7,
          topicRelevance: 9,
          brandRecognition: 8,
          riskControl: 9
        }
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('加载品牌分析失败:', error);
      toast({
        title: "加载失败",
        description: "品牌分析数据加载失败",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 获取评分颜色
   */
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * 获取评分图标
   */
  const getScoreIcon = (score: number) => {
    if (score >= 8) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 6) return <Info className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>品牌调性分析</CardTitle>
          <CardDescription>正在分析品牌调性维度...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>品牌调性分析</CardTitle>
          <CardDescription>暂无品牌分析数据</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadBrandAnalysis}>重新加载</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 整体评分概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            品牌调性整体评分
          </CardTitle>
          <CardDescription>基于7个维度的综合评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(analysis.overallScore).map(([key, score]) => (
              <div key={key} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {getScoreIcon(score)}
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 详细维度分析 */}
      <Tabs defaultValue="values" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="values" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            价值观
          </TabsTrigger>
          <TabsTrigger value="tone" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            语调
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            话题
          </TabsTrigger>
          <TabsTrigger value="hashtags" className="flex items-center gap-1">
            <Hash className="h-4 w-4" />
            标签
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-1">
            <Key className="h-4 w-4" />
            关键词
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            风险
          </TabsTrigger>
        </TabsList>

        {/* 品牌核心价值 */}
        <TabsContent value="values" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                品牌核心价值
              </CardTitle>
              <CardDescription>品牌的核心价值观和理念</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">价值观强度：</span>
                <Progress value={analysis.coreValues.strength * 10} className="flex-1" />
                <span className="text-sm font-bold">{analysis.coreValues.strength}/10</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">核心价值观：</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.coreValues.values.map((value, index) => (
                    <Badge key={value} variant="default">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">价值观描述：</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {analysis.coreValues.descriptions.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 品牌语调 */}
        <TabsContent value="tone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                品牌语调分析
              </CardTitle>
              <CardDescription>品牌的语言风格和语调变化</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">语调一致性：</span>
                <Progress value={analysis.tone.consistency * 10} className="flex-1" />
                <span className="text-sm font-bold">{analysis.tone.consistency}/10</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">主要语调：</h4>
                  <Badge variant="outline" className="text-lg">
                    {analysis.tone.primary}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">情感倾向：</h4>
                  <Badge variant="outline">
                    {analysis.tone.emotionalTendency}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">语调变化：</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(analysis.tone.variations).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize">{key}：</span>
                      <Badge variant="secondary">{value}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">语言风格：</h4>
                <Badge variant="outline">{analysis.tone.languageStyle}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 核心话题 */}
        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                核心话题分析
              </CardTitle>
              <CardDescription>品牌关注的核心话题和内容方向</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">话题相关性：</span>
                <Progress value={analysis.topics.relevance * 10} className="flex-1" />
                <span className="text-sm font-bold">{analysis.topics.relevance}/10</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">核心话题：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.coreTopics.map((topic) => (
                      <Badge key={topic} variant="default">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">内容方向：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.contentDirections.map((direction) => (
                      <Badge key={direction} variant="outline">
                        {direction}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">行业关注：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.industryFocus.map((focus) => (
                      <Badge key={focus} variant="secondary">
                        {focus}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 品牌标签 */}
        <TabsContent value="hashtags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                品牌标签策略
              </CardTitle>
              <CardDescription>品牌的标签使用策略和效果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">标签效果：</span>
                <Progress value={analysis.hashtags.effectiveness * 10} className="flex-1" />
                <span className="text-sm font-bold">{analysis.hashtags.effectiveness}/10</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">品牌标签：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.hashtags.brandHashtags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">活动标签：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.hashtags.campaignHashtags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">热门标签偏好：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.hashtags.trendingHashtags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 关键词分析 */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                关键词分析
              </CardTitle>
              <CardDescription>品牌关键词的使用情况和影响力</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">关键词影响力：</span>
                <Progress value={analysis.keywords.impact * 10} className="flex-1" />
                <span className="text-sm font-bold">{analysis.keywords.impact}/10</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">主要关键词：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.primary.map((keyword) => (
                      <Badge key={keyword} variant="default">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">关键词分类：</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.keywords.categories).map(([category, keywords]) => (
                      <div key={category} className="space-y-1">
                        <span className="text-sm font-medium capitalize">{category}：</span>
                        <div className="flex flex-wrap gap-1">
                          {keywords.map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">关键词频率：</h4>
                  <div className="space-y-1">
                    {Object.entries(analysis.keywords.frequency)
                      .sort(([,a], [,b]) => b - a)
                      .map(([keyword, frequency]) => (
                        <div key={keyword} className="flex justify-between items-center">
                          <span className="text-sm">{keyword}</span>
                          <span className="text-sm font-medium">{frequency}次</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 风险控制 */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                风险控制分析
              </CardTitle>
              <CardDescription>品牌的风险控制措施和敏感内容管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">风险等级：</span>
                <Progress value={(10 - analysis.riskControl.riskLevel) * 10} className="flex-1" />
                <span className="text-sm font-bold">{analysis.riskControl.riskLevel}/10</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">禁用词：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.riskControl.forbiddenWords.map((word) => (
                      <Badge key={word} variant="destructive">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">敏感话题：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.riskControl.sensitiveTopics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-orange-600">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">禁忌表达：</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.riskControl.tabooExpressions.map((expression) => (
                      <Badge key={expression} variant="secondary" className="text-red-600">
                        {expression}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 