import { MonitorModule, PerformanceData } from "../types";
import Reporter from "../utils/reporter";

/**
 * 性能监控模块
 * 负责收集页面加载性能数据
 */
class PerformanceMonitor implements MonitorModule {
  /** 数据上报器 */
  private reporter: Reporter;
  /** 是否已上报首屏性能数据 */
  private hasReported: boolean = false;

  /**
   * 创建性能监控实例
   * @param reporter 数据上报器
   */
  constructor(reporter: Reporter) {
    this.reporter = reporter;

    // 监听加载完成事件
    window.addEventListener("load", this.onLoad.bind(this));

    // 性能指标观察器
    this.observePerformanceEntries();
  }

  /**
   * 页面加载完成时收集性能数据
   */
  private onLoad(): void {
    // 延迟一点收集，确保性能指标已就绪
    setTimeout(() => {
      if (!this.hasReported) {
        this.collectPerformanceData();
      }
    }, 1000);
  }

  /**
   * 收集并上报性能数据
   */
  private collectPerformanceData(): void {
    if (!window.performance) {
      console.warn("Performance API not supported");
      return;
    }

    const performanceData: PerformanceData = {
      type: "performance",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: Date.now(),
    };

    // 收集导航计时数据
    const navTiming = this.getNavigationTiming();
    Object.assign(performanceData, navTiming);

    // 收集绘制时间数据
    const paintTiming = this.getPaintTiming();
    Object.assign(performanceData, paintTiming);

    // 上报收集到的性能数据
    this.reporter.report(performanceData);
    this.hasReported = true;
  }

  /**
   * 获取导航计时数据
   */
  private getNavigationTiming(): Partial<PerformanceData> {
    const result: Partial<PerformanceData> = {};

    try {
      const timing = performance.timing || {};
      const navigationStart = timing.navigationStart || 0;

      if (timing.domContentLoadedEventEnd && navigationStart) {
        result.DOMReady = timing.domContentLoadedEventEnd - navigationStart;
      }

      if (timing.loadEventEnd && navigationStart) {
        result.load = timing.loadEventEnd - navigationStart;
      }

      if (timing.responseStart && navigationStart) {
        result.TTFB = timing.responseStart - navigationStart;
      }
    } catch (error) {
      console.error("Error collecting navigation timing:", error);
    }

    return result;
  }

  /**
   * 获取绘制时间数据
   */
  private getPaintTiming(): Partial<PerformanceData> {
    const result: Partial<PerformanceData> = {};

    try {
      // 获取绘制指标
      const paintEntries = performance.getEntriesByType("paint");

      for (const entry of paintEntries) {
        if (entry.name === "first-paint") {
          result.FP = Math.round(entry.startTime);
        } else if (entry.name === "first-contentful-paint") {
          result.FCP = Math.round(entry.startTime);
        }
      }

      // 获取 LCP 等需要使用 PerformanceObserver
    } catch (error) {
      console.error("Error collecting paint timing:", error);
    }

    return result;
  }

  /**
   * 观察性能条目
   */
  private observePerformanceEntries(): void {
    try {
      // 观察更大内容绘制 (LCP)
      if ("PerformanceObserver" in window) {
        // 首次有意义绘制近似为 LCP
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];

          if (lastEntry) {
            const performanceData: PerformanceData = {
              type: "performance",
              appId: "", // 由主类填充
              userId: "", // 由主类填充
              timestamp: Date.now(),
              FMP: Math.round(lastEntry.startTime),
            };

            this.reporter.report(performanceData);
          }
        });

        lcpObserver.observe({
          type: "largest-contentful-paint",
          buffered: true,
        });
      }
    } catch (error) {
      console.error("Error observing performance entries:", error);
    }
  }

  /**
   * 销毁实例，清理事件监听
   */
  public destroy(): void {
    window.removeEventListener("load", this.onLoad.bind(this));
  }
}

export default PerformanceMonitor;
