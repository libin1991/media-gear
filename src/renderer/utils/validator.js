// 校验用到的工具函数或工具对象
const comm = {
  regex: {
    count (countStr) {
      if (countStr === '*') {
        return '*'
      } else {
        return `{${countStr}}`
      }
    },
    email: {
      whiteLists: [
        'qq.com',
        '163.com',
        'vip.163.com',
        '263.net',
        'yeah.net',
        'sohu.com',
        'sina.cn',
        'sina.com',
        'eyou.com',
        'gmail.com',
        'hotmail.com'
      ]
    },
    number: {
      areaLabelReflex: {
        both: '-?',
        neg: '-',
        pos: ''
      }
    }
  }
}

// 内置的校验器
// TODO 可配置的内置校验器
const validatorNameReflex = {

  /** social media */

  // 用户名
  username ({ min = 4, max = 16 }) {
    return new RegExp(`^[a-zA-Z][a-zA-Z0-9_-]{${min - 1},${max - 1}}$`)
  },
  // 中文用户名
  username_cn ({ min = 2, max = 8 }) {
    return new RegExp(`^[a-zA-Z\\u4E00-\\u9FA5][a-zA-Z0-9\\u4E00-\\u9FA5_-]{${min - 1},${max - 1}}$`)
  },
  // 邮箱
  email () {
    return new RegExp(`^([A-Za-z0-9_\\-\\.])+\\@([A-Za-z0-9_\\-\\.])+\\.([A-Za-z]{2,6})$`)
  },
  // 常用邮箱
  email_general () {
    return new RegExp(`^([A-Za-z0-9_\\-\\.])+\\@(${comm.regex.email.whiteLists.join('|')})$`)
  },
  // 手机号码
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,
  // 身份证
  idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,

  /** general */

  // 整数
  interger ({ area = 'both' }) {
    return new RegExp(`^${comm.regex.number.areaLabelReflex[area]}\\d+$`)
  },
  // 浮点数
  float ({ area = 'both', count = '*' }) {
    return new RegExp(`^${comm.regex.number.areaLabelReflex[area]}\\d*\\.\\d${comm.regex.count(count)}$`)
  },
  // URL
  url: /^((https?|ftp|file):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/
}

/** Valy
 * @description Valy校验器, 可以使用两种方式调用:
 *  1. new Valy('a1111', 'username').result
 *  2. new Valy('a1111').valid(['username', _ => _.length === 5]).check()
 * @param {Any} rawValue 待校验的值
 * @param {Array, Regex, Function} validItems 待校验的选项
 * @param {Boolean} debug 打开调试会时会打开一些log信息
 */
export default class Valy {
  // TODO 构造器也许可以更简洁?
  constructor ({ rawValue, rawValidItems, debug = false }) {
    const argLen = arguments.length
    const arg1 = arguments[0]
    const arg2 = arguments[1]
    if (arg1 instanceof Object) {
      Object.assign(this, {
        pass: false,
        result: null,
        rawValue,
        rawValidItems,
        debug
      })
      this.exec()
    } else if (argLen === 2) {
      Object.assign(this, {
        pass: false,
        result: null,
        rawValue: arg1,
        rawValidItems: arg2,
        debug
      })
      this.exec()
    } else {
      Object.assign(this, {
        pass: false,
        result: null,
        rawValue: arg1,
        rawValidItems,
        debug: false
      })
    }
  }

  toValid (validItems) {
    let toValidResult = 'unexcepted valid result'
    validItems = validItems || this.rawValidItems
    this.debug && console.log(validItems)

    switch (typeof validItems) {
      case 'function':
        this.debug && console.log('valid items type : function')
        const fnResult = validItems(this.rawValue || {})
        if (['function', 'object'].includes(typeof fnResult)) {
          toValidResult = this.toValid(fnResult)
        } else {
          toValidResult = fnResult
        }
        break

      case 'object':
        this.debug && console.log('valid items type : object')
        if (Array.isArray(validItems)) {
          toValidResult = validItems
            .map(x => this.toValid(x))
            .every(x => x === true)
        } else if (validItems instanceof RegExp) {
          toValidResult = validItems.test(this.rawValue)
        } else {
          throw new Error(`unsupported object type validItem : ${validItems}`)
        }
        break

      case 'string':
        this.debug && console.log('valid items type : string')
        const toFindHandle = validItems.split('?')
        const toFindHandleName = toFindHandle[0]
        const handle = validatorNameReflex[toFindHandleName]
        if (!handle) {
          throw new Error(`cant find validItem ${validItems} in validatorNameReflex`)
        }
        toValidResult = this.toValid(handle)
        break

      default:
        throw new Error(`unsupported type of validItem : ${validItems}`)
    }

    // TODO 在某些情况下可能要求抛出异常
    // if (toValidResult !== true) {
    //   throw new Error(toValidResult)
    // }
    // return true
    return toValidResult
  }

  // 主动调用校验
  valid (validItems) {
    if (this.pass) return this
    if (!(this.result = this.toValid(validItems))) {
      this.pass = true
    }
    return this
  }

  // 对值进行格式化
  format (fn = _ => _) {
    this.rawValue = fn(this.rawValue)
    return this
  }

  // 返回校验结果
  exec () {
    this.result = this.toValid()
    // console.log(this.result)
    return this.result
  }

  // 返回判断检验结果是否为某一特定的值
  check (assertResult = true) {
    return this.result === assertResult
  }
}

// TODO test case
// console.log(
//   new Valy('a1111', 'username').result, // true
//   new Valy('a1111').valid('email').valid('username').valid('username').valid('username').check(), // false
//   new Valy('a1111').valid(['username', _ => _.length === 5]).check() // true
// )
