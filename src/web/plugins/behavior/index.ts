/**
 * @file user vitals
 * @author yuzhongyuan
 */

import { Transport } from "../../../core";
import { Engine } from "../../core";
import metricsStore, { IMetrics } from "../../store";
import {
  afterLoad,
  IHttpMetrics,
  proxyFetch,
  proxyHash,
  proxyHistory,
  proxyXmlHttp,
  wrHistory,
} from "../../utils";
import { BehaviorStore } from "./behaviorStore";
import { GetUserBehaviorApiService } from "./getUserBehaviorApiService";

export class UserVitals {
  private engineInstance: Engine;

  /** 获取用户信息类 */
  getUserBehaviorApiService = new GetUserBehaviorApiService();

  /** 本地数据暂存的Map类 */
  public metrics: metricsStore<UserVitals.metricsName>;

  /** 行为追踪记录 */
  public breadcrumbs: BehaviorStore;

  /** 用户自定义事件捕获 */
  public customHandler: Function;

  /** 最大行为追踪记录数 */
  public maxBehaviorRecords: number;

  /** 允许捕获click事件的DOM标签 eg:button div img canvas */
  clickMountList: Array<string>;

  constructor(engineInstance: Engine) {
    this.engineInstance = engineInstance;
    this.metrics = new metricsStore<UserVitals.metricsName>();
    this.maxBehaviorRecords = 100;
    this.breadcrumbs = new BehaviorStore({
      maxBehaviorRecords: this.maxBehaviorRecords,
    });
    this.customHandler = this.initCustomerHandler();
    this.clickMountList = ["button"].map((x) => x.toLowerCase());
    wrHistory();
    this.initPageInfo();
    this.initRouteChange();
    this.initOriginInfo();
    this.initPV();
    this.initClickHandler(this.clickMountList);
    this.initHttpHandler();
  }

  /** 封装用户行为的上报入口 */
  userSendHandler = (data: IMetrics) => {
    this.engineInstance.transportInstance.kernelTransportHandler(
      this.engineInstance.transportInstance.formatTransportData(
        Transport.transportCategory.PV,
        data
      )
    );
  };

  /** 补齐 pathname 和 timestamp 参数 */
  private readonly getExtends = (): {
    page: string;
    timestamp: number | string;
  } => {
    return {
      page: this.getUserBehaviorApiService.getPageInfo().pathname,
      timestamp: new Date().getTime(),
    };
  };

  /** 初始化用户自定义埋点数据的获取上报 */
  initCustomerHandler = (): Function => {
    const handler = (options: UserVitals.ICustomAnalyticsData) => {
      this.metrics.add(UserVitals.metricsName.CDR, options);
      this.userSendHandler(options);
      this.breadcrumbs.push({
        name: UserVitals.metricsName.CDR,
        value: options,
        ...this.getExtends(),
      });
    };

    return handler;
  };

  /** 初始化 PI 页面基本信息的获取以及返回 */
  initPageInfo = (): void => {
    const info: GetUserBehaviorApiService.IPageInformation =
      this.getUserBehaviorApiService.getPageInfo();
    const metrics: IMetrics = info;
    this.metrics.set(UserVitals.metricsName.PI, metrics);
  };

  /** 初始化 RCR 路由跳转的获取以及返回 */
  initRouteChange = (): void => {
    const handler = (e: Event) => {
      const metrics: IMetrics = {
        jumpType: e.type,
        timestamp: new Date().getTime(),
        pageInfo: this.getUserBehaviorApiService.getPageInfo(),
      };
      this.metrics.add(UserVitals.metricsName.RCR, metrics);
      delete metrics.pageInfo;
      const behavior: BehaviorStore.IBehaviorStack = {
        name: UserVitals.metricsName.RCR,
        value: metrics,
        ...this.getExtends(),
      };
      this.breadcrumbs.push(behavior);
    };
    proxyHash(handler);
    proxyHistory(handler);
  };

  /** 初始化 PV 的获取以及返回 */
  initPV = (): void => {
    const handler = () => {
      const metrics: IMetrics = {
        timestamp: new Date().getTime(),
        pageInfo: this.getUserBehaviorApiService.getPageInfo(),
        originInformation: this.getUserBehaviorApiService.getOriginInfo(),
      };
      this.userSendHandler(metrics);
    };
    afterLoad(() => {
      handler();
    });
    proxyHash(handler);
    proxyHistory(handler);
  };

  /** 初始化 OI 用户来路的获取以及返回 */
  initOriginInfo = (): void => {
    const info: GetUserBehaviorApiService.IOriginInformation =
      this.getUserBehaviorApiService.getOriginInfo();
    const metrics: IMetrics = info;
    this.metrics.set(UserVitals.metricsName.OI, metrics);
  };

  /** 初始化 CBR 点击事件的获取和返回 */
  initClickHandler = (mountList: Array<string>): void => {
    const handler = (e: MouseEvent | any) => {
      let target = e.path?.find((x: Element) =>
        mountList.includes(x.tagName?.toLowerCase())
      );
      target =
        target ||
        (mountList.includes(e.target.tagName?.toLowerCase())
          ? e.target
          : undefined);
      if (!target) return;
      const metrics: IMetrics = {
        tagInfo: {
          id: target.id,
          classList: Array.from(target.classList),
          tagName: target.tagName,
          text: target.textContent,
        },
        timestamp: new Date().getTime(),
        pageInfo: this.getUserBehaviorApiService.getPageInfo(),
      };
      this.metrics.add(UserVitals.metricsName.CBR, metrics);
      delete metrics.pageInfo;
      const behavior: BehaviorStore.IBehaviorStack = {
        name: UserVitals.metricsName.CBR,
        value: metrics,
        ...this.getExtends(),
      };
      this.breadcrumbs.push(behavior);
    };
    window.addEventListener(
      "click",
      (e) => {
        handler(e);
      },
      true
    );
  };

  /** 初始化 http 请求的数据获取和上报 */
  initHttpHandler = (): void => {
    const loadHandler = (metrics: IHttpMetrics) => {
      if (metrics.status < 400) {
        delete metrics.response;
        delete metrics.body;
      }
      this.breadcrumbs.push({
        name: UserVitals.metricsName.HT,
        value: metrics,
        ...this.getExtends(),
      });
    };
    proxyXmlHttp(null, loadHandler);
    proxyFetch(null, loadHandler);
  };
}

export namespace UserVitals {
  export enum metricsName {
    /** 页面基本信息 - 记录当前页面的URL、标题、尺寸等基础数据 */
    PI = "page-information",
    /** 用户来源信息 - 记录用户从何处访问当前页面的来源数据 */
    OI = "origin-information",
    /** 路由变化记录 - 追踪单页应用中的路由/页面跳转行为 */
    RCR = "router-change-record",
    /** 点击行为记录 - 捕获用户在页面上的点击交互行为 */
    CBR = "click-behavior-record",
    /** 自定义事件记录 - 开发者手动埋点的自定义行为数据 */
    CDR = "custom-define-record",
    /** HTTP请求记录 - 监控页面发起的网络请求信息 */
    HT = "http-record",
  }
  export interface ICustomAnalyticsData {
    /** 事件类别 互动的对象 eg:Video */
    eventCategory: string;
    /** 事件动作 互动动作方式 eg:play */
    eventAction: string;
    /** 事件标签 对事件进行分类 eg: */
    eventLabel: string;
    /** 事件值 与事件相关的数值 eg:180min */
    eventValue?: string;
  }
}
