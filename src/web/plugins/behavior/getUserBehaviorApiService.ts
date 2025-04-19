/**
 * @file get user behavior api service
 * @author yuzhongyuan
 */

export class GetUserBehaviorApiService {
  /** 获取页面信息 */
  getPageInfo = (): GetUserBehaviorApiService.IPageInformation => {
    const {
      host,
      hostname,
      href,
      protocol,
      origin,
      port,
      pathname,
      search,
      hash,
    } = window.location;
    const { width, height } = window.screen;
    const { language, userAgent } = navigator;

    return {
      host,
      hostname,
      href,
      protocol,
      origin,
      port,
      pathname,
      search,
      hash,
      title: document.title,
      language: language.substr(0, 2),
      userAgent,
      winScreen: `${width}x${height}`,
      docScreen: `${
        document.documentElement.clientWidth || document.body.clientWidth
      }x${document.documentElement.clientHeight || document.body.clientHeight}`,
    };
  };

  /** 获取 OI 用户来路信息 */
  getOriginInfo = (): GetUserBehaviorApiService.IOriginInformation => {
    let navigationType = "";
    try {
      const navigationEntries = performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        navigationType = navigationEntries[0].type;
      }
    } catch (e) {
      navigationType =
        window.performance?.navigation?.type !== undefined
          ? String(window.performance.navigation.type)
          : "";
    }
    return {
      referrer: document.referrer,
      type: navigationType,
    };
  };
}

export namespace GetUserBehaviorApiService {
  /** 页面信息 */
  export interface IPageInformation {
    /** 当前页面URL的主机部分，包括子域名和域名 */
    host: string;
    /** 当前页面URL的主机名（不包含端口） */
    hostname: string;
    /** 完整的当前页面URL */
    href: string;
    /** 当前页面URL的协议方案（如'http:'或'https:'） */
    protocol: string;
    /** 当前页面URL的协议+主机部分（协议+主机+端口） */
    origin: string;
    /** 当前页面URL的端口部分 */
    port: string;
    /** 当前页面URL的路径部分（域名后的部分，不包括查询参数和哈希） */
    pathname: string;
    /** 当前页面URL的查询参数部分（包括?号） */
    search: string;
    /** 当前页面URL的哈希部分（锚点，包括#号） */
    hash: string;
    /** 网页标题（document.title的值） */
    title: string;
    /** 浏览器的语种 (例如:zh)，这里截取了前两位字符 */
    language: string;
    /** 用户浏览器的User-Agent字符串，包含浏览器类型、版本等信息 */
    userAgent?: string;
    /** 屏幕物理宽高 (例如:1920x1080)，表示整个显示屏的物理分辨率 */
    winScreen: string;
    /** 文档可视区域宽高 (例如:1388x937)，表示当前浏览器窗口的实际可视尺寸 */
    docScreen: string;
  }
  export interface IOriginInformation {
    referrer: string;
    type: number | string;
  }
}
