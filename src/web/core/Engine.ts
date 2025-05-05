import { Engine as CoreEngine } from "../../core";

export class Engine extends CoreEngine {
  constructor(
    transportUrl: string,
    options?: CoreEngine.IEngineInstanceOptions,
  ) {
    super(transportUrl, options);
  }
}
