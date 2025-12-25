import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 运行本项目需要node.js环境，如果项目文件夹下没有node_modules文件夹，请先运行npm install安装依赖包。
// 输入npm start启动服务器，然后在浏览器中打开http://localhost:3010访问。

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3010;   // 默认端口

// 静态文件服务
app.use(express.static(path.join(__dirname, 'src')));

// 读取JSON文件的辅助函数
function readJSON(filePath) {
    try {
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`文件不存在: ${filePath}`);
        }
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // 检查文件内容是否为空
        if (!fileContent.trim()) {
            throw new Error(`文件为空: ${filePath}`);
        }
        
        const data = JSON.parse(fileContent);
        return data;
    } catch (error) {
        console.error(`读取JSON文件失败: ${filePath}`, error);
        throw error;
    }
}

// API路由
app.get('/api/genres', (req, res) => {      // 读取genres.json, 制作文体饼图
    try {
        const data = readJSON(path.join(__dirname, 'src/data/genres.json'));
        res.json(data);
    } catch (error) {
        console.error('文体数据API错误:', error);
        res.status(500).json({ 
            error: '读取文体数据失败', 
            details: error.message,
            path: path.join(__dirname, 'src/data/genres.json')
        });
    }
});

app.get('/api/works-by-year', (req, res) => {       // 读取works-by-year.json，制作年份作品柱状图
    try {
        const data = readJSON(path.join(__dirname, 'src/data/works-by-year.json'));
        res.json(data);
    } catch (error) {
        console.error('年份数据API错误:', error);
        res.status(500).json({ 
            error: '读取年份数据失败', 
            details: error.message,
            path: path.join(__dirname, 'src/data/works-by-year.json')
        });
    }
});

app.get('/api/locations', (req, res) => {           // 读取locations.json，制作行迹地图
    try {
        const data = readJSON(path.join(__dirname, 'src/data/locations.json'));
        res.json(data);
    } catch (error) {
        console.error('地点数据API错误:', error);
        res.status(500).json({ 
            error: '读取地点数据失败', 
            details: error.message,
            path: path.join(__dirname, 'src/data/locations.json')
        });
    }
});

app.get('/api/imagery', (req, res) => {        // 读取imagery.json，制作意象词云
    try {
        const data = readJSON(path.join(__dirname, 'src/data/imagery.json'));
        res.json(data);
    } catch (error) {
        console.error('意象数据API错误:', error);
        res.status(500).json({ 
            error: '读取意象数据失败', 
            details: error.message,
            path: path.join(__dirname, 'src/data/imagery.json')
        });
    }
});


// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`本地运行地址： http://localhost:${PORT}`);
    console.log(`项目根目录: ${__dirname}`);
    
    // 检查数据文件是否存在
    const dataFiles = [
        'src/data/genres.json',
        'src/data/works-by-year.json', 
        'src/data/locations.json',
        'src/data/imagery.json'
    ];
    
    dataFiles.forEach(file => {
        const fullPath = path.join(__dirname, file);
        if (fs.existsSync(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
            } catch (e) {
                console.log(`  无法读取文件: ${e.message}`);
            }
        } else {
            console.log(`数据文件缺失: ${file}`);
        }
    });
});
