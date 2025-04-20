import { MetricsStore } from "../store";
import { afterLoad } from "../web/utils";
import { BehaviorStore } from "./behaviorStore";
import { Dimension } from "./dimension";
import { EventDispatcher } from "./eventDispatch";
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
  /** 插件 */
  public plugins: Map<string, Engine.IPlugin>;

  constructor(
    options: Engine.IEngineInstanceOptions,
    pluginConstructors: Array<Engine.IPluginConstructor>
  ) {
    super();
    this.config = options;
    this.transportInstance = new Transport(this, {
      transportUrl: this.config.transportUrl,
    });
    this.dimensionInstance = new Dimension(this);
    this.breadcrumbs = new BehaviorStore({
      maxBehaviorRecords: this.config.maxBehaviorRecords,
    });
    this.plugins = new Map();
    try {
      this.init(pluginConstructors);
    } catch {
      this.report(Transport.transportCategory.ERROR, "init plugin error");
    }
    try {
      afterLoad(this.start());
    } catch {
      this.report(Transport.transportCategory.ERROR, "start plugin error");
    }
  }

  /** 初始化 */
  init = (PluginConstructors: Array<Engine.IPluginConstructor>) => {
    PluginConstructors.forEach((PluginConstructor) => {
      const pluginInstance = new PluginConstructor(this);
      if (this.plugins.has(pluginInstance.name)) {
        console.warn("this plugin has been registered");
      }
      this.plugins.set(pluginInstance.name, pluginInstance);
    });
  };

  /** 启动 */
  start = () => {
    this.plugins.forEach((plugin) => {
      plugin.start;
    });
  };

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
  export interface IPlugin {
    name: string;
    metrics?: MetricsStore<string>;
    start?: () => {};
    destroy?: () => {};
  }

  export interface IPluginConstructor {
    new (engine: Engine): IPlugin;
  }
}
