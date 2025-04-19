/**
 * @file behavior store
 * @author yuzhongyuan
 */

import { UserVitals } from ".";

export class BehaviorStore {
  /** 用户行为堆栈stack */
  private stack: Array<BehaviorStore.IBehaviorStack>;

  // 记录的最大数量
  private maxBehaviorRecords: number;

  // 外部传入 options 初始化，
  constructor(options: BehaviorStore.IBehaviorRecordsOptions) {
    const { maxBehaviorRecords } = options;
    this.maxBehaviorRecords = maxBehaviorRecords;
    this.stack = [];
  }

  // 从底部插入一个元素，且不超过 maxBehaviorRecords 限制数量
  push(value: BehaviorStore.IBehaviorStack) {
    if (this.length() === this.maxBehaviorRecords) {
      this.shift();
    }
    this.stack.push(value);
  }

  // 从顶部删除一个元素，返回删除的元素
  shift() {
    return this.stack.shift();
  }

  length() {
    return this.stack.length;
  }

  get() {
    return this.stack;
  }

  clear() {
    this.stack = [];
  }
}

export namespace BehaviorStore {
  export interface IBehaviorRecordsOptions {
    maxBehaviorRecords: number;
  }

  export interface IBehaviorStack {
    name: UserVitals.metricsName;
    page: string;
    timestamp: number | string;
    value: Object;
  }
}
