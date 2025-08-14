---
type: "agent_requested"
description: "Example description"
---
{
  "module": "Documentation",
  "name": "doc_update_readme_timely_warning",
  "severity": "warning",
  "description": "任何新增功能、配置修改或重要流程变更后，必须及时更新 README 文件，保证文档与实际代码保持一致，禁止留存过时或错误信息。",
  "criteria": [
    "新增功能、API 或模块变更后必须同步更新 README",
    "禁止保留过时说明或未使用的示例",
    "文档内容必须准确反映当前项目状态与配置方式",
    "更新 README 时应清晰标注版本或日期，方便追踪变更"
  ],
  "action": "在检测到功能或配置变更后 README 未更新时，阻止任务完成，并提示开发者及时同步文档。"
}