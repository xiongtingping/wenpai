import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * 更新日志页面组件
 * 显示文派平台的版本更新历史
 */
export default function ChangelogPage() {
  const changelogData = [
    {
      version: "v1.2.0",
      date: "2024-12-19",
      type: "feature",
      title: "内容编辑与翻译功能",
      changes: [
        "新增内容编辑功能，用户可直接在生成框中修改内容",
        "新增一键翻译功能，支持中英文互译",
        "新增内容收藏功能，可在我的页面查看收藏内容",
        "优化平台设置界面，修复重复显示问题",
        "新增登录状态保持功能"
      ]
    },
    {
      version: "v1.1.0",
      date: "2024-12-18",
      type: "feature",
      title: "支付系统与用户管理",
      changes: [
        "新增支付中心，支持支付宝和微信支付",
        "新增30分钟限时优惠倒计时功能",
        "新增用户注册登录系统",
        "新增我的页面，支持个人信息管理",
        "新增邀请奖励系统"
      ]
    },
    {
      version: "v1.0.0",
      date: "2024-12-17",
      type: "release",
      title: "文派正式发布",
      changes: [
        "支持8大主流平台内容适配",
        "集成OpenAI、Gemini、DeepSeek三大AI模型",
        "智能内容生成与平台优化",
        "响应式设计，支持移动端使用",
        "基础用户使用次数管理"
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-blue-100 text-blue-800";
      case "fix":
        return "bg-green-100 text-green-800";
      case "release":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "feature":
        return "新功能";
      case "fix":
        return "修复";
      case "release":
        return "发布";
      default:
        return "更新";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Link>
            <Link to="/adapt" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回内容适配器
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">更新日志</h1>
          <p className="text-gray-600">了解文派的最新功能和改进</p>
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
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
                <CardDescription className="text-lg font-medium text-gray-900">
                  {item.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {item.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{change}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            更多更新信息请关注我们的官方渠道
          </p>
        </div>
      </div>
    </div>
  );
} 