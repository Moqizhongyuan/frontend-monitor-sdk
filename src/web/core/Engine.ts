import { Engine as CoreEngine } from "../../core";
import { UserVitals } from "../plugins/behavior";
import { ErrorVitals } from "../plugins/error";
import { WebVitals } from "../plugins/performance";

export class Engine extends CoreEngine {
  /** 全局唯一实例 */
  private static instance: Engine | null = null;
  /** 用户行为监控实例 */
  public userInstance: UserVitals;
  /** 错误监控实例 */
  public errorInstance: ErrorVitals;
  /** 性能监控实例 */
  public performanceInstance: WebVitals;

  constructor(options: CoreEngine.IEngineInstanceOptions) {
    super(options);
    this.userInstance = new UserVitals(this);
    this.errorInstance = new ErrorVitals(this);
    this.performanceInstance = new WebVitals(this);
    if (Engine.instance) {
      return Engine.instance;
    }
    Engine.instance = this;
    return this;
  }
}
