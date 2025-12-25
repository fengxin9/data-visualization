// charts/bubble-chart.js
// 动态气泡图，泡泡如果不动了就刷新一下

class WordCloudChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.chart = null;
        this.words = [];
        this.poems = [];
        this.bubbles = [];
        this.animationId = null;
        this.simulation = null;
        this.currentSelected = null;
        this.selectedPoems = [];
        
        // 颜色方案
        this.colorScheme = d3.scaleOrdinal()
            .domain(['自然景观', '植物', '动物', '建筑场所', '时间季节', '情感象征', '器物', '人物', '身体'])
            .range(['#723205ff', '#556B2F', '#DAA520', '#CD853F',
                 '#2c4a2cff', '#840808ff', '#8b4513', '#8D6E63', '#BC8F8F']);
        
    // 气泡基础参数
    this.minRadius = 12;  // 最小半径
    this.maxRadius = 45;  // 最大半径
    this.centerForce = 0.1;  // 中心力
    this.collisionForce = 1;  // 碰撞力
    this.chargeForce = -30;  // 排斥力
    this.speed = 0.1;
    }

    setData(imageryData) {
        if (!imageryData || !imageryData.poems) {
            this.words = [];
            this.poems = [];
            return;
        }

        this.poems = imageryData.poems;
        const wordData = {};
        
        imageryData.poems.forEach(poem => {
            if (poem.imagery && Array.isArray(poem.imagery)) {
                poem.imagery.forEach(imagery => {
                    const word = imagery.word;
                    const category = imagery.category;
                    const count = imagery.count || 1;
                    
                    if (!wordData[word]) {
                        wordData[word] = {
                            word: word,
                            frequency: 0,
                            categories: new Set(),
                            totalCount: 0,
                            poems: []
                        };
                    }
                    
                    wordData[word].frequency += 1;
                    wordData[word].categories.add(category);
                    wordData[word].totalCount += count;
                    wordData[word].poems.push({
                        title: poem.title,
                        content: poem.content
                    });
                });
            }
        });

    // 按出现频率排序，只取前50个
    const sortedWords = Object.values(wordData)
        .sort((a, b) => b.totalCount - a.totalCount)  // 按总出现次数排序
        .slice(0, 50);  // 只取前50个

    // 转换为需要的数据格式
    this.words = sortedWords.map(item => ({
        text: item.word,
        frequency: item.frequency,
        totalCount: item.totalCount,
        categories: Array.from(item.categories),
        poems: item.poems,
        radius: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0
    }));
    }

    render() {
        const container = document.getElementById(this.containerId);
        // 清空容器
        container.innerHTML = '';
        
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;
        
    // 创建SVG容器
    const svg = d3.select(`#${this.containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'transparent');
    
    // 添加标题 - 和饼图一样的样式
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', '#8b4513')
        .style('font-family', "'SimSun', 'STKaiti', serif")
        .text('常用意象');
             
        
        // 计算气泡大小
        const maxCount = d3.max(this.words, d => d.totalCount);
        const minCount = d3.min(this.words, d => d.totalCount);
        const radiusScale = d3.scaleLinear()
            .domain([minCount, maxCount])
            .range([this.minRadius, this.maxRadius]);
        
        this.words.forEach(word => {
            word.radius = radiusScale(word.totalCount);
        });
        
        // 创建力导向图
        this.createForceSimulation(svg, width, height);
        
        // 渲染气泡
        this.renderBubbles(svg);
        
        // 添加图例
        this.addLegend(svg, width);
        
        // 开始动画
        this.startAnimation();
        
        this.chart = { svg, width, height };
    }

    createForceSimulation(svg, width, height) {
        this.simulation = d3.forceSimulation(this.words)
        .force('center', d3.forceCenter(width * 0.45, height / 2).strength(0.2)) // 中心力
        .force('charge', d3.forceManyBody().strength(-20)) // 排斥力
        .force('collision', d3.forceCollide().radius(d => d.radius + 3).strength(0.8))
        .force('x', d3.forceX(width / 2 + 50).strength(0.02))
        .force('y', d3.forceY(height / 2 - 120).strength(0.02))
        .alphaDecay(0)          // 无衰减
        .velocityDecay(0.2)     // 适中的速度衰减
        .alpha(0.5);            // 中等能量
    }

    renderBubbles(svg) {
        // 创建气泡组
    const bubbleGroup = svg.append('g')
        .attr('class', 'bubbles');
    
    // 创建气泡
    this.bubbles = bubbleGroup.selectAll('.bubble')
        .data(this.words)
        .enter()
        .append('g')
        .attr('class', 'bubble')
        .style('cursor', 'pointer')
        .on('click', (event, d) => this.handleBubbleClick(event, d))
        // 添加hover事件
        .on('mouseover', (event, d) => this.handleBubbleMouseover(event, d))
        .on('mouseout', (event, d) => this.handleBubbleMouseout(event, d))
        .on('mousemove', (event) => this.handleBubbleMousemove(event));
    
    // 添加圆形
    this.bubbles.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => this.getBubbleColor(d))
        .attr('stroke', 'none')  // 初始状态无边框
        .style('opacity', 0.8)
        .style('filter', 'url(#shadow)');
    
    // 添加文字
    this.bubbles.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-family', '"STKaiti", "KaiTi", "华文楷体", "楷体", serif')
        .style('font-weight', 'normal')  
        .style('font-size', d => Math.max(14, Math.min(24, d.radius * 0.7)))  // 根据半径调整字体大小
        .style('fill', '#fff')
        .style('pointer-events', 'none')
        .style('user-select', 'none')
        .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.7)')  // 加强阴影
        .style('paint-order', 'stroke')  // 优化文字渲染
        .text(d => d.text);
    
        
        // 创建阴影滤镜
        const defs = svg.append('defs');
        const filter = defs.append('filter')
            .attr('id', 'shadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        
        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 3);
        filter.append('feOffset')
            .attr('dx', 1)
            .attr('dy', 1);
        filter.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', 0.3);
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');
    }

    getBubbleColor(word) {
        const mainCategory = word.categories[0];
        let color = this.colorScheme(mainCategory);
        
        // 添加渐变效果
        return d3.color(color).brighter(0.5);
    }

    startAnimation() {
        const updateBubbles = () => {
            this.bubbles
                .attr('transform', d => `translate(${d.x}, ${d.y})`);
        };
        
        this.simulation.on('tick', updateBubbles);
        
        // 添加轻微随机运动
        setInterval(() => {
            this.words.forEach(word => {
                if (this.currentSelected !== word.text) {
                    word.vx += (Math.random() - 0.5) * this.speed;
                    word.vy += (Math.random() - 0.5) * this.speed;
                    this.simulation.alpha(0.5).restart();
                }
            });
        }, 5000);
    }

    // 在BubbleChart类中添加hover处理方法
handleBubbleMouseover(event, d) {
    // 高亮当前气泡
    d3.select(event.currentTarget)
        .select('circle')
        .transition()
        .duration(200)
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 2)
        .style('filter', 'brightness(1.1) drop-shadow(0 6px 10px rgba(0,0,0,0.2))');
    
    // tooltip
    const categoriesText = d.categories.join('、');
    const tooltipContent = `
        <div style="text-align: left; font-family: Arial, sans-serif;">
            <strong style="font-size: 14px; color: #2c3e50;">${d.text}</strong><br>
            <hr style="margin: 5px 0; border: none; border-top: 1px solid #eee;">
            <strong>分类:</strong> ${categoriesText}<br>
            <strong>出现次数:</strong> ${d.totalCount}次<br>
            <strong>涉及诗篇:</strong> ${d.frequency}首<br>
            <em style="color: #7f8c8d; font-size: 11px;">点击查看详细诗词</em>
        </div>
    `;

    d3.select('body')
        .append('div')
        .attr('class', 'bubble-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(255, 255, 255, 0.95)')
        .style('color', '#333')
        .style('padding', '12px')
        .style('border-radius', '8px')
        .style('border', '1px solid #ddd')
        .style('font-size', '12px')
        .style('font-family', 'Arial, sans-serif')
        .style('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.15)')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('max-width', '220px')
        .style('backdrop-filter', 'blur(5px)')
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 15) + 'px')
        .html(tooltipContent);
}

handleBubbleMouseout(event, d) {
    // 恢复气泡样式
    d3.select(event.currentTarget)
        .select('circle')
        .transition()
        .duration(200)
        .attr('stroke', 'none')  // 恢复初始状态无边框
        .style('filter', 'url(#shadow)');
    
    // 移除tooltip
    d3.selectAll('.bubble-tooltip').remove();
}

handleBubbleMousemove(event) {
    d3.selectAll('.bubble-tooltip')
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 15) + 'px');
}

    handleBubbleClick(event, clickedWord) {
        event.stopPropagation();
        
        // 如果已经选中，则取消选择
        if (this.currentSelected === clickedWord.text) {
            this.cancelSelection();
            return;
        }
        
        // 保存当前选中
        this.currentSelected = clickedWord.text;
        this.selectedPoems = clickedWord.poems;
        
        // 高亮选中气泡
        this.highlightSelectedBubble(clickedWord);
        
        // 放大显示诗词列表
        this.showPoemsList(clickedWord);
        
        // 点击外部取消
        setTimeout(() => {
            document.addEventListener('click', this.handleDocumentClick.bind(this), { once: true });
        }, 100);
    }

    highlightSelectedBubble(selectedWord) {
        this.bubbles.select('circle')
            .transition()
            .duration(500)
            .style('opacity', d => d.text === selectedWord.text ? 1 : 0.3);
        
        this.bubbles.selectAll('text')
            .transition()
            .duration(500)
            .style('opacity', d => d.text === selectedWord.text ? 1 : 0.3);
        
        // 放大选中气泡
        d3.select(event.currentTarget)
            .select('circle')
            .transition()
            .duration(500)
            .attr('r', selectedWord.radius * 1.2);
    }

    showPoemsList(selectedWord) {
    const svg = this.chart.svg;
    const width = this.chart.width;
    const height = this.chart.height;
    
    // 移除详情面板
    svg.selectAll('.poems-panel').remove();
    
    // 创建详情面板背景
    const panel = svg.append('g')
        .attr('class', 'poems-panel');
    
    // 背景矩形 
    panel.append('rect')
        .attr('x', 50)
        .attr('y', 100)
        .attr('width', width - 100)
        .attr('height', height - 150)
        .attr('rx', 10)
        .attr('ry', 10)
        .style('fill', 'rgba(255, 250, 240, 0.95)') 
        .style('stroke', '#8B4513') // 深棕色边框
        .style('stroke-width', 2)
        .style('filter', 'url(#shadow)');
    
    // 标题
    panel.append('text')
        .attr('x', width / 2)
        .attr('y', 130)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#723205ff') // 深红色
        .style('font-family', ' "SimSun", serif')
        .text(`"${selectedWord.text}" 相关诗词 (${selectedWord.poems.length}首)`);
    
    // 关闭按钮 
    const closeBtn = panel.append('g')
        .attr('class', 'close-btn')
        .attr('transform', `translate(${width - 80}, 115)`)
        .style('cursor', 'pointer')
        .on('click', (event) => {
            event.stopPropagation();
            this.cancelSelection();
        });
    
    closeBtn.append('circle')
        .attr('r', 12)
        .style('fill', '#8B4513'); 
    
    closeBtn.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#FFFAF0') 
        .text('×');
    
    // 创建诗词列表容器
    const poemsContainer = panel.append('foreignObject')
        .attr('x', 70)
        .attr('y', 150)
        .attr('width', width - 140)
        .attr('height', height - 240);
    
    const poemsDiv = poemsContainer
        .append('xhtml:div')
        .style('width', '100%')
        .style('height', '100%')
        .style('overflow-y', 'auto')
        .style('font-family', '"SimSun", serif')
        .style('background', 'transparent');
    
    // 添加诗词列表 
    selectedWord.poems.forEach((poem, index) => {
        const poemDiv = poemsDiv.append('div')
            .style('margin-bottom', '20px')
            .style('padding', '15px')
            .style('background', index % 2 === 0 ? 'rgba(139, 69, 19, 0.05)' : 'rgba(205, 133, 63, 0.05)') // 浅棕色渐变
            .style('border-radius', '5px')
            .style('border-left', `4px solid ${this.getBubbleColor(selectedWord)}`);
        
        poemDiv.append('div')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('color', '#723205ff') 
            .style('margin-bottom', '8px')
            .text(poem.title);
        
        poemDiv.append('div')
            .style('font-size', '14px')
            .style('color', '#5c4003ff') 
            .style('line-height', '1.6')
            .text(poem.content.split('\n').slice(0, 3).join(' ') + '...');
        
        poemDiv.append('div')
            .style('font-size', '12px')
            .style('color', '#8B7355') 
            .style('margin-top', '8px')
            .style('text-align', 'right')
            .style('font-style', 'italic')
            .text('点击查看完整诗词');
        
        // 点击查看完整诗词
        poemDiv.style('cursor', 'pointer')
            .on('click', (e) => {
                e.stopPropagation();
                this.showFullPoem(poem);
            });
    });
}

showFullPoem(poem) {
    const svg = this.chart.svg;
    const width = this.chart.width;
    const height = this.chart.height;
    
    // 移除已存在的详情面板
    svg.selectAll('.full-poem-panel').remove();
    
    // 创建全诗面板
    const fullPanel = svg.append('g')
        .attr('class', 'full-poem-panel');
    
    fullPanel.append('rect')
        .attr('x', 50)
        .attr('y', 100)
        .attr('width', width - 100)
        .attr('height', height - 150)
        .attr('rx', 10)
        .attr('ry', 10)
        .style('fill', 'rgba(255, 250, 240, 0.98)')
        .style('stroke', '#8B4513')
        .style('stroke-width', 2)
        .style('filter', 'url(#shadow)');
    
    // 关闭按钮
    const closeBtn = fullPanel.append('g')
        .attr('transform', `translate(${width - 80}, 115)`)
        .style('cursor', 'pointer')
        .on('click', (event) => {
            event.stopPropagation();
            fullPanel.remove();
        });
    
    closeBtn.append('circle')
        .attr('r', 12)
        .style('fill', '#723205ff');
    
    closeBtn.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#FFFAF0')
        .text('←');
    
    // 诗词标题
    fullPanel.append('text')
        .attr('x', width /2 - 15)
        .attr('y', 150)
        .attr('text-anchor', 'middle')
        .style('font-size', '22px')
        .style('font-weight', 'bold')
        .style('fill', '#723205ff')
        .style('font-family', '"STKaiti", "SimSun", serif')
        .text(poem.title);
    
    // 诗词内容
    const poemContainer = fullPanel.append('foreignObject')
        .attr('x', 70)
        .attr('y', 170)  
        .attr('width', width - 140)
        .attr('height', height - 240); 
    
    const poemDiv = poemContainer
        .append('xhtml:div')
        .style('width', '100%')
        .style('height', '100%')
        .style('overflow-y', 'auto')  // 垂直滚动
        .style('overflow-x', 'hidden')
        .style('font-family', '"STKaiti", "SimSun", serif')
        .style('padding', '10px 5px')
        .style('line-height', '1.8');  
    
    // 添加诗词内容
    const contentLines = poem.content.split('\n');
    contentLines.forEach(line => {
        poemDiv.append('div')
            .style('text-align', 'center')
            .style('font-size', '18px')
            .style('color', '#5c4003ff')
            .style('margin', '8px 0')
            .style('padding', '2px 0')
            .text(line);
    });
}

    cancelSelection() {
        if (!this.currentSelected) return;
        
        // 恢复所有气泡
        this.bubbles.select('circle')
            .transition()
            .duration(500)
            .style('opacity', 0.9)
            .attr('r', d => d.radius);
        
        this.bubbles.selectAll('text')
            .transition()
            .duration(500)
            .style('opacity', 1);
        
        // 移除详情面板
        this.chart.svg.selectAll('.poems-panel').remove();
        this.chart.svg.selectAll('.full-poem-panel').remove();
        
        this.currentSelected = null;
        this.selectedPoems = [];
    }

    handleDocumentClick(event) {
        if (!event.target.closest('.bubble') && !event.target.closest('.close-btn')) {
            this.cancelSelection();
        }
    }

    addLegend(svg, width) {
    const legendData = Array.from(this.colorScheme.domain());
    const colorMap = {
        '自然景观': '#723205ff',
        '植物': '#556B2F',
        '动物': '#DAA520',
        '建筑场所': '#CD853F',
        '时间季节': '#2c4a2cff',
        '情感象征': '#840808ff',
        '器物': '#8b4513',
        '人物': '#8D6E63',
        '身体': '#BC8F8F'
    };
    
    const containerHeight = svg.attr('height');
    
    // 图例放在图表底部中间位置
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width / 2 - 250}, ${containerHeight - 50})`); // 底部居中
    
    
    // 图例项
    const rows = 2;
    const itemsPerRow = Math.ceil(legendData.length / rows);
    
    // 创建多行图例
    for (let row = 0; row < rows; row++) {
        const rowData = legendData.slice(row * itemsPerRow, (row + 1) * itemsPerRow);
        
        const rowGroup = legend.append('g')
            .attr('transform', `translate(0, ${row * 25})`);
        
        rowGroup.selectAll('.legend-item')
            .data(rowData)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(${i * 100}, 0)`)
            .each(function(d) {
                const g = d3.select(this);
                
                // 颜色标记
                g.append('rect')
                    .attr('x', 0)
                    .attr('y', -8)
                    .attr('width', 15)
                    .attr('height', 15)
                    .attr('rx', 2)
                    .style('fill', colorMap[d])
                    .style('stroke', '#fff')
                    .style('stroke-width', '1px');
                
                // 分类名称
                g.append('text')
                    .attr('x', 18)
                    .attr('y', 3)
                    .style('font-size', '14px')
                    .style('fill', '#333')
                    .style('font-family', '"SimSun", "STKaiti", serif')
                    .style('font-weight', 'normal')
                    .text(d);
            });
    }
}

    resize(width, height) {
        if (this.chart && this.chart.svg) {
            this.chart.svg
                .attr('width', width)
                .attr('height', height);
            
             if (this.simulation) {
                this.simulation.force('center', d3.forceCenter(width * 0.45, height / 2 - 50)); // 上移中心点
                this.simulation.force('y', d3.forceY(height / 2 - 50).strength(0.02)); // 调整Y轴力
                this.simulation.alpha(0.3).restart();
            }
        }
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.simulation) {
            this.simulation.stop();
        }
        if (this.chart && this.chart.svg) {
            this.chart.svg.remove();
            this.chart = null;
        }
        document.removeEventListener('click', this.handleDocumentClick);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordCloudChart;
}

if (typeof window !== 'undefined') {
    window.BubbleChart = WordCloudChart;
}