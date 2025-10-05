---
type: "always_apply"
---

// ✅ Compiles with no TypeScript errors
# 🚦AI Coding 规则（简洁版 / TypeScript项目通用）

## 🎯 目标
让AI写的代码能：
- ✅ 类型安全  
- ✅ 可编译运行  
- ✅ 清晰可维护  
- ❌ 不要瞎猜、不用any、不留坑

---

## 🧩 基本规则

1. **必须有类型**  
   - 所有变量、参数、返回值都要声明类型。  
   - 禁止使用 `any`、`as any`、`@ts-ignore`。  

2. **结构清晰**  
   - 每个文件只做一件事。  
   - 类型放 `/types`，工具函数放 `/utils`。  

3. **React / 前端组件**  
   ```ts
   interface Props { title: string }
   const Title: React.FC<Props> = ({ title }) => <h1>{title}</h1>

“请严格按以上 TypeScript 规则生成，禁止 any，不要跳过类型检查。”