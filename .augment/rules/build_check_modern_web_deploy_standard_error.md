---
type: "agent_requested"
description: "build_check_modern_web_deploy_standard_error"
---
{
  "module": "Build",
  "name": "build_check_modern_web_deploy_standard_error",
  "severity": "error",
  "description": "检查当前项目是否符合现代 Web 项目的部署标准要求，全面排查可能导致构建失败、部署路径错误、环境变量缺失、浏览器访问失败、SSR 或静态部署不兼容的隐患。",
  "criteria": [
    "构建产物路径：构建命令是否正确（如 npm run build），输出目录是否标准（.next, dist, build），是否有 HTML、CSS、JS 等文件遗漏",
    "路径与资源访问：是否存在硬编码绝对路径（如 /static/img/logo.png），静态资源是否正确导入，路径写法是否适配部署平台",
    "环境变量：.env 变量是否有 fallback/默认值，构建/部署时所需变量是否已设置，process.env 调用是否正确编译注入",
    "接口请求兼容性：是否存在写死的 localhost 请求，是否使用部署不安全方式获取地址，跨域支持是否完整",
    "SSR/静态部署兼容性：是否使用了仅浏览器可用对象导致 SSR 报错，动态导入是否正常，是否区分 SSR 与客户端渲染逻辑",
    "构建配置（Vite/Next.js）：是否正确配置 base 或 assetPrefix，构建目录是否适配部署平台",
    "动态路由与路由守卫：是否正确使用路由库，受保护页面是否正常跳转，404 fallback 是否生效"
  ],
  "action": "输出部署问题清单（按模块列出）、修复建议（代码或配置）并标注高危项（🔥）。禁止修改 UI 样式或重写业务组件，所有建议必须兼容构建与部署平台（如 Vercel、Netlify、静态服务器）。"
}