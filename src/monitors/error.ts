import { MonitorModule, ErrorData } from "../types";
import Reporter from "../utils/reporter";

/**
 * 错误监控模块
 * 负责捕获JS错误、Promise错误、资源加载错误等
 */
class ErrorMonitor implements MonitorModule {
  /** 数据上报器 */
  private reporter: Reporter;
  /** 原始控制台错误方法 */
  private originalConsoleError: typeof console.error;

  /**
   * 创建错误监控实例
   * @param reporter 数据上报器
   */
  constructor(reporter: Reporter) {
    this.reporter = reporter;
    this.originalConsoleError = console.error;

    // 捕获全局JS错误
    window.addEventListener("error", this.onError.bind(this), true);

    // 捕获Promise未处理的rejection
    window.addEventListener(
      "unhandledrejection",
      this.onUnhandledRejection.bind(this),
      true
    );

    // 劫持 console.error
    this.overrideConsoleError();
  }

  /**
   * 处理JS执行错误
   * @param event 错误事件
   */
  private onError(event: ErrorEvent): void {
    // 过滤资源加载错误
    if (this.isResourceLoadError(event)) {
      this.onResourceError(event);
      return;
    }

    const errorData: ErrorData = {
      type: "error",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: Date.now(),
      name: event.error?.name || "Error",
      message: event.message || "Unknown error",
      stack: event.error?.stack || "",
      url: window.location.href,
      errorType: "js",
    };

    this.reporter.report(errorData);
  }

  /**
   * 处理资源加载错误
   * @param event 错误事件
   */
  private onResourceError(event: ErrorEvent): void {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const url = this.getResourceUrl(target);

    if (!url) return;

    const errorData: ErrorData = {
      type: "error",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: Date.now(),
      name: "ResourceError",
      message: `Failed to load ${tagName}: ${url}`,
      stack: "",
      url: window.location.href,
      errorType: "resource",
    };

    this.reporter.report(errorData);
  }

  /**
   * 处理未捕获的Promise错误
   * @param event Promise错误事件
   */
  private onUnhandledRejection(event: PromiseRejectionEvent): void {
    let message = "Promise rejected";
    let stack = "";
    let name = "UnhandledRejection";

    // 提取错误详情
    if (event.reason instanceof Error) {
      message = event.reason.message;
      stack = event.reason.stack || "";
      name = event.reason.name;
    } else if (typeof event.reason === "string") {
      message = event.reason;
    } else {
      try {
        message = JSON.stringify(event.reason);
      } catch (e) {
        message = "Unserializable promise rejection reason";
      }
    }

    const errorData: ErrorData = {
      type: "error",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: Date.now(),
      name,
      message,
      stack,
      url: window.location.href,
      errorType: "promise",
    };

    this.reporter.report(errorData);
  }

  /**
   * 检查是否为资源加载错误
   * @param event 错误事件
   */
  private isResourceLoadError(event: ErrorEvent): boolean {
    const target = event.target as HTMLElement;
    if (!target) return false;

    const tagName = target.tagName.toLowerCase();
    const isElementNode = target instanceof HTMLElement;
    const loadTags = ["link", "script", "img", "audio", "video", "source"];

    return isElementNode && loadTags.includes(tagName);
  }

  /**
   * 获取资源URL
   * @param target 目标元素
   */
  private getResourceUrl(target: HTMLElement): string {
    if (target instanceof HTMLImageElement) {
      return target.src || "";
    } else if (target instanceof HTMLScriptElement) {
      return target.src || "";
    } else if (target instanceof HTMLLinkElement) {
      return target.href || "";
    } else if (
      target instanceof HTMLAudioElement ||
      target instanceof HTMLVideoElement
    ) {
      return target.src || "";
    }

    return "";
  }

  /**
   * 重写console.error以捕获开发者手动报告的错误
   */
  private overrideConsoleError(): void {
    console.error = (...args: any[]) => {
      // 调用原始的console.error
      this.originalConsoleError.apply(console, args);

      // 收集错误信息
      let message = "";

      args.forEach((arg) => {
        if (arg instanceof Error) {
          const errorData: ErrorData = {
            type: "error",
            appId: "", // 由主类填充
            userId: "", // 由主类填充
            timestamp: Date.now(),
            name: arg.name,
            message: arg.message,
            stack: arg.stack || "",
            url: window.location.href,
            errorType: "js",
          };

          this.reporter.report(errorData);
        } else {
          if (message) message += " ";

          try {
            if (typeof arg === "object") {
              message += JSON.stringify(arg);
            } else {
              message += String(arg);
            }
          } catch (e) {
            message += "[Unserializable data]";
          }
        }
      });

      // 如果没有Error对象但有消息内容
      if (message) {
        const errorData: ErrorData = {
          type: "error",
          appId: "", // 由主类填充
          userId: "", // 由主类填充
          timestamp: Date.now(),
          name: "ConsoleError",
          message,
          stack: (new Error().stack || "").split("\n").slice(2).join("\n"),
          url: window.location.href,
          errorType: "other",
        };

        this.reporter.report(errorData);
      }
    };
  }

  /**
   * 销毁实例，清理事件监听和劫持
   */
  public destroy(): void {
    window.removeEventListener("error", this.onError.bind(this), true);
    window.removeEventListener(
      "unhandledrejection",
      this.onUnhandledRejection.bind(this),
      true
    );

    // 恢复原始的console.error
    console.error = this.originalConsoleError;
  }
}

export default ErrorMonitor;
