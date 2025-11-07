import * as d3 from 'd3';
import { joinExit1, joinExit2, Exist, CurrentEU } from './EuropeData.js';

const years = [1957, 1962, 1973, 1981, 1985, 1986, 1990, 1995, 2004, 2007, 2013, 2019];


export function drawStack(data, selector = '#area-Europe') {
  const stackData = years.map((y, i) => {          // 每个柱子包括三部分：不变、增量、减量
    const obj = { year: y, events: joinExit1[y] || {} };
    ['核心国', '非核心国'].forEach(country => {
      const prev = i === 0 ? 0 : data.find(d => d.country === country)[`area${years[i - 1]}`];
      const curr = data.find(d => d.country === country)[`area${y}`];
      const diff = curr - prev;
      obj[`${country}-不变`] = Math.min(curr, prev);
      obj[`${country}-增量`] = Math.max(0, diff);
      obj[`${country}-减量`] = Math.max(0, -diff);
    });
    return obj;
  }).concat(CurrentEU);

  // 添加柱子
  const keys = [
    '核心国-不变', '核心国-增量', '核心国-减量',
    '非核心国-不变', '非核心国-增量', '非核心国-减量'
  ];
  const stack = d3.stack().keys(keys).offset(d3.stackOffsetDiverging)(stackData);

  // 区域大小
  const margin = { top: 60, right: 30, bottom: 60, left: 60 },
        width = 900 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select(selector)     // 选择容器
              .append('svg')
              .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // 比例尺
  const yMin = d3.min(stack, s => d3.min(s, d => d[0]));
  const yMax = d3.max(stack, s => d3.max(s, d => d[1]));
  const y = d3.scaleLinear()
            .domain([yMin < 0 ? yMin * 1.1 : 0, yMax * 1.1])
            .nice()
            .range([height, 0]);

  const x = d3.scaleBand()
            .domain([...years,2025])
            .range([0, width])
            .paddingInner(0.18);

  // 坐标轴
  g.append('g').attr('class', 'axis')
  .attr('transform', `translate(0,${height})`)
  .call(d3.axisBottom(x).tickFormat(d => `${d}`));

  g.append('g').attr('class', 'axis')
  .call(d3.axisLeft(y).tickSize(-width).tickFormat(d => `${d} 万 km²`))
  .selectAll('.tick line')  
  .attr('stroke-dasharray', '4 2')   // 灰色虚线
  .attr('stroke', '#ccc');        

  // 颜色
  const color = d3.scaleOrdinal()
    .domain(keys)
    .range([
      '#1f4e79', '#1f4e79', '#3b8cbe',   // 核心国：增量和不变为深蓝，减量为浅蓝
      '#ff9f40', '#ff9f40', '#ffbf00'    // 非核心国：增量和不变为橙色，减量为黄色
    ]);

  const layer = g.selectAll('.layer')
               .data(stack)
               .enter()
               .append('g')
               .style('fill', d => color(d.key))
               .each(function () {
                 const type = d3.select(this).datum().key.split('-')[1];
                 d3.select(this).attr('data-type', type);
               });     // 标记增量/减量类型

  layer.selectAll('rect')        // 柱子
       .data(d => d)
       .enter()
       .append('rect')
       .attr('class', 'stack-bar')
       .attr('x', d => x(d.data.year))
       .attr('y', height)
       .attr('width', x.bandwidth())
       .attr('height', 0)
       .attr('stroke', function () {
         const type = d3.select(this.parentNode).attr('data-type');
         return (type === '增量' || type === '减量') ? '#333' : 'none';
       })
       .attr('stroke-dasharray', function () {
         const type = d3.select(this.parentNode).attr('data-type');
         return (type === '增量' || type === '减量') ? '4 2' : 'none';
       })
       .transition().duration(800).delay((d, i) => i * 20)
       .attr('y', d => y(d[1]))
       .attr('height', d => y(d[0]) - y(d[1]));

 // 总面积（柱子最顶端标记）
const totalText = g.selectAll('.total-area')
  .data(stackData)
  .enter()
  .append('text')
  .attr('class', 'total-area')
  .attr('x', d => x(d.year) + x.bandwidth() / 2)
  .attr('y', d => y(d['核心国-不变'] + d['核心国-增量'] + d['核心国-减量'] + d['非核心国-不变'] + d['非核心国-增量'] + d['非核心国-减量']) - 10)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')   // 防止被裁切
  .style('font-size', '12px')
  .style('fill', '#333')
  .style('font-style', 'italic')   // 斜体
  .style('fill', '#0e1991ff')        // 颜色
  .text(d => {
    const positiveTop = d['核心国-不变'] + d['核心国-增量'] + d['非核心国-不变'] + d['非核心国-增量'];    // 只计算正值部分
    return positiveTop.toFixed(0);
  });

// 悬浮框
const tip = d3.select('.tooltip');

// 当前成员国清单
function listMembers(year) {
  const exist = Exist[year];
  if (!exist) return '';
  return `<br/>现存成员国：${exist.exist.join('、')}`;
}

layer.selectAll('rect')           
  .on('mouseover', function (ev, d) {
    const [country, type] = d3.select(this.parentNode).datum().key.split('-');
    const area = d[1] - d[0];
    const year = d.data.year;             // 悬浮框显示

    // 核心国：joinExit1，非核心国：joinExit2
    const evt = country === '核心国' ? joinExit1[year] || {} : joinExit2[year] || {};
    let evtText = '';
    if (evt.join) {
      evtText += `<br/>加入：${evt.join.join('、')}`;
    }
    if (evt.exit) {
      evtText += `<br/>${evt.exit.join('、')}`;
    }

    if (type === '不变') {                  // 不变层：显示面积+成员国
      tip.html(`<b>${country} ${year} 年</b><br/>面积：${area.toFixed(0)} 万 km²${listMembers(year)}`)
         .style('left', (ev.pageX + 10) + 'px')
         .style('top', (ev.pageY - 28) + 'px')
         .style('opacity', 1);
    } else {                               // 增量/减量层：数字+事件
      const changeText = type === '增量' ? `↑ ${area.toFixed(0)}` :
                         type === '减量' ? `↓ ${area.toFixed(0)}` :
                         `${area.toFixed(0)}`;
      tip.html(`<b>${country} ${year} 年</b><br/>${changeText} 万 km²${evtText}`)
         .style('left', (ev.pageX + 10) + 'px')
         .style('top', (ev.pageY - 28) + 'px')
         .style('opacity', 1);
    }
  })
  .on('mouseout', () => tip.style('opacity', 0));


// 垂直虚线 + 标注坐标
const euTextX = x.bandwidth() / 2 + (x(1995) + x(1990))/2;   // 1990 与 1995 之间居中
const euTextY =  - 20;   // 图表上方

// 垂直虚线
g.append('line')
  .attr('class', 'eu-line')
  .attr('x1', euTextX)
  .attr('x2', euTextX)
  .attr('y1', y(0))                       // 轴顶
  .attr('y2', euTextY + 10)               // 标注下方 10px
  .attr('stroke', '#999')
  .attr('stroke-dasharray', '6 3')
  .attr('stroke-width', 1.5);

// 标注文字
g.append('text')
  .attr('class', 'eu-label')
  .attr('x', euTextX)
  .attr('y', euTextY)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .style('font-size', '13px')
  .style('font-style', 'italic')
  .style('fill', '#686565ff')
  .text('1993年欧盟正式成立');

  g.append('text')                        // 标注文字
  .attr('x', x(1957)+x.bandwidth()/2)
  .attr('y', 308)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .style('font-size', '11px')
  .style('fill', '#4d5d8aff')
  .text('罗马条约');

  g.append('text')
  .attr('x', x(2019)+x.bandwidth()/2)
  .attr('y', 308)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .style('font-size', '11px')
  .style('fill', '#4d5d8aff')
  .text('英国脱欧');

  g.append('text')
  .attr('x', x(2025)+x.bandwidth()/2)
  .attr('y', 308)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .style('font-size', '11px')
  .style('fill', '#4d5d8aff')
  .text('现存27个成员国');

  g.append('text')                        // 底部注释
  .attr('x', 100)
  .attr('y', 330)
  .style('font-size', '10px')
  .style('font-style', 'italic')
  .style('fill', '#664242ff')
  .text('*欧盟(前身为EEC) 1957-2019年成员国变动与占地面积变化，图中数据均为近似值，鼠标悬停在各柱上可查看具体数值与事件。');


// 图例
const legend = d3.select('#legend2-anchor')   
  .append('div')
  .attr('class', 'stack-legend')
  .style('margin', '10px auto 20px')          // 放在系列2标题下方，居中
  .style('text-align', 'center');             // 图例居中

// 图例颜色
const legendKeys = [
  { name: '核心国',  color: '#1f4e79' },
  { name: '核心国-缩减',  color: '#3b8cbe' },
  { name: '非核心国',color: '#ff9f40' },
  { name: '非核心国-缩减',color: '#ffbf00' }
];

legend.selectAll('.legend-row')
  .data(legendKeys)
  .enter()
  .append('div')
  .attr('class', 'legend-row')
  .style('display', 'inline-flex')
  .style('align-items', 'center')
  .style('margin', '4px 8px')
  .each(function (d) {
    const row = d3.select(this);
    row.append('span')                       // 小圆点
      .style('width', '12px')
      .style('height', '12px')
      .style('border-radius', '50%')
      .style('background', d.color)
      .style('margin-right', '6px');
    row.append('span')
      .text(d.name.replace('-', ' '))
      .style('font-size', '12px');
  });

  // 右上角EU小地图, 在线显示
const euIcon = svg.append('image')
  .attr('x', width - 20)
  .attr('y', 10)
  .attr('width', 120)
  .attr('height', 80)
  .attr('opacity', 0.5);   // 半透明

try {
  euIcon.attr('xlink:href', 'https://upload.wikimedia.org/wikipedia/commons/f/fb/European_union_map_2005-06-02.png');   // 本地路径
} catch (e) {               
  euIcon.attr('opacity', 0);  // 离线或错误时自动变为透明
}
}

// 柱形图中，核心国缩小的面积用青色并用虚线框出，增大的面积用深蓝色并用虚线框出，其余面积为深蓝色；
// 非核心国缩小的面积用黄色并用虚线框出，增大的面积用橙色并用虚线框出，其余面积为橙色。
// 背景的欧盟地图放在了右上角，半透明，完整显示并避免遮挡。

