import { MonitorModule, BehaviorData } from "../types";
import Reporter from "../utils/reporter";

/**
 * 行为监控模块
 * 监控用户行为，如点击、输入、页面跳转等
 */
class BehaviorMonitor implements MonitorModule {
  /** 数据上报器 */
  private reporter: Reporter;
  /** 点击事件节流定时器 */
  private clickThrottleTimer: number | null = null;
  /** 输入事件节流定时器 */
  private inputThrottleTimer: number | null = null;
  /** 节流时间 */
  private throttleTime: number = 500;
  /** 页面路径 */
  private currentPath: string = "";
  /** 最近一次页面浏览行为时间戳 */
  private lastPageviewTime: number = 0;

  /**
   * 创建行为监控实例
   * @param reporter 数据上报器
   */
  constructor(reporter: Reporter) {
    this.reporter = reporter;

    // 获取当前路径
    this.currentPath = this.getCurrentPath();

    // 上报初始页面浏览行为
    this.trackPageview();

    // 监听DOM行为
    this.initEventListeners();

    // 监听路由变化
    this.initRouteObserver();
  }

  /**
   * 初始化DOM事件监听
   */
  private initEventListeners(): void {
    // 点击事件监听
    document.addEventListener("click", this.onClickThrottled.bind(this), true);

    // 输入事件监听
    document.addEventListener("input", this.onInputThrottled.bind(this), true);
  }

  /**
   * 初始化路由观察
   */
  private initRouteObserver(): void {
    // 监听history API变化
    if (window.history) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        this.onRouteChange();
      };

      window.history.replaceState = (...args) => {
        originalReplaceState.apply(window.history, args);
        this.onRouteChange();
      };
    }

    // 监听hash变化
    window.addEventListener("hashchange", this.onRouteChange.bind(this));

    // 监听popstate事件
    window.addEventListener("popstate", this.onRouteChange.bind(this));
  }

  /**
   * 路由变化处理函数
   */
  private onRouteChange(): void {
    const newPath = this.getCurrentPath();

    // 如果路径发生变化，记录新页面浏览
    if (newPath !== this.currentPath) {
      this.currentPath = newPath;
      this.trackPageview();
    }
  }

  /**
   * 获取当前路径
   */
  private getCurrentPath(): string {
    return window.location.pathname + window.location.hash;
  }

  /**
   * 点击事件节流处理
   * @param event 点击事件
   */
  private onClickThrottled(event: MouseEvent): void {
    if (this.clickThrottleTimer !== null) return;

    this.clickThrottleTimer = window.setTimeout(() => {
      this.clickThrottleTimer = null;
      this.onClickEvent(event);
    }, this.throttleTime);
  }

  /**
   * 输入事件节流处理
   * @param event 输入事件
   */
  private onInputThrottled(event: Event): void {
    if (this.inputThrottleTimer !== null) return;

    this.inputThrottleTimer = window.setTimeout(() => {
      this.inputThrottleTimer = null;
      this.onInputEvent(event);
    }, this.throttleTime);
  }

  /**
   * 处理点击事件
   * @param event 点击事件
   */
  private onClickEvent(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    // 获取点击元素信息
    const elementInfo = this.getElementInfo(target);

    // 创建行为数据
    const behaviorData: BehaviorData = {
      type: "behavior",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: Date.now(),
      actionType: "click",
      path: this.currentPath,
      element: elementInfo,
      time: Date.now(), // 发生时间
    };

    this.reporter.report(behaviorData);
  }

  /**
   * 处理输入事件
   * @param event 输入事件
   */
  private onInputEvent(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    // 只监控表单元素
    if (!this.isFormElement(target)) return;

    // 获取元素信息
    const elementInfo = this.getElementInfo(target);

    // 创建行为数据
    const behaviorData: BehaviorData = {
      type: "behavior",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: Date.now(),
      actionType: "input",
      path: this.currentPath,
      element: elementInfo,
      time: Date.now(), // 发生时间
    };

    this.reporter.report(behaviorData);
  }

  /**
   * 记录页面浏览行为
   */
  private trackPageview(): void {
    const now = Date.now();

    // 如果短时间内多次浏览同一页面，则忽略
    if (now - this.lastPageviewTime < 1000) return;

    this.lastPageviewTime = now;

    // 创建页面浏览数据
    const behaviorData: BehaviorData = {
      type: "behavior",
      appId: "", // 由主类填充
      userId: "", // 由主类填充
      timestamp: now,
      actionType: "pageview",
      path: this.currentPath,
      time: now,
    };

    this.reporter.report(behaviorData);
  }

  /**
   * 获取元素信息
   * @param element DOM元素
   */
  private getElementInfo(element: HTMLElement): string {
    if (!element || !element.tagName) return "";

    // 获取元素标签
    const tagName = element.tagName.toLowerCase();

    // 获取元素ID
    const id = element.id ? `#${element.id}` : "";

    // 获取元素类名
    const className =
      element.className && typeof element.className === "string"
        ? `.${element.className.split(" ").join(".")}`
        : "";

    // 获取元素文本内容
    let textContent = "";
    if (element.textContent) {
      textContent = element.textContent.trim().slice(0, 20);
      if (element.textContent.length > 20) textContent += "...";
      textContent = `:text(${textContent})`;
    }

    // 组合元素选择器信息
    return `${tagName}${id}${className}${textContent}`;
  }

  /**
   * 判断是否为表单元素
   * @param element DOM元素
   */
  private isFormElement(element: HTMLElement): boolean {
    if (!element || !element.tagName) return false;

    const tagName = element.tagName.toLowerCase();
    const formElements = ["input", "textarea", "select", "button"];

    return formElements.includes(tagName);
  }

  /**
   * 销毁实例，清理事件监听
   */
  public destroy(): void {
    // 清除节流定时器
    if (this.clickThrottleTimer !== null) {
      clearTimeout(this.clickThrottleTimer);
      this.clickThrottleTimer = null;
    }

    if (this.inputThrottleTimer !== null) {
      clearTimeout(this.inputThrottleTimer);
      this.inputThrottleTimer = null;
    }

    // 移除事件监听
    document.removeEventListener(
      "click",
      this.onClickThrottled.bind(this),
      true
    );
    document.removeEventListener(
      "input",
      this.onInputThrottled.bind(this),
      true
    );
    window.removeEventListener("hashchange", this.onRouteChange.bind(this));
    window.removeEventListener("popstate", this.onRouteChange.bind(this));

    // 恢复被重写的history方法
    if (window.history) {
      try {
        // 这里简单处理，实际情况可能需要保存和恢复原始方法
        delete (window.history as any).__overridden__;
      } catch (e) {
        console.error("Error restoring history methods:", e);
      }
    }
  }
}

export default BehaviorMonitor;
