import { ReportData } from "../types";

/**
 * 数据上报工具类
 */
class Reporter {
  /** 上报地址 */
  private reportUrl: string;
  /** 缓存队列 */
  private queue: ReportData[] = [];
  /** 是否正在上报 */
  private sending: boolean = false;
  /** 最大缓存数量 */
  private maxCache: number = 10;
  /** 上报失败重试次数 */
  private retryCount: number = 3;
  /** 定时上报器 */
  private timer: number | null = null;

  /**
   * 创建上报工具实例
   * @param reportUrl 上报地址
   */
  constructor(reportUrl: string) {
    this.reportUrl = reportUrl;

    // 定时上报
    this.startTimer();

    // 页面关闭前上报
    window.addEventListener("beforeunload", this.flush.bind(this));
  }

  /**
   * 开始定时上报
   */
  private startTimer(): void {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => {
      this.flush();
    }, 5000); // 5秒上报一次
  }

  /**
   * 停止定时上报
   */
  private stopTimer(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * 添加数据到上报队列
   * @param data 上报数据
   */
  public report(data: ReportData): void {
    // 添加到队列
    this.queue.push(data);

    // 超过最大缓存则立即上报
    if (this.queue.length >= this.maxCache) {
      this.flush();
    }
  }

  /**
   * 立即上报队列中的所有数据
   */
  public flush(): void {
    if (this.sending || this.queue.length === 0) return;

    const dataToSend = [...this.queue];
    this.queue = [];
    this.sending = true;

    this.sendData(dataToSend, 0)
      .catch((err) => {
        console.error("Monitor data report failed:", err);
        // 上报失败则将数据放回队列
        this.queue = [...dataToSend, ...this.queue];
      })
      .finally(() => {
        this.sending = false;
      });
  }

  /**
   * 发送数据（支持失败重试）
   * @param data 要发送的数据
   * @param retryTimes 已重试次数
   */
  private async sendData(
    data: ReportData[],
    retryTimes: number
  ): Promise<void> {
    if (!this.reportUrl) {
      console.warn("Monitor report URL is not set");
      return;
    }

    try {
      // 使用 sendBeacon 优先，如果不支持则使用 fetch
      const success = this.tryUseBeacon(data);
      if (success) return;

      // Beacon 不可用，使用 fetch
      const response = await fetch(this.reportUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // 页面关闭时请求可能会被取消，设置 keepalive 标记确保数据发送
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      // 重试次数未达上限则重试
      if (retryTimes < this.retryCount) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 延迟1秒后重试
        return this.sendData(data, retryTimes + 1);
      }

      throw error;
    }
  }

  /**
   * 尝试使用 sendBeacon API 上报数据
   * @param data 上报数据
   * @returns 是否成功发送
   */
  private tryUseBeacon(data: ReportData[]): boolean {
    if (!navigator.sendBeacon || !this.reportUrl) return false;

    try {
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      return navigator.sendBeacon(this.reportUrl, blob);
    } catch (e) {
      return false;
    }
  }

  /**
   * 销毁实例，清理资源
   */
  public destroy(): void {
    this.stopTimer();
    window.removeEventListener("beforeunload", this.flush.bind(this));
    this.flush(); // 销毁前发送所有数据
  }
}

export default Reporter;
