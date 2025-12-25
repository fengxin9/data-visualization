import json
import re
import time
from collections import Counter
import os

def load_poems_from_txt(file_path):
    """
    从TXT文件加载杜甫诗歌 - 改进版，专门处理标题无标点的格式
    """
    poems = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 分割行并处理
        lines = content.strip().split('\n')
        
        current_poem = {
            'title': '',
            'content': '',
            'lines': []
        }
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            # 判断是否为标题（根据你提供的格式）
            # 标题规则：无标点符号，且下一行有标点符号（诗的内容）
            is_title = False
            if i < len(lines) - 1:
                next_line = lines[i+1].strip()
                # 当前行无标点，下一行有标点 -> 当前行是标题
                if (not re.search(r'[，。？！；：]', line) and 
                    re.search(r'[，。？！；：]', next_line)):
                    is_title = True
            
            # 如果是标题行，且当前已经有诗歌内容，保存前一首诗
            if is_title and current_poem['lines']:
                # 处理上一首诗
                if current_poem['title']:
                    poem_data = process_poem(current_poem)
                    if poem_data:
                        poems.append(poem_data)
                
                # 开始新诗
                current_poem = {
                    'title': line,
                    'content': '',
                    'lines': []
                }
            # 如果是第一首诗或特殊情况的标题
            elif is_title and not current_poem['lines']:
                current_poem['title'] = line
            # 否则是诗歌内容行
            elif line:
                current_poem['lines'].append(line)
        
        # 处理最后一首诗
        if current_poem['lines']:
            poem_data = process_poem(current_poem)
            if poem_data:
                poems.append(poem_data)
        
        print(f"成功提取 {len(poems)} 首诗")
        
    except Exception as e:
        print(f"读取文件时出错: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return poems

def process_poem(poem_dict):
    """
    处理单首诗歌数据
    """
    if not poem_dict['lines']:
        return None
    
    # 如果标题为空，使用第一行内容的一部分作为标题
    if not poem_dict['title']:
        first_line = poem_dict['lines'][0]
        poem_dict['title'] = first_line[:10] + "..." if len(first_line) > 10 else first_line
    
    # 组合诗歌内容
    content = '\n'.join(poem_dict['lines'])
    
    # 清理内容中的数字标记（如果有）
    content = re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩]', '', content)
    
    # 提取意象
    imagery = extract_imagery(content)
    
    poem_data = {
        'title': poem_dict['title'],
        'content': content,
        'imagery': imagery,
        'dynasty': '唐代',
        'author': '杜甫'
    }
    
    print(f"提取诗歌: {poem_dict['title']} (行数: {len(poem_dict['lines'])}, 意象数: {len(imagery)})")
    
    return poem_data

def extract_imagery(content):
    """
    从诗歌内容中提取意象（单字意象优先）
    """
    # 扩展的意象词汇库 - 单字在前
    imagery_keywords = {
        '自然景观': ['山', '水', '江', '河', '湖', '海', '云', '雨', '风', '雪', '月', '日', '星', '天', '地', 
                   '峰', '岭', '川', '溪', '泉', '波', '浪', '雾', '露', '霜', '霞', '虹', '雷', '电'],
        '植物': ['花', '草', '树', '木', '林', '竹', '松', '梅', '兰', '菊', '柳', '桃', '李', '杏', '荷', 
                '莲', '桂', '枫', '桑', '槐', '杨', '柏', '榕', '蕉', '芦', '茅'],
        '动物': ['鸟', '兽', '鱼', '虫', '龙', '凤', '鹤', '雁', '鹰', '雀', '燕', '莺', '鹊', '鸦', '鸡', 
                '犬', '马', '牛', '羊', '虎', '鹿', '猿', '蝉', '蝶', '蜂', '蚕', '萤'],
        '建筑场所': ['楼', '台', '亭', '阁', '宫', '殿', '寺', '庙', '庵', '观', '宅', '院', '园', '庭', 
                   '城', '郭', '门', '窗', '桥', '路', '舟', '船', '车', '驿'],
        '时间季节': ['春', '夏', '秋', '冬', '晨', '昏', '昼', '夜', '朝', '夕', '时', '节', '岁', '年'],
        '情感象征': ['愁', '忧', '思', '念', '悲', '欢', '离', '合', '梦', '魂', '心', '泪', '酒', '歌', '笑'],
        '器物': ['剑', '刀', '弓', '箭', '琴', '瑟', '棋', '书', '画', '笔', '墨', '纸', '砚', '灯', '烛'],
        '人物': ['君', '臣', '民', '客', '僧', '道', '仙', '佛'],
        '身体': ['头', '发', '眉', '眼', '耳', '鼻', '口', '手', '足', '心', '骨', '血', '魂']
    }
    
    # 双字意象库（作为补充）
    double_char_imagery = {
        '自然景观': ['江天', '天涯', '云霄', '乾坤', '江湖', '烟波', '风云'],
        '植物': ['芙蓉', '梧桐', '杨柳', '松柏', '梅花', '菊花', '桃花'],
        '动物': ['鸿雁', '沙鸥', '黄鹂', '白鹭', '蝴蝶', '蜻蜓', '蟋蟀'],
        '建筑场所': ['长安', '洛阳', '宫殿', '楼台', '亭台', '城门', '江楼'],
        '时间季节': ['重阳', '清明', '寒食', '元日', '春秋', '朝夕', '岁月'],
        '情感象征': ['寂寞', '相思', '惆怅', '凄凉', '感慨', '伤悲', '欢乐']
    }
    
    imagery = []
    content_chars = list(content)
    
    # 优先提取单字意象
    for category, keywords in imagery_keywords.items():
        for keyword in keywords:
            # 单字直接统计出现次数
            count = content.count(keyword)
            if count > 0:
                imagery.append({
                    'word': keyword,
                    'category': category,
                    'count': count,
                    'type': 'single_char'
                })
    
    # 补充双字意象（避免重复计数）
    for category, keywords in double_char_imagery.items():
        for keyword in keywords:
            # 使用正则确保完整匹配
            pattern = re.escape(keyword)
            matches = re.findall(pattern, content)
            count = len(matches)
            if count > 0:
                # 检查是否与单字意象冲突
                conflict = False
                for char in keyword:
                    if any(img['word'] == char and img['count'] >= count for img in imagery):
                        # 如果有冲突，减少单字计数或跳过
                        pass
                
                if not conflict:
                    imagery.append({
                        'word': keyword,
                        'category': category,
                        'count': count,
                        'type': 'double_char'
                    })
    
    # 去重并合并计数
    unique_imagery = {}
    for item in imagery:
        key = (item['word'], item['category'])
        if key in unique_imagery:
            unique_imagery[key]['count'] += item['count']
        else:
            unique_imagery[key] = item
    
    # 按出现次数排序
    sorted_imagery = sorted(unique_imagery.values(), key=lambda x: x['count'], reverse=True)
    
    return sorted_imagery

def analyze_imagery_frequency(poems):
    """
    分析意象频率
    """
    all_imagery = []
    for poem in poems:
        all_imagery.extend(poem['imagery'])
    
    # 按意象词统计频率
    word_freq = Counter()
    for imagery in all_imagery:
        word_freq[imagery['word']] += imagery['count']
    
    # 按类别统计
    category_freq = Counter()
    for imagery in all_imagery:
        category_freq[imagery['category']] += imagery['count']
    
    # 统计单字意象
    single_char_imagery = [img for img in all_imagery if img.get('type') == 'single_char']
    single_char_freq = Counter()
    for imagery in single_char_imagery:
        single_char_freq[imagery['word']] += imagery['count']
    
    return {
        'word_frequency': dict(word_freq.most_common(100)),
        'category_frequency': dict(category_freq.most_common()),
        'single_char_frequency': dict(single_char_freq.most_common(50)),
        'total_unique_imagery': len(set([img['word'] for img in all_imagery])),
        'total_imagery_occurrences': sum([img['count'] for img in all_imagery]),
        'total_single_char_imagery': len(set([img['word'] for img in single_char_imagery])),
        'total_single_char_occurrences': sum([img['count'] for img in single_char_imagery])
    }

def save_to_json(poems, filename='dufu_poems_analysis.json'):
    """
    将诗歌数据保存为JSON文件
    """
    if not poems:
        print("没有数据可保存")
        return
    
    # 分析意象频率
    imagery_stats = analyze_imagery_frequency(poems)
    
    output_data = {
        'metadata': {
            'total_poems': len(poems),
            'total_imagery_words': imagery_stats['total_unique_imagery'],
            'total_imagery_occurrences': imagery_stats['total_imagery_occurrences'],
            'total_single_char_imagery': imagery_stats['total_single_char_imagery'],
            'total_single_char_occurrences': imagery_stats['total_single_char_occurrences'],
            'author': '杜甫',
            'dynasty': '唐代',
            'source': '本地TXT文件',
            'collection_date': time.strftime('%Y-%m-%d %H:%M:%S')
        },
        'imagery_statistics': imagery_stats,
        'poems': poems
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n数据已保存到 {filename}")
    print(f"总共提取 {len(poems)} 首诗")
    print(f"总共提取 {imagery_stats['total_unique_imagery']} 个独特意象词")
    print(f"意象总共出现 {imagery_stats['total_imagery_occurrences']} 次")
    print(f"单字意象词: {imagery_stats['total_single_char_imagery']} 个")
    print(f"单字意象出现: {imagery_stats['total_single_char_occurrences']} 次")

def main():
    """
    主函数
    """
    file_path = "D:\\VS code\\VS code program\\poem_visualization 2.0\\dufu_poems.txt"
    
    # 检查文件是否存在
    if not os.path.exists(file_path):
        print(f"文件不存在: {file_path}")
        return
    
    print("开始从TXT文件提取杜甫诗歌意象...")
    
    poems = load_poems_from_txt(file_path)
    
    if poems:
        save_to_json(poems)
        
        # 打印详细统计信息
        imagery_stats = analyze_imagery_frequency(poems)
        
        print("\n" + "="*50)
        print("意象分析统计")
        print("="*50)
        print(f"诗歌总数: {len(poems)}")
        print(f"独特意象词数量: {imagery_stats['total_unique_imagery']}")
        print(f"意象出现总次数: {imagery_stats['total_imagery_occurrences']}")
        print(f"单字意象词数量: {imagery_stats['total_single_char_imagery']}")
        print(f"单字意象出现次数: {imagery_stats['total_single_char_occurrences']}")
        
        print("\n意象分类统计:")
        for category, count in imagery_stats['category_frequency'].items():
            percentage = count / imagery_stats['total_imagery_occurrences'] * 100
            print(f"  {category:10s}: {count:5d}次 ({percentage:.1f}%)")
        
        print("\n最常用的前20个单字意象:")
        single_char_freq = imagery_stats['single_char_frequency']
        for i, (word, count) in enumerate(list(single_char_freq.items())[:20]):
            print(f"  {i+1:2d}. {word}: {count}次")
        
        print("\n最常用的前20个所有意象:")
        word_freq = imagery_stats['word_frequency']
        for i, (word, count) in enumerate(list(word_freq.items())[:20]):
            print(f"  {i+1:2d}. {word}: {count}次")
            
    else:
        print("未能从文件中提取到任何诗歌数据")

if __name__ == "__main__":
    main()