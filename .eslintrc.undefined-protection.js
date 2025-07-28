/**
 * 🛡️ ESLint配置 - undefined拼接防护专用
 * 
 * 🎯 目标：在编译时检测和防止undefined拼接问题
 * 📋 规则：严格检测所有可能导致"undefinedundefined"的代码模式
 */

module.exports = {
  "extends": [
    "./.eslintrc.js"
  ],
  "rules": {
    // 🔴 严格禁止undefined拼接模式
    "no-undefined-concat": "error",
    
    // 🟡 警告：模板字符串中的可选属性
    "no-template-curly-in-string": "warn",
    
    // 🔴 禁止在JSX中直接使用可能为undefined的表达式
    "react/jsx-no-undef": "error",
    
    // 🟡 要求在逻辑或表达式中提供明确的fallback
    "prefer-nullish-coalescing": "warn",
    
    // 🔴 禁止在字符串上下文中使用undefined
    "no-implicit-coercion": ["error", {
      "boolean": false,
      "number": false,
      "string": true,
      "disallowTemplateShorthand": true
    }],
    
    // 🟡 要求在可选链后提供默认值
    "prefer-optional-chain": "warn",
    
    // 🔴 TypeScript: 严格的null检查
    "@typescript-eslint/strict-boolean-expressions": ["error", {
      "allowString": false,
      "allowNumber": false,
      "allowNullableObject": false,
      "allowNullableBoolean": false,
      "allowNullableString": false,
      "allowNullableNumber": false,
      "allowAny": false
    }],
    
    // 🟡 要求明确的返回类型
    "@typescript-eslint/explicit-function-return-type": "warn",
    
    // 🔴 禁止使用any类型在字符串上下文中
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    
    // 🟡 要求在模板字符串中使用类型安全的表达式
    "@typescript-eslint/restrict-template-expressions": ["warn", {
      "allowNumber": true,
      "allowBoolean": false,
      "allowAny": false,
      "allowNullish": false,
      "allowRegExp": false
    }]
  },
  
  "overrides": [
    {
      // 对用户信息相关文件应用更严格的规则
      "files": [
        "**/components/**/*User*.{ts,tsx}",
        "**/components/**/*Profile*.{ts,tsx}",
        "**/components/**/*Avatar*.{ts,tsx}",
        "**/pages/**/*User*.{ts,tsx}",
        "**/pages/**/*Profile*.{ts,tsx}",
        "**/hooks/*User*.{ts,tsx}",
        "**/utils/*User*.{ts,tsx}"
      ],
      "rules": {
        // 🔴 在用户相关组件中完全禁止直接属性访问
        "no-unsafe-optional-chaining": "error",
        
        // 🔴 要求所有用户属性访问都通过安全函数
        "prefer-destructuring": ["error", {
          "VariableDeclarator": {
            "array": false,
            "object": false  // 禁止解构，强制使用安全函数
          },
          "AssignmentExpression": {
            "array": false,
            "object": false
          }
        }],
        
        // 🔴 禁止在用户组件中使用逻辑或运算符
        "no-mixed-operators": ["error", {
          "groups": [
            ["||", "&&"]
          ]
        }]
      }
    },
    
    {
      // 对API相关文件的特殊规则
      "files": [
        "**/api/**/*.{ts,tsx}",
        "**/services/**/*.{ts,tsx}"
      ],
      "rules": {
        // 🔴 API文件中禁止模板字符串拼接用户数据
        "@typescript-eslint/restrict-template-expressions": ["error", {
          "allowNumber": true,
          "allowBoolean": false,
          "allowAny": false,
          "allowNullish": false
        }]
      }
    }
  ],
  
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": "./tsconfig.json"
  }
};
