import { BehaviorStore } from "./behaviorStore";
import { Dimension } from "./dimension";
import { Transport } from "./transport";

/** 引擎 */
export class Engine {
  /** 初始化参数 */
  private config: Engine.IEngineInstanceOptions;
  /** 数据上传实例 */
  public transportInstance: Transport;
  /** 数据维度实例 */
  public dimensionInstance: Dimension;
  /** 用户行为追踪记录 */
  public breadcrumbs: BehaviorStore;

  constructor(options: Engine.IEngineInstanceOptions) {
    this.config = options;
    this.transportInstance = new Transport(this, {
      transportUrl: this.config.transportUrl,
    });
    this.dimensionInstance = new Dimension(this);
    this.breadcrumbs = new BehaviorStore({
      maxBehaviorRecords: this.config.maxBehaviorRecords,
    });
  }

  /** 初始化 */
  init = () => {};

  /** 启动 */
  start = () => {};

  /** 上报 */
  report = () => {};

  /** 构建 */
  build = () => {};

  /** 发送 */
  send = () => {};

  /** 销毁 */
  destroy = () => {};
}

export namespace Engine {
  export interface IEngineInstanceOptions {
    transportUrl: string;
    maxBehaviorRecords: number;
  }
}
