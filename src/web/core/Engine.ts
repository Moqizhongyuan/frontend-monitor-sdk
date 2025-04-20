import { Engine as CoreEngine } from "../../core";
import { UserVitals } from "../plugins/behavior";
import { ErrorVitals } from "../plugins/error";
import { WebVitals } from "../plugins/performance";

export class Engine extends CoreEngine {
  constructor(
    options: CoreEngine.IEngineInstanceOptions,
    pluginConstructors: Array<CoreEngine.IPluginConstructor>
  ) {
    super(options, pluginConstructors);
  }
}
