/** 一个非常简单的响应式状态管理 本意用来实现小程序中模板对全局对象中某个属性的订阅 */

import Store from './store'
import Dep from './dep'

class VX {
  constructor () {
    this.store = Store.createStore()
  }
  watch (key, fn, obj = this.store) {
    Dep.watcher.hook = fn
    console.log(obj[key])
    Dep.watcher.hook = null
  }
  set (key, val, obj = this.store) {
    if (typeof val === 'object' && !(val instanceof Array)) {
      Object.entries(val).map(entry => {
        const [k, v] = entry
        this.set(k, v, val)
      })
    }
    if (!this.store[key]) {
      const dep = new Dep()
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: () => {
          dep.collect()
          return val
        },
        set: (newVal) => {
          if (newVal === val) {
            return
          }
          dep.notify(newVal, val)
          val = newVal
        }
      })
    }
  }
}

export default VX