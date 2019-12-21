import TranslateManager from '../lib/index';
import staticTranslateData from './staticTranslateData';
window.language = window.language || 'cn';

const translateManager = new TranslateManager({
  // 缓存对应的key名
  storageKey: 'translateManagerDemo',

  // 静态数据
  staticTranslateData,

  // 动态数据，通过接口返回
  requestFn: () => {
    // 模拟耗时1S的接口
    return new Promise((resolve) => {
      let data;

      if (window.language === 'en') {
        data = {
          namespace1: {
            title: 'Hello world'
          }
        };
      } else {
        data = {
          namespace1: {
            title: '你好世界'
          }
        }
      }

      setTimeout(() => {
        resolve(data)
      }, 1000);
    })
  }
})

export default translateManager;