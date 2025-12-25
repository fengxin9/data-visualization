# 杜甫诗歌数据可视化分析项目

## 项目概述
基于D3.js和npm框架的杜甫诗歌数据可视化分析平台

## 运行方式
1. 在终端通过 `npm install` 命令安装npm框架
2. 输入 `npm start` 运行项目

## 项目数据
- **数据位置**：json数据文件均在 `D3/src/data` 文件夹下
- **数据来源**：搜韵网
- **附加资源**：
  - `D3` 文件夹下有杜甫诗歌全集txt文件
  - 爬取意象的Python脚本

## 主代码结构
```
src/
├── index.html # 主页面入口
├── style.css # 全局样式（CSS）
├── main.js # 应用主逻辑
├── bar-chart.js # 条形图（ECharts）
├── genre-3d-pie.js # 3D饼图（D3-force+D3-cloud）
├── word-cloud-chart.js # 气泡词云（诗歌意象）
├── travel-map-chart.js # 行迹地图（ECharts）
└── data/
```
