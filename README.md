基于D3.js和npm框架的杜甫诗歌数据可视化分析

1. 运行方式：在终端通过npm install命令安装npm框架，再输入npm start运行。
2. 项目数据：json数据文件均在D3/src/data文件夹下，来源于搜韵网；D3文件夹下有杜甫诗歌全集txt以及爬取意象的python脚本。
3. 主代码结构：
src/
├── index.html          # 主页面入口
├── style.css           # 全局样式（CSS）
├── main.js             # 应用主逻辑
├── bar-chart.js        # 条形图（ECharts）
├── genre-3d-pie.js     # 3D饼图（D3-force+D3-cloud）
├── word-cloud-chart.js # 气泡词云（诗歌意象）
├── travel-map-chart.js # 行迹地图（ECharts）
└── data/
