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
    /**
     * 获取国际化数据的接口
     * @param {Object} headers 请求参数
     */
    getRequestData(language: string): any;
    setRequestFn(fn: Function): void;
    /**
     * 判断是否需要更新国际化。通常在使用缓存后判断
     * @param {*} language
     */
    isNeedUpdate(language: string): Promise<Boolean>;
    /**
     * 设置缓存
     * @param {String} language
     */
    setCache(language: string, data: object): void;
    /**
     * 获取前端的静态国际化数据
     * @param {String} language 语种
     */
    getFETranslateData(language: string): object;
    /**
     * 获取后端的静态国际化数据
     */
    getBETranslateData(language: string): any;
    /**
     * 获取前后端交集后的国际化数据
     * @param {*} language
     */
    getMixTranslateData(language: string): any;
    /**
     * 主方法
     */
    update(locale: string, handler: Function): any;
}
export {};
