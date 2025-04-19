# Frontend-Monitor-SDK

前端监控 SDK，用于追踪和收集前端应用的性能指标、错误信息和用户行为数据。

## 简介

Frontend-Monitor-SDK 是一个全面的前端监控解决方案，帮助开发者实时监控网站性能、捕获错误和分析用户行为。该 SDK 通过无侵入式集成，为开发团队提供丰富的监控数据，从而优化用户体验和提高应用质量。

## 功能特点

### 错误监控

- **JavaScript 错误捕获**：捕获运行时和语法错误
- **资源加载错误监控**：监控脚本、样式、图片等资源的加载失败
- **Promise 异常捕获**：捕获未处理的 Promise 异常
- **HTTP 请求错误监控**：监控接口请求异常
- **跨域错误追踪**：记录跨域脚本异常

### 性能监控

- **核心 Web 指标**：监控 LCP、FID、CLS 等 Google 核心 Web 指标
- **性能计时**：收集首次绘制(FP)、首次内容绘制(FCP)等关键时间点
- **资源加载性能**：追踪页面所有资源加载性能
- **导航计时**：详细记录页面加载各阶段的耗时

### 用户行为追踪

- **页面访问追踪**：记录 PV、来源信息、访问路径
- **交互行为监控**：记录用户点击行为
- **路由变化记录**：监控单页应用的路由变化
- **面包屑行为记录**：记录用户行为序列，帮助错误复现
- **自定义事件分析**：支持开发者自定义埋点记录关键业务指标

## 安装

使用 npm:

```bash
npm install frontend-monitor-sdk
```

使用 pnpm:

```bash
pnpm add frontend-monitor-sdk
```

## 快速开始

### 基本使用

```javascript
import { WebEngine } from "frontend-monitor-sdk";

// 初始化监控引擎
const monitor = new WebEngine({
  transportUrl: "https://your-api-endpoint.com/collect", // 数据上报地址
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

## 核心模块

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
