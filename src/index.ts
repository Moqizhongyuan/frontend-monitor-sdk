import { MonitorConfig, MonitorInstance } from "./types";
import PerformanceMonitor from "./monitors/performance";
import ErrorMonitor from "./monitors/error";
import ResourceMonitor from "./monitors/resource";
import BehaviorMonitor from "./monitors/behavior";
import Reporter from "./utils/reporter";

/**
 * 前端监控SDK
 * 用于监控网页性能、错误、资源加载和用户行为
 */
class FrontendMonitor implements MonitorInstance {
  private config: MonitorConfig;
  private reporter: Reporter;
  private performanceMonitor: PerformanceMonitor | null = null;
  private errorMonitor: ErrorMonitor | null = null;
  private resourceMonitor: ResourceMonitor | null = null;
  private behaviorMonitor: BehaviorMonitor | null = null;

  /**
   * 创建监控实例
   * @param config 监控配置项
   */
  constructor(config: Partial<MonitorConfig>) {
    this.config = this.mergeDefaultConfig(config);
    this.reporter = new Reporter(this.config.reportUrl);
    this.init();
  }

  /**
   * 合并默认配置
   * @param config 用户配置
   * @returns 合并后的配置
   */
  private mergeDefaultConfig(config: Partial<MonitorConfig>): MonitorConfig {
    return {
      appId: config.appId || "",
      userId: config.userId || "",
      reportUrl: config.reportUrl || "",
      enablePerformance: config.enablePerformance !== false,
      enableError: config.enableError !== false,
      enableResource: config.enableResource !== false,
      enableBehavior: config.enableBehavior !== false,
    };
  }

  /**
   * 初始化监控模块
   */
  private init(): void {
    if (this.config.enablePerformance) {
      this.performanceMonitor = new PerformanceMonitor(this.reporter);
    }

    if (this.config.enableError) {
      this.errorMonitor = new ErrorMonitor(this.reporter);
    }

    if (this.config.enableResource) {
      this.resourceMonitor = new ResourceMonitor(this.reporter);
    }

    if (this.config.enableBehavior) {
      this.behaviorMonitor = new BehaviorMonitor(this.reporter);
    }
  }

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
  ): void {
    this.reporter.report({
      type: "custom",
      category,
      action,
      label,
      value,
      appId: this.config.appId,
      userId: this.config.userId,
      timestamp: Date.now(),
    });
  }

  /**
   * 销毁实例，清理事件监听
   */
  destroy(): void {
    this.performanceMonitor?.destroy();
    this.errorMonitor?.destroy();
    this.resourceMonitor?.destroy();
    this.behaviorMonitor?.destroy();
  }
}

export default FrontendMonitor;
