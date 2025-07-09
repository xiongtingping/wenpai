import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, MessageSquare, Users, Sparkles } from "lucide-react";

interface BrandProfileViewerProps {
  profile: BrandProfile;
}

/**
 * 品牌调性分析结果展示组件
 * @description 展示 AI 分析生成的品牌调性档案
 */
export default function BrandProfileViewer({ profile }: BrandProfileViewerProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>品牌调性分析</CardTitle>
        <CardDescription>
          基于上传资料的 AI 分析结果
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 基本信息 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">{profile.name}</h3>
          <p className="text-sm text-gray-600">{profile.description}</p>
        </div>

        {/* Slogan 展示 */}
        <div>
          <h4 className="text-sm font-medium mb-2">品牌 Slogan</h4>
          <div className="space-y-1">
            {profile.slogans.map((slogan, index) => (
              <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                {slogan}
              </div>
            ))}
          </div>
        </div>

        {/* 品牌语气 */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            品牌语气
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.tone.split('、').map((tone, index) => (
              <Badge key={index} variant="secondary">
                {tone}
              </Badge>
            ))}
          </div>
        </div>

        {/* 关键词 */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            品牌关键词
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* 禁用词 */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            禁用词
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.forbiddenWords.map((word, index) => (
              <Badge key={index} variant="destructive">
                {word}
              </Badge>
            ))}
          </div>
        </div>

        {/* AI 分析结果 */}
        {profile.aiAnalysis && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI 深度分析
            </h4>

            {/* 品牌个性 */}
            <div>
              <h5 className="text-sm font-medium mb-1">品牌个性</h5>
              <p className="text-sm text-gray-600">
                {profile.aiAnalysis.brandPersonality}
              </p>
            </div>

            {/* 目标受众 */}
            <div>
              <h5 className="text-sm font-medium mb-1 flex items-center gap-2">
                <Users className="h-4 w-4" />
                目标受众
              </h5>
              <p className="text-sm text-gray-600">
                {profile.aiAnalysis.targetAudience}
              </p>
            </div>

            {/* 主题分析 */}
            <div>
              <h5 className="text-sm font-medium mb-1">核心主题</h5>
              <div className="flex flex-wrap gap-2">
                {profile.aiAnalysis.keyThemes.map((theme, index) => (
                  <Badge key={index} variant="secondary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 内容建议 */}
            <div>
              <h5 className="text-sm font-medium mb-1">内容建议</h5>
              <ul className="space-y-1">
                {profile.aiAnalysis.contentSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-xs bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 