import { Category } from '../types';

export const categories: Category[] = [
  { id: 'food', name: '餐饮', icon: 'UtensilsCrossed', color: '#f97316' },
  { id: 'transport', name: '交通', icon: 'Car', color: '#3b82f6' },
  { id: 'shopping', name: '购物', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'entertainment', name: '娱乐', icon: 'Gamepad2', color: '#8b5cf6' },
  { id: 'housing', name: '居住', icon: 'Home', color: '#10b981' },
  { id: 'medical', name: '医疗', icon: 'Heart', color: '#ef4444' },
  { id: 'education', name: '学习', icon: 'BookOpen', color: '#06b6d4' },
  { id: 'other', name: '其他', icon: 'MoreHorizontal', color: '#6b7280' },
];

// 关键词映射到分类
export const keywordToCategory: Record<string, string> = {
  // 餐饮
  '饭': 'food', '吃': 'food', '餐': 'food', '菜': 'food', '奶茶': 'food', '咖啡': 'food',
  '早餐': 'food', '午餐': 'food', '晚餐': 'food', '夜宵': 'food', '水果': 'food',
  '超市': 'food', '买菜': 'food', '外卖': 'food', '餐厅': 'food', '火锅': 'food',
  
  // 交通
  '车': 'transport', '打车': 'transport', '滴滴': 'transport', '地铁': 'transport',
  '公交': 'transport', '高铁': 'transport', '火车': 'transport', '飞机': 'transport',
  '加油': 'transport', '停车': 'transport', '过路费': 'transport', '出租车': 'transport',
  
  // 购物
  '买': 'shopping', '购物': 'shopping', '衣服': 'shopping', '鞋': 'shopping',
  '包': 'shopping', '化妆品': 'shopping', '护肤品': 'shopping', '淘宝': 'shopping',
  '京东': 'shopping', '拼多多': 'shopping', '天猫': 'shopping', '快递': 'shopping',
  
  // 娱乐
  '电影': 'entertainment', '游戏': 'entertainment', 'KTV': 'entertainment', '唱': 'entertainment',
  '玩': 'entertainment', '会员': 'entertainment', '视频': 'entertainment', '音乐': 'entertainment',
  '旅游': 'entertainment', '旅行': 'entertainment', '门票': 'entertainment',
  
  // 居住
  '房租': 'housing', '水电': 'housing', '物业': 'housing', '宽带': 'housing',
  '话费': 'housing', '燃气': 'housing', '维修': 'housing', '家具': 'housing',
  
  // 医疗
  '药': 'medical', '医院': 'medical', '看病': 'medical', '体检': 'medical',
  '挂号': 'medical', '治疗': 'medical', '牙医': 'medical',
  
  // 学习
  '书': 'education', '课程': 'education', '培训': 'education', '学费': 'education',
  '考试': 'education', '资料': 'education', '报名': 'education',
};

export function getCategoryByKeyword(text: string): string {
  for (const [keyword, categoryId] of Object.entries(keywordToCategory)) {
    if (text.includes(keyword)) {
      return categoryId;
    }
  }
  return 'other';
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}
