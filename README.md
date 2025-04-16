# 前端监控 SDK

这是一个功能全面的前端监控 SDK，用于收集和上报前端应用的性能指标、错误信息、资源加载情况和用户行为。

## 功能特点

- **性能监控**: 收集首屏渲染时间、DOM 加载时间、资源加载时间等关键性能指标
- **错误监控**: 捕获 JavaScript 运行时错误、Promise 异常、资源加载错误等
- **资源监控**: 跟踪页面资源（JS、CSS、图片等）的加载情况和性能
- **用户行为监控**: 记录用户点击、输入、页面浏览等行为数据

## 安装

```bash
npm install frontend-monitor-sdk
# 或
yarn add frontend-monitor-sdk
# 或
pnpm add frontend-monitor-sdk
```

## 快速开始

```javascript
import FrontendMonitor from "frontend-monitor-sdk";

// 创建监控实例
const monitor = new FrontendMonitor({
  appId: "your-app-id",
  userId: "user-123",
  reportUrl: "https://your-api.com/report",
  // 可选配置
  enablePerformance: true,
  enableError: true,
  enableResource: true,
  enableBehavior: true,
});

// 手动上报自定义事件
monitor.trackEvent("category", "action", "label", 100);

// 在应用退出时销毁实例
window.addEventListener("unload", () => {
  monitor.destroy();
});
```

## 配置选项

| 参数              | 类型    | 必填 | 默认值 | 描述                 |
| ----------------- | ------- | ---- | ------ | -------------------- |
| appId             | string  | 是   | -      | 应用标识符           |
| userId            | string  | 是   | -      | 用户标识符           |
| reportUrl         | string  | 是   | -      | 数据上报接口地址     |
| enablePerformance | boolean | 否   | true   | 是否启用性能监控     |
| enableError       | boolean | 否   | true   | 是否启用错误监控     |
| enableResource    | boolean | 否   | true   | 是否启用资源监控     |
| enableBehavior    | boolean | 否   | true   | 是否启用用户行为监控 |

## 上报数据格式

所有上报的数据都包含以下基础字段：

```typescript
{
  type: 'performance' | 'error' | 'resource' | 'behavior' | 'custom',
  appId: string,
  userId: string,
  timestamp: number
}
```

### 性能数据

```typescript
{
  type: 'performance',
  FP?: number,      // 首次绘制时间
  FCP?: number,     // 首次内容绘制时间
  FMP?: number,     // 首次有意义绘制时间
  DOMReady?: number, // DOM解析完成时间
  load?: number,     // 页面完全加载时间
  TTFB?: number,     // 首字节时间
  TTI?: number       // 首次可交互时间
}
```

### 错误数据

```typescript
{
  type: 'error',
  name: string,     // 错误名称
  message: string,  // 错误消息
  stack?: string,   // 错误堆栈
  url: string,      // 错误发生的URL
  errorType: 'js' | 'promise' | 'resource' | 'ajax' | 'vue' | 'react' | 'other'
}
```

### 资源数据

```typescript
{
  type: 'resource',
  name: string,       // 资源名称
  url: string,        // 资源URL
  initiatorType: string, // 资源类型
  duration: number,   // 资源加载时间
  size?: number,      // 资源大小
  status?: number     // 资源状态
}
```

### 行为数据

```typescript
{
  type: 'behavior',
  actionType: 'click' | 'input' | 'navigation' | 'pageview' | 'custom',
  path: string,      // 页面路径
  element?: string,  // 元素信息
  time: number       // 发生时间
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

## 许可证

MIT

## 项目结构

```
frontend-monitor-sdk/
├── dist/                  # 构建输出目录
├── examples/              # 示例代码
│   └── index.html         # 使用示例
├── src/                   # 源代码
│   ├── __tests__/         # 测试文件
│   ├── monitors/          # 监控模块
│   │   ├── behavior.ts    # 行为监控
│   │   ├── error.ts       # 错误监控
│   │   ├── performance.ts # 性能监控
│   │   └── resource.ts    # 资源监控
│   ├── utils/             # 工具类
│   │   └── reporter.ts    # 数据上报工具
│   ├── index.ts           # 入口文件
│   └── types.ts           # 类型定义
├── .cursorrules           # 编辑器配置
├── jest.config.js         # Jest测试配置
├── package.json           # 项目配置
├── pnpm-lock.yaml         # 依赖锁定文件
├── README.md              # 项目说明
├── rollup.config.js       # Rollup打包配置
└── tsconfig.json          # TypeScript配置
```

## 扩展建议

以下是可能的扩展方向：

1. **框架集成**: 添加对 Vue、React 等主流框架的错误处理支持
2. **网络监控**: 扩展对 XMLHttpRequest 和 Fetch 请求的监控
3. **SPA 路由**: 增强对单页应用路由变化的支持
4. **采样率控制**: 添加数据采样策略，减少上报数据量
5. **本地缓存**: 提供离线存储和重试机制
6. **数据压缩**: 在上报前压缩数据
7. **用户会话跟踪**: 增加会话管理功能
8. **Web Vitals**: 更全面地收集 Web Core Vitals 指标
9. **用户画像**: 收集用户环境信息（浏览器、操作系统等）
10. **插件系统**: 实现插件化架构，便于扩展
