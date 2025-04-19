/** 浏览器文档或页面加载完毕触发 */
export const afterLoad = (callback: any) => {
  if (document.readyState === "complete") {
    setTimeout(callback);
  } else {
    window.addEventListener("pageshow", callback, {
      once: true,
      capture: true,
    });
  }
};

/** 派发出新的 Event */
const wr = (type: keyof History) => {
  const orig = history[type];
  return function (this: unknown) {
    const rv = orig.apply(this, arguments);
    const e = new Event(type);
    window.dispatchEvent(e);
    return rv;
  };
};

/** 添加 pushState replaceState 事件 */
export const wrHistory = (): void => {
  history.pushState = wr("pushState");
  history.replaceState = wr("replaceState");
};

/** 为 pushState 以及 replaceState 方法添加 Event 事件 */
export const proxyHistory = (handler: Function): void => {
  window.addEventListener("replaceState", (e) => handler(e), true);
  window.addEventListener("pushState", (e) => handler(e), true);
};

/** 为 hashchange 以及 popstate 方法添加 Event 事件 */
export const proxyHash = (handler: Function): void => {
  window.addEventListener("hashchange", (e) => handler(e), true);
  window.addEventListener("popstate", (e) => handler(e), true);
};

/** 调用 proxyXmlHttp 即可完成全局监听 XMLHttpRequest */
export const proxyXmlHttp = (
  sendHandler: Function | null | undefined,
  loadHandler: Function
) => {
  if (
    "XMLHttpRequest" in window &&
    typeof window.XMLHttpRequest === "function"
  ) {
    const oXMLHttpRequest = window.XMLHttpRequest;
    if (!(window as any).oXMLHttpRequest) {
      (window as any).oXMLHttpRequest = oXMLHttpRequest;
    }
    (window as any).XMLHttpRequest = function () {
      const xhr = new oXMLHttpRequest();
      const { open, send } = xhr;
      let metrics = {} as IHttpMetrics;
      xhr.open = (method, url) => {
        metrics.method = method;
        metrics.url = url;
        open.call(xhr, method, url, true);
      };
      xhr.send = (body) => {
        metrics.body = body || "";
        metrics.requestTime = new Date().getTime();
        if (typeof sendHandler === "function") sendHandler(xhr);
        send.call(xhr, body);
      };
      xhr.addEventListener("loadend", () => {
        const { status, statusText, response } = xhr;
        metrics = {
          ...metrics,
          status,
          statusText,
          response,
          responseTime: new Date().getTime(),
        };
        if (typeof loadHandler === "function") loadHandler(metrics);
      });
      return xhr;
    };
  }
};

export interface IHttpMetrics {
  method: string;
  url: string | URL;
  body: Document | XMLHttpRequestBodyInit | null | undefined | ReadableStream;
  requestTime: number;
  responseTime: number;
  status: number;
  statusText: string;
  response?: any;
}

/** 调用 proxyFetch 即可完成全局监听 fetch */
export const proxyFetch = (
  sendHandler: Function | null | undefined,
  loadHandler: Function
) => {
  if ("fetch" in window && typeof window.fetch === "function") {
    const oFetch = window.fetch;
    if (!(window as any).oFetch) {
      (window as any).oFetch = oFetch;
    }
    (window as any).fetch = async (input: any, init: RequestInit) => {
      if (typeof sendHandler === "function") sendHandler(init);
      let metrics = {} as IHttpMetrics;

      metrics.method = init?.method || "";
      metrics.url =
        (input && typeof input !== "string" ? input?.url : input) || "";
      metrics.body = init?.body || "";
      metrics.requestTime = Date.now();

      return oFetch.call(window, input, init).then(async (response) => {
        const res = response.clone();
        metrics = {
          ...metrics,
          status: res.status,
          statusText: res.statusText,
          response: await res.text(),
          responseTime: Date.now(),
        };
        if (typeof loadHandler === "function") loadHandler(metrics);
        return response;
      });
    };
  }
};
