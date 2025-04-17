import MetricsStore, { IMetrics } from "../../store";
import {
  getPerformanceApiService,
  ResourceFlowTiming,
} from "./getPerformanceApiService";

enum metricsName {
  FP = "first-paint",
  FCP = "first-contentful-paint",
  LCP = "largest-contentful-paint",
  FID = "first-input-delay",
  CLS = "cumulative-layout-shift",
  NT = "navigation-timing",
  RF = "resource-flow",
}

const afterLoad = (callback: any) => {
  if (document.readyState === "complete") {
    setTimeout(callback);
  } else {
    window.addEventListener("pageshow", callback, {
      once: true,
      capture: true,
    });
  }
};

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export class WebVitals {
  /** 本地暂存数据在 Map 里 （也可以自己用对象来存储） */
  public metrics: MetricsStore<metricsName>;

  constructor() {
    this.metrics = new MetricsStore<metricsName>();
    this.initLCP();
    this.initCLS();
    this.initResourceFlow();

    afterLoad(() => {
      this.initNavigationTiming();
      this.initFP();
      this.initFCP();
      this.initFID();
      this.perfSendHandler();
    });
  }

  /** 性能数据的上报策略 */
  perfSendHandler = (): void => {
    // 如果你要监听 FID 数据。你就需要等待 FID 参数捕获完成后进行上报;
    // 如果不需要监听 FID，那么这里你就可以发起上报请求了;
  };

  /** 初始化 FP 的获取以及返回 */
  initFP = (): void => {
    const entry = getPerformanceApiService.getFP();
    const metrics = {
      startTime: entry?.startTime.toFixed(2),
      entry,
    } as IMetrics;
    this.metrics.set(metricsName.FP, metrics);
  };

  /** 初始化 FCP 的获取以及返回 */
  initFCP = (): void => {
    const entry = getPerformanceApiService.getFCP();
    const metrics = {
      startTime: entry?.startTime.toFixed(2),
      entry,
    } as IMetrics;
    this.metrics.set(metricsName.FCP, metrics);
  };

  /** 初始化 LCP 的获取以及返回 */
  initLCP = (): void => {
    const entryHandler = (entry: PerformanceEntry) => {
      const metrics = {
        startTime: entry?.startTime.toFixed(2),
        entry,
      } as IMetrics;
      this.metrics.set(metricsName.LCP, metrics);
    };
    getPerformanceApiService.getLCP(entryHandler);
  };

  /** 初始化 FID 的获取 及返回 */
  initFID = (): void => {
    const entryHandler = (entry: PerformanceEventTiming) => {
      const metrics = {
        delay: entry.processingStart - entry.startTime,
        entry,
      } as IMetrics;
      this.metrics.set(metricsName.FID, metrics);
    };
    getPerformanceApiService.getFID(entryHandler);
  };

  /** 初始化 CLS 的获取以及返回 */
  initCLS = (): void => {
    let clsValue = 0;
    let clsEntries = [];

    let sessionValue = 0;
    let sessionEntries: Array<LayoutShift> = [];

    const entryHandler = (entry: LayoutShift) => {
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0];
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

        if (
          sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000
        ) {
          sessionValue += entry.value;
          sessionEntries.push(entry);
        } else {
          sessionValue = entry.value;
          sessionEntries = [entry];
        }

        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          clsEntries = sessionEntries;

          const metrics: IMetrics = {
            entry,
            clsValue,
            clsEntries,
          };
          this.metrics.set(metricsName.CLS, metrics);
        }
      }
    };
    getPerformanceApiService.getCLS(entryHandler);
  };

  /** 初始化 NT 的获取以及返回 */
  initNavigationTiming = (): void => {
    const navigationTiming = getPerformanceApiService.getNavigationTiming();
    const metrics = navigationTiming as IMetrics;
    this.metrics.set(metricsName.NT, metrics);
  };

  /** 初始化 RF 的获取以及返回 */
  initResourceFlow = (): void => {
    const resourceFlow: Array<ResourceFlowTiming> = [];
    const resObserve = getPerformanceApiService.getResourceFlow(resourceFlow);

    const stopListening = () => {
      if (resObserve) {
        resObserve.disconnect();
      }
      const metrics = resourceFlow as IMetrics;
      this.metrics.set(metricsName.RF, metrics);
    };
    // 当页面 pageshow 触发时，中止
    window.addEventListener("pageshow", stopListening, {
      once: true,
      capture: true,
    });
  };
}
