export * from "./core";
import { Engine as WebEngine, WebVitals, UserVitals, ErrorVitals } from "./web";

const monitor = new WebEngine("https://monitor.yzy.com/api/v1/monitor", {
  maxBehaviorRecords: 100,
  plugins: [
    WebVitals,
    UserVitals,
    ErrorVitals,
  ],
});
