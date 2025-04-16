/**
 * 监控配置项
 */
export interface MonitorConfig {
  /** 应用ID */
  appId: string;
  /** 用户ID */
  userId: string;
  /** 上报地址 */
  reportUrl: string;
  /** 是否启用性能监控 */
  enablePerformance: boolean;
  /** 是否启用错误监控 */
  enableError: boolean;
  /** 是否启用资源监控 */
  enableResource: boolean;
  /** 是否启用行为监控 */
  enableBehavior: boolean;
}

/**
 * 监控实例接口
 */
export interface MonitorInstance {
  /**
   * 手动上报自定义事件
   * @param category 事件类别
   * @param action 事件行为
   * @param label 事件标签
   * @param value 事件值
   */
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number
  ): void;

  /**
   * 销毁实例，清理事件监听
   */
  destroy(): void;
}

/**
 * 基础上报数据结构
 */
export interface BaseReportData {
  /** 上报类型 */
  type: "performance" | "error" | "resource" | "behavior" | "custom";
  /** 应用ID */
  appId: string;
  /** 用户ID */
  userId: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 性能数据
 */
export interface PerformanceData extends BaseReportData {
  type: "performance";
  /** 首次绘制时间 */
  FP?: number;
  /** 首次内容绘制时间 */
  FCP?: number;
  /** 首次有意义绘制时间 */
  FMP?: number;
  /** DOM 解析完成时间 */
  DOMReady?: number;
  /** 页面完全加载时间 */
  load?: number;
  /** 首字节时间 */
  TTFB?: number;
  /** 首次可交互时间 */
  TTI?: number;
}

/**
 * 错误数据
 */
export interface ErrorData extends BaseReportData {
  type: "error";
  /** 错误名称 */
  name: string;
  /** 错误信息 */
  message: string;
  /** 错误堆栈 */
  stack?: string;
  /** 错误发生的URL */
  url: string;
  /** 错误类型 */
  errorType: "js" | "promise" | "resource" | "ajax" | "vue" | "react" | "other";
}

/**
 * 资源数据
 */
export interface ResourceData extends BaseReportData {
  type: "resource";
  /** 资源名称 */
  name: string;
  /** 资源URL */
  url: string;
  /** 资源类型 */
  initiatorType: string;
  /** 资源加载时间 */
  duration: number;
  /** 资源大小 */
  size?: number;
  /** 资源状态 */
  status?: number;
}

/**
 * 行为数据
 */
export interface BehaviorData extends BaseReportData {
  type: "behavior";
  /** 行为类型 */
  actionType: "click" | "input" | "navigation" | "pageview" | "custom";
  /** 页面路径 */
  path: string;
  /** 元素信息 */
  element?: string;
  /** 发生时间 */
  time: number;
}

/**
 * 自定义事件数据
 */
export interface CustomEventData extends BaseReportData {
  type: "custom";
  /** 事件类别 */
  category: string;
  /** 事件行为 */
  action: string;
  /** 事件标签 */
  label?: string;
  /** 事件值 */
  value?: number;
}

/**
 * 所有上报数据类型联合
 */
export type ReportData =
  | PerformanceData
  | ErrorData
  | ResourceData
  | BehaviorData
  | CustomEventData;

/**
 * 监控模块基础接口
 */
export interface MonitorModule {
  /**
   * 销毁模块，清理事件监听
   */
  destroy(): void;
}
