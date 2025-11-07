// 环形图js
import * as d3 from 'd3';

export function drawRing(appName, weekData) {    // 绘制环形图，每个APP 7条数据
  const width = 480, height = 480, innerR = 100, maxR = 200;   // 宽，高，内外半径
  const margin = 30;         // 外边距

  const svg = d3.select('#rings-box')       // 创建svg，初始化尺寸
    .append('svg')
    .attr('class', 'ring-svg') 
    .attr('width', width + margin*2)
    .attr('height', height + margin*2)
    .style('margin', '10px');

  const g = svg.append('g')        // 图表容器，居中
    .attr('transform', `translate(${(width+margin*2)/2},${(height+margin*2)/2})`);

  // 标题
  svg.append('text')
    .attr('x', (width+margin*2)/2)
    .attr('y', 20)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .text(appName);

  // 比例尺
  const angle = d3.scaleLinear().domain([0, 24]).range([0, 2 * Math.PI]);
  const angleStep = 2 * Math.PI / 24; // 每段固定角度
  const color = d3.scaleSequential(d3.interpolatePlasma).domain([0, 6]); // 7 天

  // 最外圈细圆环（边框）
  g.append('circle')
  .attr('r', maxR+10)
  .attr('fill', 'none')
  .attr('stroke', '#ccc')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', '20 3'); // 虚线：20像素实线 + 3像素空白

  // 内部同心虚线圈
  for(let i = 0; i < maxR - innerR; i += 60){
    g.append('circle')
  .attr('r', innerR+i)
  .attr('fill', 'none')
  .attr('stroke', '#ccc')
  .attr('stroke-width', 1)
  .attr('stroke-dasharray', '4 3');
  }

  // 刻度文字（24 段）
  const labelR = maxR + 30;
  for (let h = 0; h < 24; h++) {
    const a = angle(h+1);
    const x = Math.sin(a) * labelR;
    const y = -Math.cos(a) * labelR;
    g.append('text')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '14px')
      .text(`${h === 23 ? 0 : h + 1}:00`);
  }

  const baseR = 70;            // 统一内径
  const radiusScale = 2.5;     // 柱高参数
  const arc = d3.arc()
  .innerRadius(d => baseR + (d.minutes-10) *radiusScale) // 扇形内半径
  .outerRadius(d => baseR +  d.minutes *radiusScale) // 扇形外半径
  .startAngle(d => angle(d.hour))
  .endAngle(d => angle(d.hour) + angleStep); // 固定角度宽度

  // 将数据拍扁集合成一条，方便读取
  const flat = weekData.flatMap((d, dIdx) =>
    d.minutes.map((min, h) => ({ app: d.app, day: d.day, hour: h, minutes: min, dayIndex: dIdx }))
  ).filter(d => d.minutes > 0); 

  g.selectAll('path')
  .data(flat)
  .enter()
  .append('path')
  .attr('d', d => arc.innerRadius(baseR).outerRadius(baseR + 0.1)
                  .startAngle(angle(d.hour)).endAngle(angle(d.hour+0.1))(d))    // 初识形状
  .attr('fill', d => color(d.dayIndex))
  .attr('stroke', '#fff')
  .attr('stroke-width', .8)
  .on('mouseover', (e, d) => {
    tooltip.html(`<strong>${d.app}</strong><br/>${d.day} ${d.hour}:00~${d.hour === 23 ? 0 : d.hour + 1}:00<br/>${d.minutes.toFixed(1)} 分`)
      .style('left', (e.pageX + 10) + 'px')
      .style('top', (e.pageY + 10) + 'px')
      .style('opacity', 1);
  })
  .on('mouseout', () => tooltip.style('opacity', 0))
  .transition()                     // 动画过渡，扇子状打开+扇形生长
  .duration(700)                    // 持续时间
  .delay((d, i) => i * 15)          // 依次展开
  .attr('d', d => arc.innerRadius(baseR + (d.minutes - 10) * radiusScale).outerRadius(baseR + d.minutes * radiusScale)
                  .startAngle(angle(d.hour)).endAngle(angle(d.hour) + angleStep)(d));        // 最终效果

  // 统一提示框(hover)
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', '#fff')
    .style('border', '1px solid #999')
    .style('padding', '6px')
    .style('border-radius', '4px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  // 注释
  if (appName === '哔哩哔哩') {
  g.append('text')
    .attr('x', -maxR - 30)                          
    .attr('y', maxR + 60)                  
    .style('font-size', '15px')
    .style('fill', 'rgba(227, 103, 165, 1)')   // 颜色与APP匹配
    .style('font-family', 'SimSun, "宋体", serif') // 宋体
    .style('font-style', 'italic')                // 倾斜
    .text('b站使用频率最高，且中午和晚上为使用高峰');

  // 圆心
  g.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 10)               // 半径
    .attr('fill', 'rgba(228, 150, 189, 1)')     // 与APP颜色相同
    .attr('opacity', 0.8);
}

  if (appName === '小红书') {
  g.append('text')
    .attr('x', -maxR - 30)                          
    .attr('y', maxR + 60)                  
    .style('font-size', '15px')
    .style('fill', 'rgba(225, 32, 32, 1)')
    .style('font-family', 'SimSun, "宋体", serif') 
    .style('font-style', 'italic')              
    .text('小红书使用时间较为均匀，早晚高峰明显');

  // 圆心
  g.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 10)               
    .attr('fill', 'rgba(209, 79, 79, 1)')     
    .attr('opacity', 0.8);
}

  if (appName === '知乎') {
  g.append('text')
    .attr('x', -maxR - 30)                          
    .attr('y', maxR + 60)                  
    .style('font-size', '15px')
    .style('fill', 'rgba(65, 118, 197, 1)')
    .style('font-family', 'SimSun, "宋体", serif') 
    .style('font-style', 'italic')               
    .text('知乎使用时间集中在上午和晚上，夜间使用较多');

  // 圆心
  g.append('circle')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', 10)               
    .attr('fill', 'rgba(94, 137, 201, 1)')     
    .attr('opacity', 0.8);
}
  
}
