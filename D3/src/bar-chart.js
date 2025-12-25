// bar-chart.js，作品年表条形图

class BarChart {
    constructor(containerId, data, historicalEvents = {}) {
        this.containerId = containerId;
        this.data = data;
        this.historicalEvents = historicalEvents;
        this.chart = null;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return null;

        // 清空容器
        container.innerHTML = '';

        // 转换数据
        const processedData = this.data.map(d => ({
            year: d.year,
            count: parseInt(d.count) || 0
        }));

        // 动态调整宽度
        const barCount = processedData.length;
        const baseWidth = 1000;
        const dynamicWidth = Math.max(baseWidth, barCount * 25);
        
        const margin = { top: 60, right: 40, bottom: 120, left: 80 };
        const width = dynamicWidth - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // 创建SVG
        const svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .style('display', 'block')
            .style('margin', '0 auto')
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // 比例尺
        const xScale = d3.scaleBand()
            .domain(processedData.map(d => d.year))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(processedData, d => d.count)])
            .nice()
            .range([height, 0]);

        // 坐标轴
        const xAxis = svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        xAxis.selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.9em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');

        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale));

        // 创建条形
        svg.selectAll('.bar')
            .data(processedData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale(d.count))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.count))
            .attr('fill', d => d.year === '未知' ? '#888' : '#cd853f')
            .on('mouseover', (event, d) => this.handleBarMouseover(event, d))  // 添加hover事件
            .on('mouseout', (event, d) => this.handleBarMouseout(event, d));

        // 划分竖虚线
        this.addLifePeriods(svg, xScale, width, height);

        // 人生时期注释
        this.addLifePeriodAnnotations(svg, xScale, width, height);

        // 添加标题
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .style('fill', '#8b4513')
            .text('杜甫历年作品数量统计 (736-770年)');

        // 添加图例
        this.addLegend(svg, width);

        // 数量标签
        this.addBarLabels(svg, processedData, xScale, yScale);

        this.chart = svg;
    }

    // 添加人生时期划分竖虚线
    addLifePeriods(svg, xScale, width, height) {
        // 杜甫四个人生时期的分界点
        const lifePeriods = [
            { year: '746', type: 'start' },
            { year: '755', type: 'start' },
            { year: '759', type: 'start' }
        ];
        
        lifePeriods.forEach(period => {
            const xPos = xScale(period.year) + xScale.bandwidth() / 2;
            
            // 竖虚线
            svg.append('line')
                .attr('x1', xPos - xScale.bandwidth() / 2)
                .attr('y1', 20)  
                .attr('x2', xPos - xScale.bandwidth() / 2)
                .attr('y2', height)
                .attr('stroke', '#8b4513')
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '5,5')
                .attr('opacity', 0.5);
        });
    }
    
    // 人生时期注释
    addLifePeriodAnnotations(svg, xScale, width, height) {
        // 人生时期定义和注释
        const periodAnnotations = [
            {
                startYear: '736',
                endYear: '745',
                title: '漫游齐赵时期',
                description: '青年壮游，作品豪迈奔放',
                locations: '主要所在地：齐、赵、洛阳、梁宋'
            },
            {
                startYear: '746', 
                endYear: '754',
                title: '困守长安时期', 
                description: '应试落第，生活困顿',
                locations: '长安、洛阳、偃师'
            },
            {
                startYear: '755',
                endYear: '758', 
                title: '陷贼与为官时期',
                description: '安史之乱，陷贼被俘',
                locations: '长安、凤翔、鄜州'
            },
            {
                startYear: '759',
                endYear: '770',
                title: '漂泊西南时期',
                description: '弃官入蜀，漂泊荆湘',
                locations: '秦州、成都、夔州、潭州'
            }
        ];
        
        const annotationY = height + 45; 
        
        periodAnnotations.forEach((period, index) => {
            const startPos = xScale(period.startYear);
            const endPos = xScale(period.endYear) + xScale.bandwidth();
            const centerX = startPos + (endPos - startPos) / 2;
            
            // 时期标题
            svg.append('text')
                .attr('x', centerX)
                .attr('y', annotationY + 5)
                .attr('text-anchor', 'middle')
                .style('font-size', '15px')
                .style('font-weight', 'bold')
                .style('fill', '#8b4513')
                .style('font-family', "'SimSun', 'STKaiti', serif")
                .style('dominant-baseline', 'middle')
                .text(period.title);
            
            // 时期描述
            svg.append('text')
                .attr('x', centerX)
                .attr('y', annotationY + 30)
                .attr('text-anchor', 'middle')
                .style('font-size', '13px')
                .style('fill', '#5c4003ff')
                .style('font-family', "'SimSun', 'STKaiti', serif")
                .style('dominant-baseline', 'middle')
                .text(period.description);
            
            // 主要所在地
            svg.append('text')
                .attr('x', centerX)
                .attr('y', annotationY + 50)
                .attr('text-anchor', 'middle')
                .style('font-size', '13px')
                .style('fill', '#723205ff')
                .style('font-family', "'SimSun', 'STKaiti', serif")
                .style('dominant-baseline', 'middle')
                .style('font-style', 'italic')
                .text(`${period.locations}`);
        });
    }

    handleBarMouseover(event, d) {     // 鼠标悬停事件
        d3.select(event.target).style('fill', d.year === '未知' ? '#666' : '#8b4513');
        this.showTooltip(event, d);
    }

    handleBarMouseout(event, d) {
        d3.select(event.target).style('fill', d.year === '未知' ? '#888' : '#cd853f');
        this.hideTooltip();
    }

    showTooltip(event, d) {
    const eventInfo = this.historicalEvents[d.year];
    let tooltipContent = `<strong>${d.year}年: ${d.count}首作品</strong>`;
    
    // 获取该年份的地点信息（从mapdata中）
    const locations = this.getLocationsByYear(d.year);
    
    if (locations && locations.length > 0) {
        tooltipContent += `<br><strong>行迹地点:</strong> ${locations.join('、')}`;
    }
    
    if (eventInfo) {
        tooltipContent += `<br><strong>历史事件:</strong> ${eventInfo.event}`;
        tooltipContent += `<br><strong>作品风格:</strong> ${eventInfo.style}`;
        tooltipContent += `<br><strong>关键描述:</strong> ${eventInfo.description}`;
    } else if (d.year !== '未知') {
        const yearNum = parseInt(d.year);
        if (yearNum < 755) {
            tooltipContent += `<br><strong>历史背景:</strong> 盛唐时期，社会相对安定`;
            tooltipContent += `<br><strong>作品风格:</strong> 豪迈奔放，积极进取`;
        } else if (yearNum >= 755 && yearNum < 759) {
            tooltipContent += `<br><strong>历史背景:</strong> 安史之乱初期，社会动荡`;
            tooltipContent += `<br><strong>作品风格:</strong> 忧国忧民，沉郁顿挫`;
        } else {
            tooltipContent += `<br><strong>历史背景:</strong> 漂泊西南时期，生活困顿`;
            tooltipContent += `<br><strong>作品风格:</strong> 苍凉悲慨，深沉内敛`;
        }
    }
    
    d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .html(tooltipContent);
}

getLocationsByYear(year) {
    const yearLocationMap = {
        '736': ['泰安市', '兖州区'],
        '740': ['兖州区', '济宁市'],
        '741': ['偃师市', '洛阳市'],
        '742': ['开封市', '洛阳市'],
        '744': ['洛阳市', '偃师市'],
        '745': ['济南市', '兖州区', '偃师市'],
        '746': ['西安市', '咸阳市'],
        '747': ['西安市'],
        '748': ['偃师市', '西安市'],
        '749': ['西安市', '洛阳市'],
        '750': ['礼泉县', '西安市'],
        '751': ['西安市'],
        '752': ['西安市'],
        '753': ['西安市'],
        '754': ['西安市', '蒲城县'],
        '755': ['西安市', '蒲城县', '白水县'],
        '756': ['西安市', '白水县', '富县'],
        '757': ['西安市', '凤翔区', '彬县', '玉华宫', '富县', '白水县'],
        '758': ['西安市', '华县', '蓝田县', '故县镇', '灵宝市', '户县'],
        '759': ['嵩县', '洛阳市', '新安县', '陕县', '潼关县', '华县', '天水市', '礼县', '西和县', '成县', '略阳县', '广元市', '剑阁县', '德阳市', '成都市'],
        '760': ['成都市'],
        '761': ['成都市', '崇州市', '蓬溪县'],
        '762': ['成都市', '绵阳市', '中江县', '三台县', '射洪县'],
        '763': ['广汉市', '绵阳市', '三台县', '盐亭县', '阆中市'],
        '764': ['阆中市', '成都市'],
        '765': ['成都市', '乐山市', '宜宾市', '重庆市', '忠县', '云阳县'],
        '766': ['云阳县', '奉节县'],
        '767': ['奉节县'],
        '768': ['奉节县', '巫山县', '宜昌市', '松滋市', '江陵县', '公安县', '石首市', '岳阳市'],
        '769': ['江陵县', '岳阳市', '湘阴县', '长沙县', '浏阳市', '湘潭市', '株洲市', '衡阳市'],
        '770': ['长沙县', '衡山县', '耒阳市', '岳阳市']
    };
    
    return yearLocationMap[year] || [];
}
    hideTooltip() {
        d3.selectAll('.tooltip').remove();
    }

    addLegend(svg, width) {      // 添加图例
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 120}, -25)`);

        legend.append('rect')
            .attr('x', 80)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', '#cd853f');

        legend.append('text')
            .attr('x', 100)
            .attr('y', 10)
            .style('font-size', '14px')
            .style('fill', '#333')
            .text('已知年份');

        legend.append('rect')
            .attr('x', 80)
            .attr('y', 20)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', '#888');

        legend.append('text')
            .attr('x', 100)
            .attr('y', 30)
            .style('font-size', '14px')
            .style('fill', '#333')
            .text('未知年份');
    }

    // 添加条形上的数量标签
    addBarLabels(svg, data, xScale, yScale) {
        svg.selectAll('.bar-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'bar-label')
            .attr('x', d => xScale(d.year) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.count) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#333')
            .style('font-weight', 'bold')
            .text(d => d.count > 0 ? d.count : '');
    }

    resize() {            // 重新渲染图表
        if (this.chart) {
            this.render();
        }
    }

    dispose() {
        if (this.chart) {
            this.chart.remove();
            this.chart = null;
        }
        this.hideTooltip();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarChart;
}

if (typeof window !== 'undefined') {
    window.BarChart = BarChart;
}