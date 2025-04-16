import { MonitorModule, ResourceData } from "../types";
import Reporter from "../utils/reporter";

/**
 * 资源监控模块
 * 监控页面资源加载情况，包括图片、脚本、CSS等
 */
class ResourceMonitor implements MonitorModule {
  /** 数据上报器 */
  private reporter: Reporter;
  /** 资源观察器 */
  private observer: PerformanceObserver | null = null;

  /**
   * 创建资源监控实例
   * @param reporter 数据上报器
   */
  constructor(reporter: Reporter) {
    this.reporter = reporter;

    // 初始化监控
    this.initObserver();

    // 监听页面加载完成，上报已有资源
    window.addEventListener("load", this.onLoad.bind(this));
  }

  /**
   * 初始化性能观察器
   */
  private initObserver(): void {
    if (!window.PerformanceObserver) {
      console.warn("PerformanceObserver API not supported");
      return;
    }

    try {
      // 创建资源观察器
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.handleEntries(entries);
      });

      // 观察资源加载性能条目
      this.observer.observe({ entryTypes: ["resource"] });
    } catch (e) {
      console.error("Error initializing resource observer:", e);
    }
  }

  /**
   * 页面加载完成时处理
   */
  private onLoad(): void {
    // 检查已经加载的资源
    if (window.performance && window.performance.getEntriesByType) {
      const entries = window.performance.getEntriesByType("resource");
      this.handleEntries(entries);
    }
  }

  /**
   * 处理性能条目
   * @param entries 性能条目
   */
  private handleEntries(entries: PerformanceEntry[]): void {
    entries.forEach((entry) => {
      // 只处理资源类型的条目
      if (entry.entryType !== "resource") return;

      const resourceEntry = entry as PerformanceResourceTiming;
      this.reportResource(resourceEntry);
    });
  }

  /**
   * 上报资源加载情况
   * @param entry 资源性能条目
   */
  private reportResource(entry: PerformanceResourceTiming): void {
    // 提取资源名称
    const urlParts = entry.name.split("/");
    const name = urlParts[urlParts.length - 1] || entry.name;

    // 计算资源大小
    const size = this.calculateResourceSize(entry);

    // 创建资源数据
    const resourceData: ResourceData = {
      type: "resource",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: Date.now(),
      name,
      url: entry.name,
      initiatorType: entry.initiatorType,
      duration: Math.round(entry.duration),
      size,
    };

    // 如果是XHR请求，尝试获取状态码
    if (
      entry.initiatorType === "xmlhttprequest" ||
      entry.initiatorType === "fetch"
    ) {
      // 注意：性能API无法直接获取状态码，这里留空
    }

    this.reporter.report(resourceData);
  }

  /**
   * 计算资源大小
   * @param entry 资源性能条目
   * @returns 资源大小（单位：字节）
   */
  private calculateResourceSize(entry: PerformanceResourceTiming): number {
    // 如果有传输大小，使用传输大小
    if (entry.transferSize) {
      return entry.transferSize;
    }

    // 如果有编码后大小，使用编码后大小
    if (entry.encodedBodySize) {
      return entry.encodedBodySize;
    }

    // 如果都没有，返回0
    return 0;
  }

  /**
   * 销毁实例，清理资源
   */
  public destroy(): void {
    window.removeEventListener("load", this.onLoad.bind(this));

    if (this.observer) {
      try {
        this.observer.disconnect();
      } catch (e) {
        console.error("Error disconnecting resource observer:", e);
      }
    }
  }
}

export default ResourceMonitor;
