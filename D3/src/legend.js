// 系列1图例js
import * as d3 from 'd3';

const week = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// 颜色比例尺
export const colorScale = d3.scaleSequential(d3.interpolatePlasma)
                            .domain([0, week.length - 1]);

// 初始化图例                           
export function initLegend() {
  if (d3.select('#legend-anchor .global-legend').size()) return;   // 已存在图例则不重复创建

  const box = d3.select('#legend-anchor')  
    .append('div')
    .attr('class', 'global-legend');     // 图例容器
 
  week.forEach((day, i) => {         // 每天一行
    const row = box.append('div').attr('class', 'legend-row');
    row.append('div')
       .attr('class', 'legend-dot')
       .style('background', colorScale(i));
    row.append('span').text(day);
  });
}