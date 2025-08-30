---
type: "agent_requested"
description: "Example description"
---

{
  "rules": [
    {
      "module": "UI",
      "name": "ui_html_jsx_tag_closure_error",
      "severity": "error",
      "description": "确保所有 HTML/JSX 标签成对闭合，不多写或少写，避免跨层闭合和多顶层元素。",
      "criteria": [
        "所有标签必须严格匹配开闭合",
        "React JSX 必须只有一个顶层父元素",
        "禁止跨层闭合（如 <div><p></div></p>）"
      ],
      "action": "在输出前检查并修正标签闭合数量，直到所有标签匹配",
      "keywords": ["HTML", "JSX", "闭合标签", "顶层父元素", "跨层闭合", "UI"]
    },
    {
      "module": "UI",
      "name": "ui_auto_tag_count_check_warning",
      "severity": "warning",
      "description": "自动检查 HTML/JSX 中标签开闭数量，确保语义化标签数量匹配。",
      "criteria": [
        "统计 <div> 与 </div> 的数量是否相等",
        "统计 <section>/<main>/<header>/<footer> 等标签的开闭合是否相等",
        "确保其他语义化标签（如 <ul>/<li>、<table>/<tr>/<td> 等）数量匹配"
      ],
      "action": "如果发现数量不匹配，则自动修正结构并重新生成",
      "keywords": ["HTML", "JSX", "标签计数", "语义化标签", "结构优化"]
    },
    {
      "module": "UI",
      "name": "ui_reduce_div_nesting_warning",
      "severity": "warning",
      "description": "减少无意义的 <div> 嵌套，优先使用语义化标签保持结构简洁。",
      "criteria": [
        "尽量用语义化标签替代无意义 <div>",
        "减少层级嵌套，保持结构简洁"
      ],
      "action": "在生成时优化 HTML 结构，减少冗余标签",
      "keywords": ["HTML", "JSX", "语义化标签", "减少嵌套", "结构优化"]
    },
    {
      "module": "UI",
      "name": "ui_output_format_requirement_warning",
      "severity": "warning",
      "description": "输出 HTML/JSX 时必须符合指定格式，包括完整代码块和闭合标签确认。",
      "criteria": [
        "先输出完整可运行的 HTML/JSX 代码块",
        "最后一行必须是 <!-- 标签匹配检查完成，无多余或缺失闭合标签 -->"
      ],
      "action": "输出时严格遵守格式要求",
      "keywords": ["HTML", "JSX", "输出格式", "闭合标签", "UI"]
    }
  ]
}