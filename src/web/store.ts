export interface IMetrics {
  [prop: string | number]: any;
}

// Map 暂存数据
export default class metricsStore<T> {
  state: Map<T | string, IMetrics>;

  constructor() {
    this.state = new Map<T | string, IMetrics>();
  }

  set(key: T | string, value: IMetrics): void {
    this.state.set(key, value);
  }

  add(key: T | string, value: IMetrics): void {
    const keyValue = this.state.get(key);
    this.state.set(key, keyValue ? keyValue.concat([value]) : [value]);
  }

  get(key: T | string): IMetrics | undefined {
    return this.state.get(key);
  }

  has(key: T | string): boolean {
    return this.state.has(key);
  }

  clear() {
    this.state.clear();
  }

  getValues(): IMetrics {
    // Map 转为 对象 返回
    return Object.fromEntries(this.state);
  }
}
