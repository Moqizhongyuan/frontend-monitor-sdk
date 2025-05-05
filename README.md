# yzy-monitor

前端监控 SDK，用于追踪和收集前端应用的性能指标、错误信息和用户行为数据。

## 简介

`yzy-monitor` 是一款开箱即用的前端埋点 SDK，可以直接使用现有的 web 端监控插件，也可以在原有的内核上进行二次开发，自定义插件，如果对打包体积有要求可以开启 `Tree Shaking` ，这样会帮助你删掉无用的代码

## 安装

使用 npm:

```bash
npm install yzy-monitor
```

使用 pnpm:

```bash
pnpm add yzy-monitor
```

## 快速开始

### 基本使用

```javascript
import { Engine as WebEngine, WebVitals, UserVitals, ErrorVitals } from "./web";
// 初始化监控引擎
const monitor = new WebEngine("https://monitor.yzy.com/api/v1/monitor", {
  // 数据上报地址
  maxBehaviorRecords: 100,
  plugins: [WebVitals, UserVitals, ErrorVitals],
});

// SDK会自动开始收集错误、性能和用户行为数据
```

### 自定义事件埋点

```javascript
// 追踪用户播放视频事件
monitor.userInstance.customHandler({
  eventCategory: "Video",
  eventAction: "play",
  eventLabel: "homepage-intro",
  eventValue: "30s",
});
```

## Web 端插件

### 1. 错误监控 (ErrorVitals)

自动捕获并上报各类错误：

- JavaScript 运行时错误
- 资源加载错误
- Promise 未处理的 rejection
- HTTP 请求错误
- 跨域资源错误

错误发生时，SDK 会自动记录：

- 错误类型和消息
- 错误堆栈
- 发生错误时的页面信息
- 错误前的用户行为序列（面包屑）

### 2. 性能监控 (WebVitals)

监控包括但不限于以下性能指标：

| 指标                           | 描述                     |
| ------------------------------ | ------------------------ |
| FP (First Paint)               | 首次绘制时间             |
| FCP (First Contentful Paint)   | 首次内容绘制时间         |
| LCP (Largest Contentful Paint) | 最大内容绘制时间         |
| FID (First Input Delay)        | 首次输入延迟             |
| CLS (Cumulative Layout Shift)  | 累积布局偏移             |
| 导航计时 (Navigation Timing)   | 页面加载各阶段的性能数据 |
| 资源流 (Resource Flow)         | 页面资源加载性能数据     |

### 3. 用户行为监控 (UserVitals)

追踪用户在应用中的行为：

- 页面信息记录
- 用户来源跟踪
- 路由变化记录
- 用户点击行为
- HTTP 请求记录
- 自定义事件记录

## 数据上报

所有监控数据将通过 API 统一上报到您配置的服务端地址，支持批量上报和错误优先策略，确保关键问题能被及时发现。

## 浏览器兼容性

支持所有现代浏览器(Chrome, Firefox, Safari, Edge)，以及 IE11+。对于低版本浏览器，某些高级指标可能会降级或不可用。

## 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

## 许可证

MIT
