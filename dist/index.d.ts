/**
 * 构造函数入参
 */
interface constructorParams {
    requestFn: Function;
    staticTranslateData: object;
    storageKey?: string;
    expireTime?: number;
}
/**
 * 从前端缓存里获取国际化
 */
export default class TranslateManager {
    STORAGE_KEY: string;
    expireTime: number;
    requestFn: Function | null;
    staticTranslateData: object;
    /**
     * 构造函数
     * @param params
     */
    constructor(params: constructorParams);
    setRequestFn(fn: Function): void;
    /**
     * 设置缓存
     * @param {String} language
     */
    setCache(language: string, data: object): void;
    /**
     * 从缓存中读取
     * @param language 语种
     */
    getCache(language: string): any;
    /**
     * 获取后端的静态国际化数据
     */
    getDynamicTranslateData(language: string): any;
    /**
     * 获取前后端交集后的国际化数据
     * @param {*} language
     */
    getMergeTranslateData(language: string): any;
    /**
     * 深度合并
     * @param d1
     * @param d2
     */
    /**
     * 主方法
     * @param locale 语种
     * @param callback 回调函数，用于订制自己触发的渲染逻辑
     */
    update(locale: string, callback: Function): any;
}
export {};
