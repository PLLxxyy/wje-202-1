export interface FishingRecord {
  id: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:mm
  location: string;      // 钓点名称
  weather: string;       // 天气
  waterTemp: number;     // 水温 (℃)
  waterQuality: string;  // 水质
  flowRate: string;      // 流速
  fishSpecies: string;   // 鱼种
  weight: number;        // 克
  bait: string;          // 饵料
  notes: string;         // 备注
  photoIndex: number;    // 1-5 对应不同颜色占位图
  favorite: boolean;
}

export interface SpotInfo {
  name: string;
  visitCount: number;
  favorite: boolean;
}

export type TabType = 'timeline' | 'stats' | 'map';

export const WEATHER_OPTIONS = ['晴天', '多云', '阴天', '小雨', '大雨', '阵雨', '雾', '下雪'];
export const WATER_QUALITY_OPTIONS = ['清澈', '微浑', '浑浊', '严重浑浊', '肥水', '瘦水'];
export const FLOW_RATE_OPTIONS = ['静止', '缓慢', '中等', '湍急', '涨水', '退水'];
export const BAIT_OPTIONS = ['蚯蚓', '商品饵', '玉米', '红虫', '面团', '拉饵', '搓饵', '虾', '活饵', '其他'];
export const FISH_EMOJIS: Record<string, string> = {
  '鲫鱼': '🐟', '鲤鱼': '🐠', '草鱼': '🐟', '鲢鱼': '🐟',
  '鳙鱼': '🐟', '鲈鱼': '🐟', '黑鱼': '🐍', '鲶鱼': '🐟',
  '翘嘴': '🐟', '鳊鱼': '🐟', '黄颡鱼': '🐟', '罗非鱼': '🐟',
  'default': '🐟',
};
export const WEATHER_EMOJIS: Record<string, string> = {
  '晴天': '☀️', '多云': '⛅', '阴天': '☁️', '小雨': '🌧️',
  '大雨': '⛈️', '阵雨': '🌦️', '雾': '🌫️', '下雪': '❄️',
};
export const WATER_QUALITY_EMOJIS: Record<string, string> = {
  '清澈': '💧', '微浑': '🌊', '浑浊': '🟤', '严重浑浊': '🟫',
  '肥水': '🟢', '瘦水': '🔵',
};
export const FLOW_RATE_EMOJIS: Record<string, string> = {
  '静止': '🧊', '缓慢': '🌊', '中等': '💨', '湍急': '🌪️',
  '涨水': '⬆️', '退水': '⬇️',
};
