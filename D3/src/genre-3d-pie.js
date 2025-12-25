// genre-3d-pie.js，3D饼图

function create3DPieChart(containerId, data, title) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // 清空容器
    container.innerHTML = '';
    
    // 初始化图表
    const chart = echarts.init(container);
    
    // 配色
    const colorPalette = [
        '#840808ff', '#ce5a07ff', '#DAA520', '#eba657ff',
        '#f4e10cff', '#F0E68C', '#9ACD32', '#32CD32', 
        '#2E8B57', '#8b4513', '#d2691e', '#cd853f'
    ];
    
    // 计算总作品数
    const total = data.reduce((sum, item) => sum + (parseInt(item.value) || 0), 0);
    
    const option = {
        title: {
            text: title || '文体分布',
            left: 'center',
            top: 10,
            textStyle: {
                color: '#8b4513', 
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: "'SimSun', 'STKaiti', serif"
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                const percent = ((params.value / total) * 100).toFixed(1);
                return `
                    <div style="text-align: left; font-family: 'SimSun', 'STKaiti', serif;">
                        <strong style="color: #8b4513;">${params.name}</strong><br>
                        <span>作品数量: ${params.value}首</span><br>
                        <span>占比: ${percent}%</span>
                    </div>
                `;
            },
            backgroundColor: 'rgba(255, 250, 240, 0.95)', 
            borderColor: '#cd853f', 
            borderWidth: 1,
            textStyle: {
                color: '#333',
                fontSize: 12,
                fontFamily: "'SimSun', 'STKaiti', serif"
            },
            extraCssText: 'box-shadow: 0 4px 15px rgba(139, 69, 19, 0.1);'
        },
        legend: {
            orient: 'horizontal',  // 水平方向
            bottom: 10,           
            left: 'center',       
            itemGap: 15,          
            itemWidth: 15,        // 图例标记宽度
            itemHeight: 15,       // 图例标记高度
            textStyle: {
                color: '#5c4003ff',
                fontSize: 14,    
                fontFamily: "'SimSun', 'STKaiti', serif"
            },
            formatter: function(name) {
                const item = data.find(d => d.name === name);
                if (!item) return name;
                const percent = ((item.value / total) * 100).toFixed(1);
                return `${name}: ${item.value}首`;
            }
        },
        series: [
            {
                name: '文体分布',
                type: 'pie',
                radius: ['35%', '70%'], // 空心圆环
                center: ['50%', '45%'], 
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 8, 
                    borderColor: '#fff',
                    borderWidth: 2,
                    // 3D阴影效果
                    shadowBlur: 8,
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                // 3D立体效果
                emphasis: {
                    itemStyle: {
                        shadowBlur: 15,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        borderWidth: 3,
                        borderColor: '#fff'
                    },
                    label: {
                        show: true,
                        fontWeight: 'bold',
                        fontSize: 14,
                        color: '#8b4513',
                        fontFamily: "'SimSun', 'STKaiti', serif"
                    }
                },
                label: {
                    show: false, // 默认不显示标签
                    position: 'center',
                    formatter: '{b}\n{c} ({d}%)',
                    fontSize: 12,
                    fontWeight: 'bold',
                    fontFamily: "'SimSun', 'STKaiti', serif",
                    color: '#333'
                },
                labelLine: {
                    show: false // 不显示连接线
                },
                data: data.map((item, index) => ({
                    name: item.name,
                    value: item.value,
                    itemStyle: {
                        color: colorPalette[index % colorPalette.length]
                    }
                })),
                // 动画效果
                animationType: 'scale',
                animationEasing: 'cubicOut',
                animationDuration: 1000,
                animationDelay: function(idx) {
                    return idx * 100;
                }
            }
        ],
        grid: {
            top: '15%',
            bottom: '25%',  
            left: '10%',
            right: '10%'
        },
        backgroundColor: 'transparent'
    };

    chart.setOption(option);
    
    // 响应式调整
    window.addEventListener('resize', function() {
        chart.resize();
    });

    return chart;
}

// 清理事件监听器
if (typeof window !== 'undefined') {
    window.dispose3DPieChart = function(chart) {
        if (chart && chart._resizeHandler) {
            window.removeEventListener('resize', chart._resizeHandler);
        }
        if (chart && chart.dispose) {
            chart.dispose();
        }
    };
}

// 导出函数供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = create3DPieChart;
}