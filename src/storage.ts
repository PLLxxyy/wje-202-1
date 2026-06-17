import { FishingRecord, SpotInfo } from './types';

const RECORDS_KEY = 'fishing-log-records';
const SPOTS_KEY = 'fishing-log-spots';

function migrateRecord(raw: any): FishingRecord {
  return {
    id: raw.id,
    date: raw.date,
    time: raw.time || '',
    location: raw.location || '未知钓点',
    weather: raw.weather || '晴天',
    waterTemp: typeof raw.waterTemp === 'number' ? raw.waterTemp : 0,
    waterQuality: raw.waterQuality || '',
    flowRate: raw.flowRate || '',
    fishSpecies: raw.fishSpecies || '鲫鱼',
    weight: typeof raw.weight === 'number' ? raw.weight : 0,
    bait: raw.bait || '',
    notes: raw.notes || '',
    photoIndex: typeof raw.photoIndex === 'number' ? raw.photoIndex : Math.ceil(Math.random() * 5),
    favorite: !!raw.favorite,
  };
}

export function loadRecords(): FishingRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const migrated = parsed.map(migrateRecord);
    let changed = false;
    for (let i = 0; i < parsed.length; i++) {
      if (
        parsed[i].waterTemp === undefined ||
        parsed[i].waterQuality === undefined ||
        parsed[i].flowRate === undefined
      ) {
        changed = true;
        break;
      }
    }
    if (changed) {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
}

export function saveRecords(records: FishingRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadSpots(): SpotInfo[] {
  try {
    const raw = localStorage.getItem(SPOTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSpots(spots: SpotInfo[]) {
  localStorage.setItem(SPOTS_KEY, JSON.stringify(spots));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`;
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return (grams / 1000).toFixed(1) + 'kg';
  }
  return grams + 'g';
}

export function getMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function getFishEmoji(species: string): string {
  const emojis: Record<string, string> = {
    '鲫鱼': '🐟', '鲤鱼': '🐠', '草鱼': '🐟', '鲢鱼': '🐟',
    '鳙鱼': '🐟', '鲈鱼': '🐟', '黑鱼': '🐍', '鲶鱼': '🐟',
    '翘嘴': '🐟', '鳊鱼': '🐟', '黄颡鱼': '🐟', '罗非鱼': '🐟',
  };
  return emojis[species] || '🐟';
}
