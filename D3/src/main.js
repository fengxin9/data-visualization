// main.js 主文件

class DuFuVisualization {
    constructor() {
        this.data = {};
        this.historicalEvents = this.getHistoricalEvents();
        
        // 图表实例
        this.barChart = null;
        this.pieChart = null;
        this.wordCloudChart = null;
        this.travelMapChart = null;
        
        this.init();
    }

    animateStats() {        // 动画数字效果
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const current = parseInt(stat.textContent);
            
            // 如果已经显示最终值，跳过动画
            if (current === target) return;
            
            this.animateNumber(stat, 0, target, 1500);
        });
    }
    
    animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    
    // 添加动画开始时的类
    element.classList.add('animating');
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // 缓动函数
        const easedProgress = this.easeOutQuad(progress);
        let currentValue = Math.floor(start + (end - start) * easedProgress);
        
        // 行迹地点最后显示"50+"
        if (element.parentElement.querySelector('.stat-label').textContent === '行迹地点') {
            element.textContent = currentValue === end ? end + '+' : currentValue;
        } else {
            element.textContent = currentValue.toLocaleString();
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            // 动画结束后移除动画类
            setTimeout(() => {
                element.classList.remove('animating');
            }, 300);
        }
    };
    
    window.requestAnimationFrame(step);
}
    
    easeOutQuad(t) {
        return t * (2 - t);
    }

getHistoricalEvents() {        // 条形图：重要历史事件
    return {
        "736": {
            event: "漫游齐赵时期",
            style: "豪放洒脱，意气风发",
            description: "青年壮游，作品充满建功立业的豪情壮志"
        },
        "745": {
            event: "与李白相遇洛阳",
            style: "浪漫飘逸，清新俊逸", 
            description: "与李白结下深厚友谊，诗风相互影响"
        },
        "751": {
            event: "献《三大礼赋》待制集贤院",
            style: "典雅庄重，辞藻华丽",
            description: "希望通过献赋获得朝廷重用"
        },
        "755": {
            event: "安史之乱爆发",
            style: "沉痛悲怆，忧国忧民",
            description: "目睹国家由盛转衰，创作大量反映战乱的诗篇"
        },
        "757": {
            event: "被困长安，冒险出逃",
            style: "悲愤交加，忠君爱国",
            description: "亲身经历战乱苦难，作品更具现实深度"
        },
        "759": {
            event: "弃官携家逃难入蜀",
            style: "漂泊感伤，人生无常", 
            description: "生活困顿，开始长期的漂泊生涯"
        },
        "760": {
            event: "成都草堂定居",
            style: "闲适自然，清新淡雅",
            description: "生活相对安定，创作许多描写自然景物的诗篇"
        },
        "765": {
            event: "严武去世，离开成都",
            style: "苍凉悲壮，前途渺茫",
            description: "失去好友和依靠，再度踏上漂泊之路"
        },
        "768": {
            event: "出峡东下，漂泊荆湘",
            style: "暮年沧桑，感慨万千",
            description: "年老多病，仍心系国家命运"
        },
        "770": {
            event: "客死湘江舟中",
            style: "凄婉哀痛，遗恨千古",
            description: "一代诗圣在漂泊中结束了他忧国忧民的一生"
        }
    };
}
    async init() {        // 初始化应用，单一页面
        await this.loadData();
        this.renderAllContent();
    }

    async loadData() {
        try {         // 加载所有数据
            const [genres, worksByYear, locations, imagery] = await Promise.all([
                this.fetchData('/api/genres'),
                this.fetchData('/api/works-by-year'),
                this.fetchData('/api/locations'),
                this.fetchData('/api/imagery')
            ]);
            
        this.data = { genres, worksByYear, locations, imagery };
        } catch (error) {
            console.error('数据加载失败:', error);
        }
    }

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    // 渲染所有内容
    renderAllContent() {
        this.renderIntro();
        this.renderWorksChart();
        this.renderGenresPie();
        this.renderWordCloud();
        this.renderTravelMap();
    }

   renderIntro() {
    const introHTML = `
        <div class="intro-header">
            
            <div class="intro-text">
                <h3>杜甫（712年－770年）</h3>
                <p>杜甫（712－770），字子美，自号少陵野老，世称“杜工部”、“杜少陵”等，汉族，河南府巩县（今河南省巩义市）人，
                唐代伟大的现实主义诗人，杜甫被世人尊为“诗圣”，其诗被称为“诗史”。杜甫与李白合称“李杜”，为了跟另外两位诗人李商隐与杜牧即“小李杜”区别开来，
                杜甫与李白又合称“大李杜”。他忧国忧民，人格高尚，他的约1400余首诗被保留了下来，诗艺精湛，在中国古典诗歌中备受推崇，影响深远。
                759-766年间曾居成都，后世有杜甫草堂纪念。</p>
            </div>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" data-target="1456">0</div>
                <div class="stat-label">现存作品</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" data-target="59">0</div>
                <div class="stat-label">创作年限</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" data-target="12">0</div>
                <div class="stat-label">文体类型</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" data-target="50+">0</div>
                <div class="stat-label">行迹地点</div>
            </div>
        </div>
        <div class="intro-details">
            <h4>创作特点</h4>
            <p>杜诗风格，基本上是“沉郁顿挫”，语言和篇章结构又富于变化，讲求炼字炼句。
            同时，其诗兼备众体，除五古、七古、五律、七律外，还写了不少排律，拗体。艺术手法也多种多样，是唐诗思想艺术的集大成者。
            杜甫还继承了汉魏乐府“感于哀乐，缘事而发”的精神，摆脱乐府古题的束缚，创作了不少“即事名篇，无复依傍”的新题乐府，如著名的“三吏”、“三别”等。</p>
        </div>
    `;

    document.getElementById('dufu-intro').innerHTML = introHTML;
    
    // 渲染完成后启动数字动画
    setTimeout(() => {
        this.animateStats();
    }, 500);
}

    renderWorksChart() {
        const data = this.data.worksByYear;
        
        // 清理旧的图表
        if (this.barChart) {
            this.barChart.dispose();
        }
        
        // 创建新的条形图
        this.barChart = new BarChart('works-bar-chart', data, this.historicalEvents);
        this.barChart.render();
    }

// 3D饼图
renderGenresPie() {
    const data = this.data.genres;
    
    // 清空容器并设置尺寸
    const container = document.getElementById('genres-pie-chart');
    container.innerHTML = '';
    
    // 转换数据格式
    const echartsData = data.map(item => ({
        name: item.genre,
        value: parseInt(item.count) || 0
    }));

    // 创建3D饼图
    this.genresPieChart = create3DPieChart('genres-pie-chart', echartsData, '杜甫诗歌文体分布');
}

// 词云图
renderWordCloud() {
        const imageryData = this.data.imagery;
        
        // 清理旧的图表
        if (this.wordCloudChart) {
            this.wordCloudChart.dispose();
        }
        
        // 创建词云图
        this.wordCloudChart = new WordCloudChart('word-cloud-chart');
        this.wordCloudChart.setData(imageryData);
        this.wordCloudChart.render();
    }

// 行迹地图
renderTravelMap() {
    const data = this.data.locations;
    
    // 清理旧的图表
    if (this.travelMapChart) {
        this.travelMapChart.dispose();
    }
    
    // 创建行迹地图
    this.travelMapChart = new TravelMapChart(
        'travel-map-visualization',
        'location-stats'
    );
    this.travelMapChart.setData(data);
    this.travelMapChart.render();
}

showTooltip(event, text) {
        d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .html(text);
    }

hideTooltip() {
        d3.selectAll('.tooltip').remove();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new DuFuVisualization();
});