import FrontendMonitor from "../index";
import { MonitorConfig } from "../types";

// 模拟全局浏览器API
global.performance = {
  getEntries: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  mark: jest.fn(),
  measure: jest.fn(),
  now: jest.fn(() => Date.now()),
  timing: {
    navigationStart: Date.now() - 1000,
    domContentLoadedEventEnd: Date.now() - 500,
    loadEventEnd: Date.now() - 200,
    responseStart: Date.now() - 900,
  },
} as any;

global.PerformanceObserver = class {
  observe = jest.fn();
  disconnect = jest.fn();
  constructor(public callback: any) {}
} as any;

global.navigator.sendBeacon = jest.fn(() => true);

// 测试FrontendMonitor类
describe("FrontendMonitor", () => {
  let monitor: FrontendMonitor;

  beforeEach(() => {
    // 测试前清除所有模拟
    jest.clearAllMocks();

    // 创建监控实例
    const config: Partial<MonitorConfig> = {
      appId: "test-app",
      userId: "test-user",
      reportUrl: "https://test.com/report",
    };
    monitor = new FrontendMonitor(config);
  });

  afterEach(() => {
    // 每个测试后销毁实例
    if (monitor) {
      monitor.destroy();
    }
  });

  test("应该使用给定配置创建实例", () => {
    expect(monitor).toBeDefined();
  });

  test("应该允许手动上报自定义事件", () => {
    // 模拟上报方法
    const spy = jest
      .spyOn(monitor["reporter"], "report")
      .mockImplementation(() => {});

    // 调用trackEvent方法
    monitor.trackEvent("category", "action", "label", 100);

    // 验证上报方法被调用并且参数正确
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "custom",
        category: "category",
        action: "action",
        label: "label",
        value: 100,
        appId: "test-app",
        userId: "test-user",
      })
    );
  });

  // 更多测试可以在这里添加...
});
