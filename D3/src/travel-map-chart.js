// 行迹地图，使用ECharts
class TravelMapChart {
    constructor(mapContainerId, statsContainerId) {
        this.mapContainerId = mapContainerId;
        this.statsContainerId = statsContainerId;
        this.mapInstance = null;
        this.data = [];
        this.locationStats = {};
        this.coordinateMap = this.getCoordinateMap();
        this.topLocationNames = [];
        this.isExpanded = false;
        this.currentView = 'stats'; 
        this.currentLocation = null;
        this.init();
    }

    // 初始化地图组件
    init() {
        // 设置容器样式
        const container = document.getElementById(this.mapContainerId);
        if (container) {
            container.style.height = '600px';
            container.style.width = '100%';
        }
    }

    // 获取城市坐标映射
    getCoordinateMap() {
        return {
            '泰安市': [117.08, 36.20],
            '兖州区': [116.83, 35.55],
            '济宁市': [116.59, 35.42],
            '偃师市': [112.79, 34.73],
            '洛阳市': [112.45, 34.62],
            '开封市': [114.35, 34.79],
            '济南市': [117.00, 36.67],
            '西安市': [108.95, 34.27],
            '咸阳市': [108.72, 34.34],
            '礼泉县': [108.43, 34.48],
            '蒲城县': [109.59, 34.96],
            '白水县': [109.59, 35.18],
            '富县': [109.38, 35.99],
            '凤翔区': [107.39, 34.52],
            '彬县': [108.08, 35.04],
            '玉华宫': [109.00, 35.00], 
            '华县': [109.77, 34.51],
            '蓝田县': [109.32, 34.16],
            '故县镇': [111.22, 34.72], 
            '灵宝市': [110.87, 34.52],
            '户县': [108.61, 34.11],
            '嵩县': [112.09, 34.14],
            '新安县': [112.14, 34.73],
            '陕县': [111.09, 34.76],
            '潼关县': [110.24, 34.54],
            '天水市': [105.73, 34.58],
            '礼县': [105.18, 34.19],
            '西和县': [105.30, 34.01],
            '成县': [105.74, 33.74],
            '略阳县': [106.16, 33.33],
            '广元市': [105.84, 32.44],
            '剑阁县': [105.52, 32.29],
            '德阳市': [104.40, 31.13],
            '成都市': [104.07, 30.67],
            '崇州市': [103.67, 30.63],
            '蓬溪县': [105.71, 30.78],
            '绵阳市': [104.74, 31.48],
            '中江县': [104.68, 31.03],
            '三台县': [105.09, 31.10],
            '射洪县': [105.31, 30.87],
            '广汉市': [104.28, 30.98],
            '盐亭县': [105.39, 31.22],
            '阆中市': [106.00, 31.56],
            '乐山市': [103.77, 29.57],
            '宜宾市': [104.64, 28.75],
            '重庆市': [106.55, 29.57],
            '忠县': [108.04, 30.30],
            '云阳县': [108.90, 30.94],
            '奉节县': [109.53, 31.02],
            '巫山县': [109.88, 31.07],
            '宜昌市': [111.29, 30.69],
            '松滋市': [111.77, 30.18],
            '江陵县': [112.42, 30.04],
            '公安县': [112.23, 30.06],
            '石首市': [112.41, 29.72],
            '岳阳市': [113.13, 29.37],
            '湘阴县': [112.88, 28.68],
            '长沙县': [113.08, 28.25],
            '浏阳市': [113.63, 28.16],
            '湘潭市': [112.94, 27.83],
            '株洲市': [113.13, 27.83],
            '衡阳市': [112.61, 26.89],
            '衡山县': [112.87, 27.23],
            '耒阳市': [112.86, 26.42]
        };
    }

    // 设置数据
    setData(data) {
        this.data = data;
        this.processLocationStats();
    }

    // 处理地点统计数据
    processLocationStats() {
        this.locationStats = {};
        
        this.data.forEach(item => {
            const location = item.location;
            if (!this.locationStats[location]) {
                this.locationStats[location] = {
                    count: 0,
                    genres: new Set(),
                    years: new Set(),
                    works: []
                };
            }
            
            this.locationStats[location].count += parseInt(item.count);
            this.locationStats[location].genres.add(item.genre);
            this.locationStats[location].years.add(item.year);
            this.locationStats[location].works.push({
                year: item.year,
                genre: item.genre,
                count: item.count
            });
        });
        
        this.calculateTopLocations();
    }
    
    // 计算作品数前十的地点的名称
    calculateTopLocations() {
        const topLocations = Object.keys(this.locationStats)
            .map(location => ({
                name: location,
                count: this.locationStats[location].count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // 取前十名
        
        // 存储名称
        this.topLocationNames = topLocations.map(loc => loc.name);
        this.topLocationsData = topLocations; // 保留完整数据用于显示
    }

    // 判断是否显示标签（只显示前十地点）
    shouldShowLabel(locationName) {
        return this.topLocationNames.includes(locationName);
    }

    // 渲染地图
    render() {
        // 检查ECharts是否可用
        if (typeof echarts === 'undefined') {
            console.error('ECharts未加载');
            return;
        }

        const container = document.getElementById(this.mapContainerId);
        if (!container) return;

        // 初始化ECharts实例
        this.mapInstance = echarts.init(container);
        
        // 生成地图数据
        const mapData = this.generateMapData();
        const linesData = this.generateLinesData();
        
        // 配置选项
        const option = {
            backgroundColor: '#FAF0E6',
            tooltip: {
                trigger: 'item',
                formatter: (params) => {
                    if (params.componentType === 'series' && params.seriesType === 'effectScatter') {
                        const location = params.data.name;
                        const stats = this.locationStats[location];
                        return `
                            <div style="font-weight: bold; margin-bottom: 5px; color: #8b4513;">${location}</div>
                            <div>作品数量: <b>${stats.count}</b></div>
                            <div>到访年份: ${Array.from(stats.years).join(', ')}</div>
                            <div>创作文体: ${Array.from(stats.genres).join(', ')}</div>
                        `;
                    }
                    return params.name;
                }
            },
            visualMap: {
                min: 1,
                max: 450,
                left: 'left',
                top: 'bottom',
                text: ['作品数量', ''],
                calculable: true,
                inRange: {
                    color: ['#ff8127ff', '#8B4513']
                },
                textStyle: {
                    color: '#333'
                }
            },
            geo: {
                map: 'china',
                roam: true,
                zoom: 1.2,
                center: [105, 36],
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#fffaf0',
                        borderColor: '#d2b48c',
                        borderWidth: 1
                    },
                    emphasis: {
                        areaColor: '#f0e6d2'
                    }
                }
            },
            series: [
                // 迁徙路线
                {
                    type: 'lines',
                    coordinateSystem: 'geo',
                    zlevel: 2,
                    effect: {
                        show: true,
                        period: 4,
                        trailLength: 0.7,
                        color: '#b18544ff',
                        symbol: 'circle',
                        symbolSize: 3
                    },
                    lineStyle: {
                        normal: {
                            color: '#d2691e',
                            width: 1,
                            opacity: 0.6,
                            curveness: 0.2
                        }
                    },
                    data: linesData
                },
                // 地点散点
                {
                    name: '创作地点',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    zlevel: 3,
                    rippleEffect: {
                        brushType: 'stroke',
                        scale: 4
                    },
                    label: {
                        normal: {
                            show: false, // 由于只要显示地名就会遮挡，所以默认不显示，true则显示前十个地名
                            position: 'right',
                            formatter: (params) => {
                                // 只显示前十地点的名称
                                const locationName = params.data.name;
                                return this.shouldShowLabel(locationName) ? locationName : '';
                            },
                            textStyle: {
                                color: '#5c3a21', 
                                fontSize: 12,
                                fontWeight: 'bold',
                                fontFamily: 'Microsoft YaHei, PingFang SC, sans-serif',
                                textShadowColor: 'rgba(210, 180, 140, 0.5)', 
                                textShadowBlur: 3,
                                textShadowOffsetX: 1,
                                textShadowOffsetY: 1
                            }
                        }
                    },
                    symbolSize: (val) => {
                        return Math.max(8, Math.min(30, Math.sqrt(val[2]) * 2));
                    },
                    itemStyle: {
                        normal: {
                            color: '#8b4513',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    data: mapData,
                    emphasis: {
                        scale: true,
                        label: {
                            show: false    // 悬停时由于已经有tooltip显示信息，这里不显示标签
                        }
                    }
                }
            ]
        };

        // 注册中国地图
        if (!echarts.getMap('china')) {
            echarts.registerMap('china', require('./china.json'));
        }

        this.mapInstance.setOption(option);
        
        // 添加点击事件
        this.mapInstance.on('click', (params) => {
            if (params.componentType === 'series' && params.seriesType === 'effectScatter') {
                this.showLocationDetails(params.data.name);
            }
        });

        // 添加响应式调整
        window.addEventListener('resize', () => {
            if (this.mapInstance) {
                this.mapInstance.resize();
            }
        });
        
        // 初始显示总览统计
        this.renderLocationStats();
    }

    // 生成地图散点数据
    generateMapData() {
        const data = [];
        
        Object.keys(this.locationStats).forEach(location => {
            const stats = this.locationStats[location];
            const coord = this.coordinateMap[location];
            
            if (coord) {
                data.push({
                    name: location,
                    value: [...coord, stats.count],
                    // 添加属性标记，是否应该显示标签
                    showLabel: this.shouldShowLabel(location)
                });
            }
        });
        
        return data;
    }

    // 生成迁徙路线数据
    generateLinesData() {
        // 按年份排序
        const sortedData = this.data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        const lines = [];
        
        // 创建一个数组，包含所有数据点，按年份排序
        // 每个数据点是一个 {location, year} 对象
        const allPoints = [];
        sortedData.forEach(item => {
            allPoints.push({
                location: item.location,
                year: item.year
            });
        });
        
        // 按时间顺序连接相邻的数据点
        for (let i = 1; i < allPoints.length; i++) {
            const prevPoint = allPoints[i - 1];
            const currentPoint = allPoints[i];
            
            const fromLocation = prevPoint.location;
            const toLocation = currentPoint.location;
            
            if (fromLocation !== toLocation && 
                this.coordinateMap[fromLocation] && 
                this.coordinateMap[toLocation]) {
                
                lines.push({
                    fromName: fromLocation + ` (${prevPoint.year})`,
                    toName: toLocation + ` (${currentPoint.year})`,
                    coords: [
                        this.coordinateMap[fromLocation],
                        this.coordinateMap[toLocation]
                    ]
                });
            }
        }
        
        return lines;
    }

    // 显示地点详情
    showLocationDetails(locationName) {
        const stats = this.locationStats[locationName];
        if (!stats) return;
        
        this.currentView = 'details';
        this.currentLocation = locationName;
        
        const detailsHTML = `
            <div class="location-details">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="color: var(--primary-color); margin: 0;">${locationName} - 创作统计</h4>
                    <button id="back-to-stats-btn" class="toggle-btn" style="background-color: #d2691e;">
                        返回排名列表
                    </button>
                </div>
                <div class="stats-card">
                    <div class="stat-item">
                        <span class="stat-label">作品总数:</span>
                        <span class="stat-value">${stats.count}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">到访年份:</span>
                        <span class="stat-value">${Array.from(stats.years).sort().join(', ')}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">创作文体:</span>
                        <span class="stat-value">${Array.from(stats.genres).join(', ')}</span>
                    </div>
                </div>
                <div class="works-list">
                    <h5 style="color: var(--primary-color); margin-top: 20px;">作品统计详情</h5>
                    <table>
                        <thead>
                            <tr>
                                <th>年份</th>
                                <th>文体</th>
                                <th>数量</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.works.map(work => `
                                <tr>
                                    <td>${work.year}</td>
                                    <td>${work.genre}</td>
                                    <td>${work.count}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // 渲染统计信息
        const statsContainer = document.getElementById(this.statsContainerId);
        if (statsContainer) {
            statsContainer.innerHTML = detailsHTML;
            
            // 添加返回按钮点击事件
            const backBtn = document.getElementById('back-to-stats-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    this.backToStats();
                });
            }
        }
    }

    // 添加返回统计页面的方法
    backToStats() {
        this.currentView = 'stats';
        this.currentLocation = null;
        this.renderLocationStats();
    }

    // 渲染地点统计总览
    renderLocationStats() {
    if (this.currentView === 'details' && this.currentLocation) {
        this.showLocationDetails(this.currentLocation);
        return;
    }
    
    // 获取所有地点并按作品数量排序
    const allLocations = Object.keys(this.locationStats)
        .map(location => ({
            name: location,
            count: this.locationStats[location].count
        }))
        .sort((a, b) => b.count - a.count);
    
    // 获取前十地点
    const topLocations = allLocations.slice(0, 10);
    
    // 要显示的地点
    const displayLocations = this.isExpanded ? allLocations : topLocations;
    const totalLocations = allLocations.length;
    
    // 显示地点排名
    const statsHTML = `
        <div class="top-locations">
            <h4 style="color: var(--primary-color);">创作地点排名</h4>
            <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
                点击地图上的地点查看详细统计，或点击下方排名中的地点名称
            </p>
            <div class="location-ranking" style="${this.isExpanded ? 'max-height: 400px; overflow-y: auto;' : ''}">
                ${displayLocations.map((loc, index) => `
                    <div class="rank-item" style="cursor: pointer;" data-location="${loc.name}">
                        <span class="rank-number">${index + 1}</span>
                        <span class="rank-name">${loc.name}</span>
                        <span class="rank-count">${loc.count}</span>
                    </div>
                `).join('')}
            </div>
            
            <div style="margin-top: 15px; text-align: center;">
                <button id="toggle-locations-btn" class="toggle-btn">
                    ${this.isExpanded ? '收起' : `展开所有${totalLocations}个地点`}
                </button>
            </div>
        </div>
    `;

    const statsContainer = document.getElementById(this.statsContainerId);
    if (statsContainer) {
        statsContainer.innerHTML = statsHTML;
        
        // 添加排名项点击事件
        document.querySelectorAll('.rank-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const locationName = e.currentTarget.dataset.location;
                this.showLocationDetails(locationName);
            });
        });
        
        // 添加展开/收起按钮点击事件
        const toggleBtn = document.getElementById('toggle-locations-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.isExpanded = !this.isExpanded;
                this.renderLocationStats();
            });
        }
    }
}

    // 清理资源
    dispose() {
        if (this.mapInstance) {
            this.mapInstance.dispose();
            this.mapInstance = null;
        }
    }
}