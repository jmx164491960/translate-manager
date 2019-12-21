import {
  isEmptyResult,
  jsonParse,
  isEqual
} from './utils';

/**
 * 返回的结果
 */
interface translateDataRes {
  isCache: Boolean,
  data: object
}

/**
 * 构造函数入参
 */
interface constructorParams {
  requestFn: Function,
  staticTranslateData: object,
  storageKey?: string,
  expireTime?: number
}

/**
 * 从前端缓存里获取国际化
 */
export default class TranslateManager {
  STORAGE_KEY: string
  expireTime: number
  requestFn: Function | null
  staticTranslateData: object
  
  /**
   * 构造函数
   * @param params 
   */
  constructor(params: constructorParams) {
    this.expireTime = params.expireTime || Infinity; // 前端缓存有效时间
    this.STORAGE_KEY = params.storageKey || 'TranslateManager';
    this.requestFn = params.requestFn;
    this.staticTranslateData = params.staticTranslateData || {};
  }
  setRequestFn(fn: Function) {
    this.requestFn = fn;
  }
  /**
   * 设置缓存
   * @param {String} language 
   */
  setCache(language: string, data: object) {
    // 请求完成后缓存
    const storageData = jsonParse(localStorage.getItem(this.STORAGE_KEY)) || {};
    storageData[language] = data;
    storageData['time'] = new Date().getTime();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData));
  }
  /**
   * 从缓存中读取
   * @param language 语种
   */
  getCache(language: string) {
    const storageData = jsonParse(localStorage.getItem(this.STORAGE_KEY)) || {};
    if (storageData && storageData['time'] && storageData[language]) {
      const time = storageData['time'];
      const now = new Date().getTime();
      // 缓存只有两小时
      if (now - time <= this.expireTime) {
        if (storageData[language]) storageData[language]['isCache'] = true; // 打上是否使用缓存的标志
        return storageData[language];
      }
    }
    return null;
  }
  /**
   * 获取后端的静态国际化数据
   */
  getDynamicTranslateData(language: string) {
    if (!this.requestFn) {
      console.error('请先执行setRequestFn!');
      return Promise.reject();
    }
    return this.requestFn({language}).then((res: object) => {
      this.setCache(language, res);
      return res;
    });
  }
  /**
   * 获取前后端交集后的国际化数据
   * @param {*} language 
   */
  getMergeTranslateData(language: string) {
    // 没缓存就发起请求
    return this.getDynamicTranslateData(language).then((res: any) => {

      const data = this.staticTranslateData[language] || {};
      // 部分国际化写在了前端，把前端的国际化文件合并到后端返回的数据中
      Object.keys(data).forEach((key) => {
        res.data[key] = Object.assign({}, data[key], res.data[key]);
      });
      if (isEmptyResult(res.data)) {
        return Promise.reject(new Error('locale empty !!'))
      }
      return res;
    })
  }
  /**
   * 主方法
   * @param locale 语种
   * @param callback 回调函数，用于订制自己触发的渲染逻辑
   */
  update(locale: string, callback: Function) {
    let data = this.staticTranslateData[locale];
    const cacheData = this.getCache(locale);
    data = Object.assign({}, data, cacheData);

    // 使用静态数据和缓存数据的并集，触发第一次视图更新
    callback({data}, 'first');

    // 返回静态和动态数据的合集
    return this.getMergeTranslateData(locale).then((res: translateDataRes) => {
      // 获取数据是否和动态数据不一致
      if (res.data && !isEqual(res.data, cacheData)) {
        callback(res, 'second')
      }
    })
  }
}