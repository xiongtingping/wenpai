---
type: "agent_requested"
description: "Example description"
---
{
  "rules": [
    {
      "description": "确保所有 HTML/JSX 标签成对闭合，不多写或少写",
      "criteria": [
        "所有标签必须严格匹配开闭合",
        "React JSX 必须只有一个顶层父元素",
        "禁止跨层闭合（如 <div><p></div></p>）"
      ],
      "action": "在输出前检查并修正标签闭合数量，直到所有标签匹配"
    },
    {
      "description": "自动标签计数检查",
      "criteria": [
        "统计 <div> 与 </div> 的数量是否相等",
        "统计 <section>/<main>/<header>/<footer> 等标签的开闭合是否相等",
        "确保其他语义化标签（如 <ul>/<li>、<table>/<tr>/<td> 等）数量匹配"
      ],
      "action": "如果发现数量不匹配，则自动修正结构并重新生成"
    },
    {
      "description": "减少无意义的 <div> 嵌套",
      "criteria": [
        "尽量用语义化标签替代无意义 <div>",
        "减少层级嵌套，保持结构简洁"
      ],
      "action": "在生成时优化 HTML 结构，减少冗余标签"
    },
    {
      "description": "输出格式要求",
      "criteria": [
        "先输出完整可运行的 HTML/JSX 代码块",
        "最后一行必须是 <!-- 标签匹配检查完成，无多余或缺失闭合标签 -->"
      ],
      "action": "输出时严格遵守格式要求"
    }
  ]
}