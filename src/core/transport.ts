import { Engine } from "./engine";

export class Transport {
  private engineInstance: Engine;

  public kernelTransportHandler: Function;

  private options: Transport.ITransportOptions;

  constructor(engineInstance: Engine, options: Transport.ITransportOptions) {
    this.engineInstance = engineInstance;
    this.options = options;
    this.kernelTransportHandler = this.initTransportHandler();
  }

  // 格式化数据,传入部分为 category 和 context \ contexts
  formatTransportData = (
    category: Transport.transportCategory,
    data: Object | Array<Object>
  ): Transport.ITransportStructure => {
    const transportStructure: Transport.ITransportStructure = {
      category,
    };
    if (data instanceof Array) {
      transportStructure.contexts = data;
    } else {
      transportStructure.context = data;
    }
    return transportStructure;
  };

  // 初始化上报方法
  initTransportHandler = (): Function => {
    return typeof navigator.sendBeacon === "function"
      ? this.beaconTransport()
      : this.xmlTransport();
  };

  // beacon 形式上报
  beaconTransport = (): Function => {
    const handler = (data: Transport.ITransportStructure) => {
      const status = window.navigator.sendBeacon(
        this.options.transportUrl,
        JSON.stringify(data)
      );
      // 如果数据量过大，则本次大数据量用 XMLHttpRequest 上报
      if (!status) this.xmlTransport().apply(this, data);
    };
    return handler;
  };

  // XMLHttpRequest 形式上报
  xmlTransport = (): Function => {
    const handler = (data: Transport.ITransportStructure) => {
      const xhr = new (window as any).oXMLHttpRequest();
      xhr.open("POST", this.options.transportUrl, true);
      xhr.send(JSON.stringify(data));
    };
    return handler;
  };
}

export namespace Transport {
  export enum transportCategory {
    /** PV访问数据 */
    PV = "pv",
    /** 性能数据 */
    PERF = "perf",
    /** api 请求数据 */
    API = "api",
    /** 报错数据 */
    ERROR = "error",
    /** 自定义行为 */
    CUS = "custom",
  }

  export interface ITransportStructure {
    /** 上报类别 */
    category: transportCategory;
    /** 上报对象(正文) */
    context?: Object;
    /** 上报对象数组 */
    contexts?: Array<Object>;
  }

  export interface ITransportOptions {
    transportUrl: string;
  }
}
