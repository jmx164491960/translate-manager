import { isEmptyResult, jsonParse, isEqual } from './utils';
import merge from 'lodash/merge';
/**
 * 从前端缓存里获取国际化
 */
var TranslateManager = /** @class */ (function () {
    /**
     * 构造函数
     * @param params
     */
    function TranslateManager(params) {
        this.expireTime = params.expireTime || Infinity; // 前端缓存有效时间
        this.STORAGE_KEY = params.storageKey || 'TranslateManager';
        this.requestFn = params.requestFn;
        this.staticTranslateData = params.staticTranslateData || {};
    }
    TranslateManager.prototype.setRequestFn = function (fn) {
        this.requestFn = fn;
    };
    /**
     * 设置缓存
     * @param {String} language
     */
    TranslateManager.prototype.setCache = function (language, data) {
        // 请求完成后缓存
        var storageData = jsonParse(localStorage.getItem(this.STORAGE_KEY)) || {};
        storageData[language] = data;
        storageData['time'] = new Date().getTime();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData));
    };
    /**
     * 从缓存中读取
     * @param language 语种
     */
    TranslateManager.prototype.getCache = function (language) {
        var storageData = jsonParse(localStorage.getItem(this.STORAGE_KEY)) || {};
        if (storageData && storageData['time'] && storageData[language]) {
            var time = storageData['time'];
            var now = new Date().getTime();
            // 缓存只有两小时
            if (now - time <= this.expireTime) {
                return storageData[language] || null;
            }
        }
        return null;
    };
    /**
     * 获取后端的静态国际化数据
     */
    TranslateManager.prototype.getDynamicTranslateData = function (language) {
        var _this = this;
        if (!this.requestFn) {
            console.error('请先执行setRequestFn!');
            return Promise.reject();
        }
        return this.requestFn({ language: language }).then(function (res) {
            _this.setCache(language, res);
            return res;
        });
    };
    /**
     * 获取前后端交集后的国际化数据
     * @param {*} language
     */
    TranslateManager.prototype.getMergeTranslateData = function (language) {
        var _this = this;
        // 没缓存就发起请求
        return this.getDynamicTranslateData(language).then(function (res) {
            var data = _this.staticTranslateData[language] || {};
            // 部分国际化写在了前端，把前端的国际化文件合并到后端返回的数据中
            merge(res, data);
            if (isEmptyResult(res)) {
                return Promise.reject(new Error('locale empty !!'));
            }
            return res;
        });
    };
    /**
     * 深度合并
     * @param d1
     * @param d2
     */
    // deepMerge(d1, d2) {
    //   let res = {};
    //   Object.keys(d1).forEach((key) => {
    //     res[key] = Object.assign({}, d1[key], d2[key]);
    //   });
    //   return res;
    // }
    /**
     * 主方法
     * @param locale 语种
     * @param callback 回调函数，用于订制自己触发的渲染逻辑
     */
    TranslateManager.prototype.update = function (locale, callback) {
        var staticData = this.staticTranslateData[locale];
        var cacheData = this.getCache(locale) || {};
        // 使用静态数据和缓存数据的并集，触发第一次视图更新
        merge(cacheData, staticData);
        callback(cacheData, 'first');
        // 返回静态和动态数据的合集
        return this.getMergeTranslateData(locale).then(function (res) {
            // 获取数据是否和动态数据不一致
            if (res && !isEqual(res, cacheData)) {
                callback(res, 'second');
            }
        });
    };
    return TranslateManager;
}());
export default TranslateManager;
