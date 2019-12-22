### 简介

在SPA中实现国际化，数据的来源一般有两种：

**静态数据**：写在js中，打包到前端文件里

**动态数据**： 通过后端接口返回

本工具适用于使用动态数据或者同时使用两者用的场景。该工具可以帮你整合数据，并作缓存。在需要国际化切换时，你只需要传入对应的语种。剩下的工作由工具帮你完成。

ps: 当存在缓存时，callback会可能先后执行两次，这是为了更好的用户体验：触发国际化切换直接使用缓存数据更新，此为第一次；第二次则是接口返回后，工具对比缓存发现不一样，再刷新一次。


### Install

npm install TranslateManager -S

### 调用例子

npm run example

### Quick Start

```
const translateManager = new TranslateManager({
    // 选填: 静态国际化数据
    staticLocaleData: {
        en: {
            title: 'hello world'
        },
        zh: {
            title: '你好，世界'
        }
    },
    // 必填：一个返回结果为promise的函数。promise里返回的是从后端获取的国际化数据
    requestFn: () => {
        return axios.get('xxx').then((res) => {
            return res; // 返回国际化数据
        }
    }
})

/**
* 主函数
* lang: 语种
* callback 回调方法
**/
translateManager.update(lang, (res) => {
    // res是可以直接使用的国际化数据，结合自己对应的业务要求编写代码
    // 业务代码...
});
```

constructor

| 参数名 | 是否必填 | 说明 | 默认 |
| :----: | :----: | :----: | :----: |
| requestFn | 是 | 获取动态国际化数据的方法 | - |
| staticTranslateData | 否 | 静态国际化数据 | {} |
| expireTime | 否 | 前端缓存时间 | Infinity |
| storageKey | 否 | 缓存locastorage对应的名字 | LocaleGetter |