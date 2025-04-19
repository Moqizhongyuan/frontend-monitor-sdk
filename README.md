# 前端监控 SDK

一个轻量、模块化的前端监控 SDK，用于收集和上报前端应用的性能指标和用户行为数据。

## 功能特点

- **性能监控**：收集关键性能指标

  - FP (First Paint) - 首次绘制时间
  - FCP (First Contentful Paint) - 首次内容绘制时间
  - LCP (Largest Contentful Paint) - 最大内容绘制时间
  - FID (First Input Delay) - 首次输入延迟
  - CLS (Cumulative Layout Shift) - 累积布局偏移
  - 导航计时 (Navigation Timing)
  - 资源加载性能 (Resource Flow)

- **用户行为监控**：追踪用户页面交互

  - 页面访问信息 (PI - Page Information)
  - 用户来源信息 (OI - Origin Information)
  - 路由变化记录 (RCR - Router Change Record)
  - 点击行为记录 (CBR - Click Behavior Record)
  - 自定义埋点事件 (CDR - Custom Define Record)
  - HTTP 请求监控 (HT - HTTP Record)

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
  // 配置参数
  enablePerformance: true,
  enableBehavior: true,
});

// 手动上报自定义事件
monitor.trackEvent({
  eventCategory: "video",
  eventAction: "play",
  eventLabel: "教程视频",
  eventValue: "120s",
});

// 在应用退出时销毁实例
window.addEventListener("unload", () => {
  monitor.destroy();
});
```

## 配置选项

| 参数               | 类型     | 必填 | 默认值     | 描述                      |
| ------------------ | -------- | ---- | ---------- | ------------------------- |
| appId              | string   | 是   | -          | 应用标识符                |
| userId             | string   | 是   | -          | 用户标识符                |
| reportUrl          | string   | 是   | -          | 数据上报接口地址          |
| enablePerformance  | boolean  | 否   | true       | 是否启用性能监控          |
| enableBehavior     | boolean  | 否   | true       | 是否启用用户行为监控      |
| maxBehaviorRecords | number   | 否   | 100        | 最大行为记录数量          |
| clickMountList     | string[] | 否   | ["button"] | 要监听点击的 DOM 标签列表 |

## 模块详解

### 性能监控 (WebVitals)

收集网页核心性能指标，包括：

```typescript
enum metricsName {
  FP = "first-paint", // 首次绘制
  FCP = "first-contentful-paint", // 首次内容绘制
  LCP = "largest-contentful-paint", // 最大内容绘制
  FID = "first-input-delay", // 首次输入延迟
  CLS = "cumulative-layout-shift", // 累积布局偏移
  NT = "navigation-timing", // 导航计时
  RF = "resource-flow", // 资源加载流
}
```

### 用户行为监控 (UserVitals)

记录用户在页面上的各类交互行为：

```typescript
enum metricsName {
  PI = "page-information", // 页面基本信息
  OI = "origin-information", // 用户来源信息
  RCR = "router-change-record", // 路由变化记录
  CBR = "click-behavior-record", // 点击行为记录
  CDR = "custom-define-record", // 自定义事件记录
  HT = "http-record", // HTTP请求记录
}
```

### 数据存储

SDK 使用内存存储收集的监控数据，支持：

- 数据添加与获取
- 自定义数据处理与转换
- 数据上报触发控制

## 自定义事件上报

```javascript
// 上报自定义事件
monitor.trackEvent({
  eventCategory: "video", // 事件类别 - 互动的对象
  eventAction: "play", // 事件动作 - 互动动作方式
  eventLabel: "教程视频", // 事件标签 - 对事件的分类
  eventValue: "120s", // 事件值 - 与事件相关的数值
});
```

## 上报数据格式

所有上报的数据都包含基础字段，并根据不同的监控类型包含特定字段：

### 基础字段

```typescript
{
  type: 'performance' | 'behavior' | 'custom',
  timestamp: number,
  page: string  // 当前页面路径
}
```

### 性能数据示例

```typescript
{
  type: 'performance',
  name: 'first-contentful-paint',
  startTime: 235.5,  // 毫秒
  entry: {...}       // 原始性能条目
}
```

### 行为数据示例

```typescript
{
  type: 'behavior',
  name: 'click-behavior-record',
  value: {
    tagInfo: {
      id: 'submit-button',
      classList: ['btn', 'primary'],
      tagName: 'BUTTON',
      text: '提交'
    },
    timestamp: 1609459200000
  }
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

## 项目结构

```
frontend-monitor-sdk/
├── dist/                        # 构建输出目录
├── examples/                    # 示例代码
├── src/                         # 源代码
│   ├── monitors/                # 监控模块
│   │   ├── behavior/            # 用户行为监控
│   │   │   ├── index.ts         # 行为监控入口
│   │   │   ├── behaviorStore.ts # 行为数据存储
│   │   │   └── getUserBehaviorApiService.ts # 行为数据收集服务
│   │   ├── performance/         # 性能监控
│   │   │   ├── index.ts         # 性能监控入口
│   │   │   └── getPerformanceApiService.ts  # 性能数据收集服务
│   │   └── index.ts             # 监控模块统一导出
│   ├── utils.ts                 # 工具函数
│   ├── store.ts                 # 数据存储
│   └── index.ts                 # SDK主入口
├── package.json                 # 项目配置
├── rollup.config.js             # 打包配置
└── tsconfig.json                # TypeScript配置
```

## 开发计划

1. **错误监控模块**：添加对 JavaScript 错误、Promise 异常、资源加载错误等的捕获
2. **热插拔设计**：完善模块化设计，允许运行时动态启用/禁用不同监控功能
3. **数据采样控制**：根据配置进行数据采样，减少上报数据量
4. **离线存储**：断网情况下本地存储，网络恢复后重新上报
5. **Web Vitals 整合**：完全支持 Google Web Vitals 标准
6. **更多框架适配**：针对 Vue、React 等框架的专门适配器

## 许可证

MIT
