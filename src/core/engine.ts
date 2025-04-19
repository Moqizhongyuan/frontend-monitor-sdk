import { Dimension } from "./dimension";
import { Transport } from "./transport";

/** 引擎 */
export class Engine {
  /** 初始化参数 */
  private options: Engine.IEngineInstanceOptions;
  /** 数据上传实例 */
  public transportInstance: Transport;
  /** 数据维度实例 */
  public dimensionInstance: Dimension;

  constructor(options: Engine.IEngineInstanceOptions) {
    this.options = options;
    this.transportInstance = new Transport(this, {
      transportUrl: this.options.transportUrl,
    });
    this.dimensionInstance = new Dimension(this);
  }
}

export namespace Engine {
  export interface IEngineInstanceOptions {
    transportUrl: string;
  }
}
