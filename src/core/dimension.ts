import { Engine } from "./engine";

export class Dimension {
  private engineInstance: Engine;

  constructor(engineInstance: Engine) {
    this.engineInstance = engineInstance;
  }
}

export namespace Dimension {
  export interface IDimensionStructure {
    // 用户id，存储于cookie
    uid: string;
    // 会话id，存储于cookieStorage
    sid: string;
    // 应用id，使用方传入
    pid: string;
    // 应用版本号
    release: string;
    // 应用环境
    environment: string;
  }
}
