import { BehaviorStore } from "./behaviorStore";
import { Dimension } from "./dimension";
import { EventDispatcher } from "./eventDistapch";
import { Transport } from "./transport";

/** 引擎 */
export class Engine extends EventDispatcher {
  /** 初始化参数 */
  private config: Engine.IEngineInstanceOptions;
  /** 数据上传实例 */
  public transportInstance: Transport;
  /** 数据维度实例 */
  public dimensionInstance: Dimension;
  /** 用户行为追踪记录 */
  public breadcrumbs: BehaviorStore;

  constructor(options: Engine.IEngineInstanceOptions) {
    super();
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
  report = (type: Transport.transportCategory, data: any) => {
    this.build(type, data);
  };

  /** 构建 */
  build = (type: Transport.transportCategory, data: any) => {
    const formateData = this.transportInstance.formatTransportData(type, data);
    this.send(formateData);
  };

  /** 发送 */
  send = (formateData: any) => {
    this.transportInstance.kernelTransportHandler(formateData);
  };

  /** 销毁 */
  destroy = () => {};
}

export namespace Engine {
  export interface IEngineInstanceOptions {
    transportUrl: string;
    maxBehaviorRecords: number;
  }
  export enum engineLifeState {
    INIT = "init",
    START = "start",
    REPORT = "report",
    BUILD = "build",
    SEND = "send",
    DESTROY = "destroy",
  }
}
