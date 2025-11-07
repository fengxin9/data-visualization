import data from './data.js';
import { EuropeData } from './EuropeData.js';
import { drawRing } from './drawRing.js';
import { initLegend } from './legend.js';
import { drawStack } from './drawStack.js';

const apps = ['哔哩哔哩', '小红书', '知乎'];
const week = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

initLegend();   //初始化图例

// 将原始数据转换成 drawRing 函数需要的格式
function prepApp(appName) {
  return week.map((day, dIdx) => {
    const dayObj = data[dIdx].apps.find(a => a.appName === appName);   // 从data里找到对应天数和App数据
    return {
      app: appName,
      day,
      minutes: Array.from({length:24}, (_,h) => (dayObj?.hourlyUsage[h] || 0) / 60)
    };        // 24小时各时段使用分钟数，将24小时秒数 ÷60 转为分钟，缺失时段补 0
  });
}

// 绘制图表，一张图一个 App
apps.forEach(app => drawRing(app, prepApp(app), '#rings-box'));

drawStack(EuropeData);           // 插入 #area-Europe