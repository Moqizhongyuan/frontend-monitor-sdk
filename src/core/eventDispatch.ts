/* 事件调度器 */
export class EventDispatcher {
  // 监听器集合
  private _listeners: { [key: string]: EventDispatcher.EventListener[] } = {};

  /* 监听事件 */
  addEventListener(type: string, listener: EventDispatcher.EventListener) {
    const listeners = this._listeners;
    if (listeners[type] === undefined) {
      listeners[type] = [];
    }
    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  /* 判断目标对象的某个状态是否被某个监听器监听 */
  hasEventListener(type: string, listener: EventDispatcher.EventListener) {
    const listeners = this._listeners;
    return (
      listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1
    );
  }

  /* 取消事件监听 */
  removeEventListener(type: string, listener: EventDispatcher.EventListener) {
    const listeners = this._listeners;
    const listenerArray = listeners[type];
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener);
      if (index !== -1) {
        listenerArray.splice(index, 1);
      }
    }
  }

  /* 触发事件 */
  dispatchEvent(event: EventDispatcher.CustomEvent) {
    const listeners = this._listeners;
    const listenerArray = listeners[event.type];
    if (listenerArray !== undefined) {
      event.target = this;
      // 复制一份侦听器集合，以防在迭代时删除侦听器。
      const array = [...listenerArray];
      for (let i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event);
      }
      event.target = null;
    }
  }
}

export namespace EventDispatcher {
  /* 事件对象的类型 */
  export interface CustomEvent {
    type: string;
    target?: EventDispatcher | null;
    [attachment: string]: unknown;
  }

  /* 事件监听器的类型 */
  export interface EventListener {
    (event: CustomEvent): void;
  }
}
