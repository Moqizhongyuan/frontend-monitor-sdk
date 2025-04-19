/**
 * @file web vitals
 * @author yuzhongyuan
 */

import MetricsStore, { IMetrics } from "../../store";
import { afterLoad } from "../../utils";
import { GetPerformanceApiService } from "./getPerformanceApiService";

export class WebVitals {
  /** performance暂存的Map类 */
  public metrics: MetricsStore<WebVitals.metricsName>;

  /** 获取performance类型实例 */
  getPerformanceApiService = new GetPerformanceApiService();

  constructor() {
    this.metrics = new MetricsStore<WebVitals.metricsName>();
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
    const entry = this.getPerformanceApiService.getFP();
    const metrics = {
      startTime: entry?.startTime.toFixed(2),
      entry,
    } as IMetrics;
    this.metrics.set(WebVitals.metricsName.FP, metrics);
  };

  /** 初始化 FCP 的获取以及返回 */
  initFCP = (): void => {
    const entry = this.getPerformanceApiService.getFCP();
    const metrics = {
      startTime: entry?.startTime.toFixed(2),
      entry,
    } as IMetrics;
    this.metrics.set(WebVitals.metricsName.FCP, metrics);
  };

  /** 初始化 LCP 的获取以及返回 */
  initLCP = (): void => {
    const entryHandler = (entry: PerformanceEntry) => {
      const metrics = {
        startTime: entry?.startTime.toFixed(2),
        entry,
      } as IMetrics;
      this.metrics.set(WebVitals.metricsName.LCP, metrics);
    };
    this.getPerformanceApiService.getLCP(entryHandler);
  };

  /** 初始化 FID 的获取 及返回 */
  initFID = (): void => {
    const entryHandler = (entry: PerformanceEventTiming) => {
      const metrics = {
        delay: entry.processingStart - entry.startTime,
        entry,
      } as IMetrics;
      this.metrics.set(WebVitals.metricsName.FID, metrics);
    };
    this.getPerformanceApiService.getFID(entryHandler);
  };

  /** 初始化 CLS 的获取以及返回 */
  initCLS = (): void => {
    let clsValue = 0;
    let clsEntries = [];

    let sessionValue = 0;
    let sessionEntries: Array<WebVitals.LayoutShift> = [];

    const entryHandler = (entry: WebVitals.LayoutShift) => {
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
          this.metrics.set(WebVitals.metricsName.CLS, metrics);
        }
      }
    };
    this.getPerformanceApiService.getCLS(entryHandler);
  };

  /** 初始化 NT 的获取以及返回 */
  initNavigationTiming = (): void => {
    const navigationTiming =
      this.getPerformanceApiService.getNavigationTiming();
    const metrics = navigationTiming as IMetrics;
    this.metrics.set(WebVitals.metricsName.NT, metrics);
  };

  /** 初始化 RF 的获取以及返回 */
  initResourceFlow = (): void => {
    const resourceFlow: Array<GetPerformanceApiService.ResourceFlowTiming> = [];
    const resObserve =
      this.getPerformanceApiService.getResourceFlow(resourceFlow);

    const stopListening = () => {
      if (resObserve) {
        resObserve.disconnect();
      }
      const metrics = resourceFlow as IMetrics;
      this.metrics.set(WebVitals.metricsName.RF, metrics);
    };
    // 当页面 pageshow 触发时，中止
    window.addEventListener("pageshow", stopListening, {
      once: true,
      capture: true,
    });
  };
}

export namespace WebVitals {
  export enum metricsName {
    FP = "first-paint",
    FCP = "first-contentful-paint",
    LCP = "largest-contentful-paint",
    FID = "first-input-delay",
    CLS = "cumulative-layout-shift",
    NT = "navigation-timing",
    RF = "resource-flow",
  }

  export interface LayoutShift extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
  }
}
