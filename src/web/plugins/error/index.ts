/**
 * @file error vitals
 * @author yuzhongyuan
 */

import { Engine } from "../../core/engine";
import { IHttpMetrics, proxyFetch, proxyXmlHttp } from "../../utils";
import { BehaviorStore } from "../../../core";
import { Transport } from "../../../core";

export class ErrorVitals {
  /** 插件名称 */
  name: string = "error vitals";
  /** 引擎实例 */
  private engineInstance: Engine;

  // 已上报的错误 uid
  private submitErrorUids: Array<string>;

  constructor(engineInstance: Engine) {
    this.engineInstance = engineInstance;
    this.submitErrorUids = [];
    this.initJsError();
    this.initResourceError();
    this.initPromiseError();
    this.initHttpError();
    this.initCorsError();
  }

  /** 封装错误的上报入口，上报前，判断错误是否已经发生过 */
  errorSendHandler = (data: ErrorVitals.IExceptionMetrics) => {
    const submitParams: ErrorVitals.IExceptionMetrics = {
      ...data,
      breadcrumbs: this.engineInstance.breadcrumbs.get(),
      pageInformation: this.engineInstance.plugins
        .get("user-vitals")
        ?.metrics?.get("page-information"),
    };
    const hasSubmitStatus = this.submitErrorUids.includes(
      submitParams.errorUid
    );
    if (hasSubmitStatus) return;
    this.submitErrorUids.push(submitParams.errorUid);
    this.engineInstance.breadcrumbs.clear();
    this.engineInstance.report(Transport.transportCategory.ERROR, submitParams);
  };

  /** 初始化 JS异常 的数据获取和上报 */
  initJsError = (): void => {
    const handler = (event: ErrorEvent) => {
      event.preventDefault();
      if (ErrorVitals.getErrorKey(event) !== ErrorVitals.mechanismType.JS)
        return;
      const exception: ErrorVitals.IExceptionMetrics = {
        mechanism: {
          type: ErrorVitals.mechanismType.JS,
        },
        value: event.message,
        type: (event.error && event.error.name) || "UnKnown",
        stackTrace: {
          frames: ErrorVitals.parseStackFrames(event.error),
        },
        errorUid: ErrorVitals.getErrorUid(
          `${ErrorVitals.mechanismType.JS}-${event.message}-${event.filename}`
        ),
        meta: {
          file: event.filename,
          col: event.colno,
          row: event.lineno,
        },
      };
      this.errorSendHandler(exception);
    };
    window.addEventListener("error", (event) => handler(event), true);
  };

  /** 初始化 静态资源异常 的数据获取和上报 */
  initResourceError = (): void => {
    const handler = (event: Event) => {
      event.preventDefault();
      if (ErrorVitals.getErrorKey(event) !== ErrorVitals.mechanismType.RS)
        return;
      const target = event.target as ErrorVitals.IResourceErrorTarget;
      const exception: ErrorVitals.IExceptionMetrics = {
        mechanism: {
          type: ErrorVitals.mechanismType.RS,
        },
        value: "",
        type: "ResourceError",
        errorUid: ErrorVitals.getErrorUid(
          `${ErrorVitals.mechanismType.RS}-${target.src}-${target.tagName}`
        ),
        meta: {
          url: target.src,
          html: target.outerHTML,
          type: target.tagName,
        },
      };
      this.errorSendHandler(exception);
    };
    window.addEventListener("error", (event) => handler(event), true);
  };

  /** 初始化 Promise异常 的数据获取和上报 */
  initPromiseError = (): void => {
    const handler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const value = event.reason.message || event.reason;
      const type = event.reason.name || "UnKnown";
      const exception: ErrorVitals.IExceptionMetrics = {
        mechanism: {
          type: ErrorVitals.mechanismType.UJ,
        },
        value,
        type,
        stackTrace: {
          frames: ErrorVitals.parseStackFrames(event.reason),
        },
        errorUid: ErrorVitals.getErrorUid(
          `${ErrorVitals.mechanismType.UJ}-${value}-${type}`
        ),
        meta: {},
      };
      this.errorSendHandler(exception);
    };

    window.addEventListener(
      "unhandledrejection",
      (event) => handler(event),
      true
    );
  };

  /** 初始化 HTTP请求异常 的数据获取和上报 */
  initHttpError = (): void => {
    const loadHandler = (metrics: IHttpMetrics) => {
      if (metrics.status < 400) return;
      const value = metrics.response;
      const exception: ErrorVitals.IExceptionMetrics = {
        mechanism: {
          type: ErrorVitals.mechanismType.HP,
        },
        value,
        type: "HttpError",
        errorUid: ErrorVitals.getErrorUid(
          `${ErrorVitals.mechanismType.HP}-${value}-${metrics.statusText}`
        ),
        meta: {
          metrics,
        },
      };
      this.errorSendHandler(exception);
    };
    proxyXmlHttp(null, loadHandler);
    proxyFetch(null, loadHandler);
  };

  /** 初始化 跨域异常 的数据获取和上报 */
  initCorsError = (): void => {
    const handler = (event: ErrorEvent) => {
      event.preventDefault();
      if (ErrorVitals.getErrorKey(event) !== ErrorVitals.mechanismType.CS)
        return;
      const exception: ErrorVitals.IExceptionMetrics = {
        mechanism: {
          type: ErrorVitals.mechanismType.CS,
        },
        value: event.message,
        type: "CorsError",
        errorUid: ErrorVitals.getErrorUid(
          `${ErrorVitals.mechanismType.CS}-${event.message}`
        ),
        meta: {},
      };
      this.errorSendHandler(exception);
    };
    window.addEventListener("error", (event) => handler(event), true);
  };
}

export namespace ErrorVitals {
  /** 错误捕获的机制类型，用于标识错误的来源和类型 */
  export enum mechanismType {
    /** JavaScript语法或运行时错误 */
    JS = "js",
    /** 资源加载错误（如脚本、样式表、图片等） */
    RS = "resource",
    /** Promise未处理的rejection错误 */
    UJ = "unhandledrejection",
    /** HTTP请求错误（网络请求失败） */
    HP = "http",
    /** 跨域资源共享错误 */
    CS = "cors",
  }

  /** 判断是 JS异常、静态资源异常、还是跨域异常 */
  export const getErrorKey = (event: ErrorEvent | Event) => {
    const isJsError = event instanceof ErrorEvent;
    if (!isJsError) return mechanismType.RS;
    return event.message === "Script error."
      ? mechanismType.CS
      : mechanismType.JS;
  };

  /** 异常数据结构定义 */
  export interface IExceptionMetrics {
    /** 错误捕获的机制和上下文信息 */
    mechanism: Object;
    /** 错误的具体消息内容 */
    value?: string;
    /** 错误类型 */
    type: string;
    /** 错误的堆栈跟踪信息 */
    stackTrace?: Object;
    /** 发生错误时的页面信息 */
    pageInformation?: Object;
    /** 错误发生前的用户行为轨迹 */
    breadcrumbs?: Array<BehaviorStore.IBehavior>;
    /** 错误的唯一标识符，用于去重和追踪 */
    errorUid: string;
    /** 附加的元数据信息 */
    meta?: any;
  }

  /** 对每一个错误详情，生成一串编码 */
  export const getErrorUid = (input: string) => {
    return window.btoa(unescape(encodeURIComponent(input)));
  };

  /** 正则表达式，用以解析堆栈split后得到的字符串 */
  const FULL_MATCH =
    /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

  /** 限制只追溯10个 */
  const STACKTRACE_LIMIT = 10;

  /** 解析每一行 */
  export function parseStackLine(line: string) {
    const lineMatch = line.match(FULL_MATCH);
    if (!lineMatch) return {};
    const filename = lineMatch[2];
    const functionName = lineMatch[1] || "";
    const lineno = parseInt(lineMatch[3], 10) || undefined;
    const colno = parseInt(lineMatch[4], 10) || undefined;
    return {
      filename,
      functionName,
      lineno,
      colno,
    };
  }

  /** 解析错误堆栈 */
  export function parseStackFrames(error: Error) {
    const { stack } = error;
    if (!stack) return [];
    const frames = [];
    for (const line of stack.split("\n").slice(1)) {
      const frame = parseStackLine(line);
      if (frame) {
        frames.push(frame);
      }
    }
    return frames.slice(0, STACKTRACE_LIMIT);
  }

  /** 静态资源错误的 ErrorTarget */
  export interface IResourceErrorTarget {
    src?: string;
    tagName?: string;
    outerHTML?: string;
  }
}
