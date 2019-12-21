/**
 *Created by 夜雪暮歌 on 2018/3/12
 **/
// 操作localStorage相关api
export default {
  age: 0,
  // 初始化时存过期时间
  maxAge(age) {
    // 将传入的天数转为时间戳
    const time = age * 24 * 60 * 60 * 1000
    this.age = time
    return this
  },
  // 存储 顺便存时间戳
  set(name, json, hasExpire) {
    // localStorage.removeItem(name)
    // !Array.isArray(json)
    if (typeof json === 'object') {

      if (hasExpire) {
        // 当前时间戳
        json.__time = new Date().getTime()
        // 初始化的时间戳
        json.__age = this.age
      }
      localStorage.setItem(name, JSON.stringify(json))
    } else if (typeof json === 'string' || typeof  json === 'number') {
      localStorage.setItem(name, json)
    }

    return this
  },

  // 添加
  add(name, data, length) {
    if (typeof data === 'string' || typeof data === 'number') {
      if (typeof data === 'number') {
        data += ''
      }
      const oldValue = this.get(name)
      const oldValueArr = oldValue ? oldValue.split('|') : []
      const oldValueArrL = oldValueArr.length

      if (oldValueArrL === 0) {
        this.set(name, data)
      } else {
        // 超出则删除
        if (oldValueArrL >= length) {
          oldValueArr.pop()
        }

        // 去重
        if (oldValueArr.includes(data)) {
          oldValueArr.splice(oldValueArr.indexOf(data), 1)
        }
        oldValueArr.unshift(data)
        this.set(name, oldValueArr.join('|'))
      }
    }
  },

  get(name) {
    const info = localStorage.getItem(name)
    return info ? info : null
  },

  // 获取信息
  getInfo(name) {
    const info = localStorage.getItem(name)
    return info ? JSON.parse(info) : []
  },

  getJsonData(name) {
    const info = localStorage.getItem(name)
    return info ? JSON.parse(info) : null
  },

  // 判断是否过期
  isExpired(name) {
    let init = localStorage.getItem(name),
      _time = 0,
      iTime = new Date().getTime(),
      timeLength = 0

    if (init) {
      init = JSON.parse(init)
      _time = init.__time
      // 计算时间跨度
      timeLength = iTime - _time
      return timeLength >= init.__age
    } else {
      return true
    }
  },

  // 判断是否进行初始化过，且提供简单回调
  isInit(name, fn) {
    let data = ''
      , age = this.age
    // 如果没过期直接取，过期删除
    if (!this.isExpired(name)) {
      data = JSON.parse(localStorage.getItem(name))
    } else {
      localStorage.removeItem(data)
    }

    if (data) {
      fn && fn(data)
    } else {
      fn && fn()
    }
  },

  // 未过期添加新内容，过期则覆盖之前的内容
  update(name, datakey, newContent) {
    let content = localStorage.getItem(name)
    // 之前的内容
    content = JSON.parse(content)

    if (!this.isExpired(name) && content) {
      content[datakey] = newContent
      this.set(name, JSON.stringify(content))
    } else {
      // content[datakey] = newContent
      // this.set(name, JSON.stringify(content))
    }

  },

  remove(name) {
    localStorage.removeItem(name)
  }
}
