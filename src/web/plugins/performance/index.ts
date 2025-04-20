/**
 * @file web vitals
 * @author yuzhongyuan
 */

import { Transport } from "../../../core";
import { Engine } from "../../core/engine";
import { MetricsStore, IMetrics } from "../../../store";
import { afterLoad } from "../../utils";
import { GetPerformanceApiService } from "./getPerformanceApiService";

export class WebVitals {
  /** 插件名称 */
  name: string = "web vitals";
  /** 引擎实例 */
  private engineInstance: Engine;

  /** performance暂存的Map类 */
  public metrics: MetricsStore<WebVitals.metricsName>;

  /** 获取performance类型实例 */
  getPerformanceApiService = new GetPerformanceApiService();

  constructor(engineInstance: Engine) {
    this.engineInstance = engineInstance;
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
    this.engineInstance.report(
      Transport.transportCategory.PERF,
      this.metrics.getValues()
    );
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
    let sessionEntries: Array<WebVitals.ILayoutShift> = [];

    const entryHandler = (entry: WebVitals.ILayoutShift) => {
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
    const resourceFlow: Array<GetPerformanceApiService.IResourceFlowTiming> =
      [];
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
  /** 性能指标 */
  export enum metricsName {
    /** 首次绘制 */
    FP = "first-paint",

    /** 首次内容绘制 */
    FCP = "first-contentful-paint",

    /** 最大内容绘制 */
    LCP = "largest-contentful-paint",

    /** 首次输入延迟 */
    FID = "first-input-delay",

    /** 累积布局偏移 */
    CLS = "cumulative-layout-shift",

    /** 导航计时 */
    NT = "navigation-timing",

    /** 资源流 */
    RF = "resource-flow",
  }

  /** 布局偏移 */
  export interface ILayoutShift extends PerformanceEntry {
    value: number;
    hadRecentInput: boolean;
  }
}
