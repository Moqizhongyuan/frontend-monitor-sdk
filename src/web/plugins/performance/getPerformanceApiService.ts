/**
 * @file get performance api service
 * @author yuzhongyuan
 */

export class GetPerformanceApiService {
  /** 通过performance.observe获取性能指标 */
  private observe(
    type: string,
    callback: GetPerformanceApiService.IPerformanceEntryHandler
  ): PerformanceObserver | undefined {
    // 类型合规，就返回 observe
    if (PerformanceObserver.supportedEntryTypes?.includes(type)) {
      const ob: PerformanceObserver = new PerformanceObserver((l) =>
        l.getEntries().map(callback)
      );

      ob.observe({ type, buffered: true });
      return ob;
    }
    return undefined;
  }

  /** 获取 FP */
  getFP(): PerformanceEntry | undefined {
    const [entry] = performance.getEntriesByName("first-paint");
    return entry;
  }

  /** 获取 FCP */
  getFCP(): PerformanceEntry | undefined {
    const [entry] = performance.getEntriesByName("first-contentful-paint");
    return entry;
  }

  /** 获取 LCP */
  getLCP = (
    entryHandler: GetPerformanceApiService.IPerformanceEntryHandler
  ): PerformanceObserver | undefined => {
    return this.observe("largest-contentful-paint", entryHandler);
  };

  /** 获取 FID */
  getFID = (
    entryHandler: GetPerformanceApiService.IPerformanceEntryHandler
  ): PerformanceObserver | undefined => {
    return this.observe("first-input", entryHandler);
  };

  /** 获取 CLS */
  getCLS = (
    entryHandler: GetPerformanceApiService.IPerformanceEntryHandler
  ): PerformanceObserver | undefined => {
    return this.observe("layout-shift", entryHandler);
  };

  getNavigationTiming = ():
    | GetPerformanceApiService.IMPerformanceNavigationTiming
    | undefined => {
    const resolveNavigationTiming = (
      entry: PerformanceNavigationTiming
    ): GetPerformanceApiService.IMPerformanceNavigationTiming => {
      const {
        domainLookupStart,
        domainLookupEnd,
        connectStart,
        connectEnd,
        secureConnectionStart,
        requestStart,
        responseStart,
        responseEnd,
        domInteractive,
        domContentLoadedEventEnd,
        loadEventStart,
        fetchStart,
      } = entry;

      return {
        // 关键时间点
        FP: responseEnd - fetchStart,
        TTI: domInteractive - fetchStart,
        DomReady: domContentLoadedEventEnd - fetchStart,
        Load: loadEventStart - fetchStart,
        FirstByte: responseStart - domainLookupStart,
        // 关键时间段
        DNS: domainLookupEnd - domainLookupStart,
        TCP: connectEnd - connectStart,
        SSL: secureConnectionStart ? connectEnd - secureConnectionStart : 0,
        TTFB: responseStart - requestStart,
        Trans: responseEnd - responseStart,
        DomParse: domInteractive - responseEnd,
        Res: loadEventStart - domContentLoadedEventEnd,
      };
    };

    const navigation =
      performance.getEntriesByType("navigation").length > 0
        ? performance.getEntriesByType("navigation")[0]
        : performance.timing; // 降级处理
    return resolveNavigationTiming(navigation as PerformanceNavigationTiming);
  };

  getResourceFlow = (
    resourceFlow: Array<GetPerformanceApiService.IResourceFlowTiming>
  ): PerformanceObserver | undefined => {
    const entryHandler = (entry: PerformanceResourceTiming) => {
      const {
        name,
        transferSize,
        initiatorType,
        startTime,
        responseEnd,
        domainLookupEnd,
        domainLookupStart,
        connectStart,
        connectEnd,
        secureConnectionStart,
        responseStart,
        requestStart,
      } = entry;
      resourceFlow.push({
        // name 资源地址
        name,
        // transferSize 传输大小
        transferSize,
        // initiatorType 资源类型
        initiatorType,
        // startTime 开始时间
        startTime,
        // responseEnd 结束时间
        responseEnd,
        // 贴近 Chrome 的近似分析方案，受到跨域资源影响
        dnsLookup: domainLookupEnd - domainLookupStart,
        initialConnect: connectEnd - connectStart,
        ssl: connectEnd - secureConnectionStart,
        request: responseStart - requestStart,
        ttfb: responseStart - requestStart,
        contentDownload: responseStart - requestStart,
      });
    };

    return this.observe("resource", entryHandler);
  };
}

export namespace GetPerformanceApiService {
  export interface IMPerformanceNavigationTiming {
    FP?: number;
    TTI?: number;
    DomReady?: number;
    Load?: number;
    FirstByte?: number;
    DNS?: number;
    TCP?: number;
    SSL?: number;
    TTFB?: number;
    Trans?: number;
    DomParse?: number;
    Res?: number;
  }
  export interface IPerformanceEntryHandler {
    (entry: any): void;
  }

  export interface IResourceFlowTiming {
    name: string;
    transferSize: number;
    initiatorType: string;
    startTime: number;
    responseEnd: number;
    dnsLookup: number;
    initialConnect: number;
    ssl: number;
    request: number;
    ttfb: number;
    contentDownload: number;
  }
}
