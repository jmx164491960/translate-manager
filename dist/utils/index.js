/**
 * 判断是否为falsy值/空数组/空对象
 * @param data
 * @returns {boolean}
 */
export function isEmptyResult(data) {
    // Object.keys(data).length === 0
    // 判断假值（除0外）和空数组/对象
    if (!data && data !== 0 && data !== false) {
        return true;
    }
    // 判断时间
    if (data instanceof Date) {
        return false;
    }
    if (Array.isArray(data) && data.length === 0) {
        return true;
    }
    else if (Object.prototype.isPrototypeOf(data) &&
        Object.keys(data).length === 0) {
        return true;
    }
    return false;
}
export function isEqual(d1, d2) {
    return JSON.stringify(d1) === JSON.stringify(d2);
}
export function jsonParse(str) {
    try {
        var res = JSON.parse(str);
        return res;
    }
    catch (e) {
        return null;
    }
}
