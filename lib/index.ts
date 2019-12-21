import Storage from './utils/localStorage';
/**
 * 判断是否为falsy值/空数组/空对象
 * @param data
 * @returns {boolean}
 */
function isEmptyResult(data: any): Boolean {
  // Object.keys(data).length === 0
  // 判断假值（除0外）和空数组/对象
  if (!data && data !== 0 && data !== false) {
    return true
  }

  // 判断时间
  if (data instanceof Date) {
    return false
  }

  if (Array.isArray(data) && data.length === 0) {
    return true
  } else if (Object.prototype.isPrototypeOf(data) && Object.keys(data).length === 0) {
    return true
  }

  return false
}
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
    this.staticTranslateData = params.staticTranslateData;
  }
  /**
   * 获取国际化数据的接口
   * @param {Object} headers 请求参数 
   */
  getRequestData(language: string) {
    if (!this.requestFn) {
      console.error('请先执行setRequestFn!');
      return Promise.reject();
    }
    return this.requestFn({language}).then((res: object) => {
      this.setCache(language, res);
      return res;
    });
  }
  setRequestFn(fn: Function) {
    this.requestFn = fn;
  }
  /**
   * 判断是否需要更新国际化。通常在使用缓存后判断
   * @param {*} language 
   */
  isNeedUpdate(language: string): Promise<Boolean> {
    const storageData = Storage.getJsonData(this.STORAGE_KEY) || {};
    const cacheData = storageData[language];
    return this.getRequestData(language).then((res: object) => {
      if (JSON.stringify(res) === JSON.stringify(cacheData)) {
        // console.log('不需要更新', res, cacheData);
        return false;
      } else {
        // console.log('需要更新');
        return true;
      }
    });
  }
  /**
   * 设置缓存
   * @param {String} language 
   */
  setCache(language: string, data: object) {
    // 请求完成后缓存
    const storageData = Storage.getJsonData(this.STORAGE_KEY) || {};
    storageData[language] = data;
    storageData['time'] = new Date().getTime();
    Storage.set(this.STORAGE_KEY, storageData);
  } 
  /**
   * 获取前端的静态国际化数据
   * @param {String} language 语种
   */
  getFETranslateData(language: string): object {
    if (!language) {
      return this.staticTranslateData;
    } else {
      return this.staticTranslateData[language];
    }
  }
  /**
   * 获取后端的静态国际化数据
   */
  getBETranslateData(language: string) {
    const storageData = Storage.getJsonData(this.STORAGE_KEY);
    // 有缓存就读取缓存
    if (storageData && storageData['time'] && storageData[language]) {
      const time = storageData['time'];
      const now = new Date().getTime();
      // 缓存只有两小时
      if (now - time <= this.expireTime) {
        if (storageData[language]) storageData[language]['isCache'] = true; // 打上是否使用缓存的标志
        return Promise.resolve(storageData[language]);
      }
    }
    return this.getRequestData(language);
  }
  /**
   * 获取前后端交集后的国际化数据
   * @param {*} language 
   */
  getMixTranslateData(language: string) {
    // 没缓存就发起请求
    return this.getBETranslateData(language).then((res: any) => {

      const data = this.staticTranslateData[language];
      if (!data) {
        return Promise.reject();
      }
      // 部分国际化写在了前端，把前端的国际化文件合并到后端返回的数据中
      Object.keys(data).forEach((key) => {
        res.data[key] = Object.assign({}, data[key], res.data[key]);
      });
      return res;
    })
  }
  /**
   * 主方法
   */
  update(locale: string, handler: Function) {
    return this.getMixTranslateData(locale)
    .then((res: translateDataRes) => {
      if (!isEmptyResult(res.data)) {
        
        // 国际化初始化
        handler(res);
        // 是否使用缓存
        if (res.isCache) {
          this.isNeedUpdate(locale).then((needUpdate: Boolean) => {
            if (!needUpdate) {
              return;
            }
            this.getMixTranslateData(locale).then((res: translateDataRes) => {
              // 缓存更新进行中
              if (!isEmptyResult(res.data)) {
                handler(res);
              }
            });
          });
        }
      } else {
        return Promise.reject(new Error('locale empty !!'))
      }
    })
  }
}