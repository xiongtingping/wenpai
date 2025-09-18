import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

/**
 * 更新日志页面组件
 * 显示文派平台的版本更新历史
 */
export default function ChangelogPage() {
  const { t } = useTranslation();
  
  const changelogData = [
    {
      version: "v1.2.0",
      date: "2024-12-19",
      type: "feature",
      title: t('pages.labels.内容编辑与翻译功能'),
      changes: [
        "新增内容编辑功能，用户可直接在生成框中修改内容",
        "新增一键翻译功能，支持中英文互译",
        "新增内容收藏功能，可在我的页面查看收藏内容",
        "优化平台设置界面，修复重复显示问题",
        t('pages.messages.新增登录状态保持功能')
      ]
     },
    {
      version: "v1.1.0",
      date: "2024-12-18",
      type: "feature",
      title: t('pages.labels.支付系统与用户管理'),
      changes: [
        "新增支付中心，支持支付宝和微信支付",
        "新增30分钟限时优惠倒计时功能",
        t('pages.messages.新增用户注册登录系统'),
        "新增我的页面，支持个人信息管理",
        t('pages.messages.新增邀请奖励系统')
      ]
    },
    {
      version: "v1.0.0",
      date: "2024-12-17",
      type: "release",
      title: t('pages.labels.文派正式发布'),
      changes: [
        "支持8大主流平台内容适配",
        "集成OpenAI、Gemini、DeepSeek三大AI模型",
        t('pages.messages.智能内容生成与平台优化'),
        "响应式设计，支持移动端使用",
        t('pages.messages.基础用户使用次数管理')
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-secondary text-secondary-foreground";
      case "fix":
        return "bg-accent text-accent-foreground";
      case "release":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "feature":
        return t('pages.messages.新功能');
      case "fix":
        return t('pages.messages.修复');
      case "release":
        return t('pages.messages.发布');
      default:
        return t('pages.messages.更新');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary particle-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">更新日志</h1>
          <p className="text-muted-foreground">了解文派的最新功能和改进</p>
        </div>

        {/* Changelog List */}
        <div className="space-y-6">
          {changelogData.map((item, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-xl">{item.version}</CardTitle>
                    <Badge className={getTypeColor(item.type)}>
                      {getTypeText(item.type)}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
                <CardDescription className="text-lg font-medium text-foreground">
                  {item.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {item.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start">
                      <span className="text-primary mr-2 mt-1">•</span>
                      <span className="text-muted-foreground">{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            更多更新信息请关注我们的官方渠道
          </p>
        </div>
      </div>
    </div>
  );
}
