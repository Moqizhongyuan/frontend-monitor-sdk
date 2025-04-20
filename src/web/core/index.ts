import { UserVitals } from "../plugins/behavior";
import { ErrorVitals } from "../plugins/error";
import { WebVitals } from "../plugins/performance";
import { Engine } from "./engine";

export const webSDK = new Engine(
  {
    transportUrl: "http://aaaa",
    maxBehaviorRecords: 100,
  },
  [WebVitals, UserVitals, ErrorVitals]
);
