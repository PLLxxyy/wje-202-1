import { useState, useMemo } from 'react';
import { FishingRecord } from './types';
import { formatWeight, getMonthLabel } from './storage';

interface Props {
  records: FishingRecord[];
}

const PIE_COLORS = [
  '#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2',
  '#b7e4c7', '#457b9d', '#f4a261', '#e76f51', '#264653',
  '#a8dadc', '#e9c46a',
];

export default function StatsPage({ records }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  };

  // Filter records for selected month
  const monthRecords = useMemo(() => {
    return records.filter(r => {
      const d = new Date(r.date + 'T00:00:00');
      return d.getFullYear() === viewYear && d.getMonth() + 1 === viewMonth;
    });
  }, [records, viewYear, viewMonth]);

  // Monthly frequency - last 12 months
  const monthlyFreq = useMemo(() => {
    const data: { label: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const count = records.filter(r => {
        const rd = new Date(r.date + 'T00:00:00');
        return rd.getFullYear() === y && rd.getMonth() + 1 === m;
      }).length;
      data.push({ label: `${m}月`, count });
    }
    return data;
  }, [records]);

  const maxFreq = Math.max(...monthlyFreq.map(m => m.count), 1);

  // Species pie chart
  const speciesData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      map[r.fishSpecies] = (map[r.fishSpecies] || 0) + r.weight;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, weight]) => ({ name, weight }));
  }, [records]);

  const totalWeight = speciesData.reduce((sum, s) => sum + s.weight, 0);

  // Build conic-gradient for pie
  const pieGradient = useMemo(() => {
    if (speciesData.length === 0) return 'conic-gradient(#eee 0% 100%)';
    const stops: string[] = [];
    let accumulated = 0;
    speciesData.forEach((s, i) => {
      const pct = totalWeight > 0 ? (s.weight / totalWeight) * 100 : 0;
      stops.push(`${PIE_COLORS[i]} ${accumulated}% ${accumulated + pct}%`);
      accumulated += pct;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [speciesData, totalWeight]);

  // Biggest single catch
  const biggestCatch = useMemo(() => {
    if (records.length === 0) return null;
    return records.reduce((max, r) => r.weight > max.weight ? r : max, records[0]);
  }, [records]);

  // Personal best per species
  const speciesBest = useMemo(() => {
    const map: Record<string, FishingRecord> = {};
    records.forEach(r => {
      if (!map[r.fishSpecies] || r.weight > map[r.fishSpecies].weight) {
        map[r.fishSpecies] = r;
      }
    });
    return Object.values(map)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📊</div>
        <p>暂无统计数据</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>添加一些钓鱼记录后即可查看统计</p>
      </div>
    );
  }

  const rankClasses = ['gold', 'silver', 'bronze', 'normal', 'normal'];

  return (
    <>
      {/* Monthly frequency chart */}
      <div className="stat-card">
        <h3>📈 月度钓鱼频次</h3>
        <div className="bar-chart">
          {monthlyFreq.map((m, i) => (
            <div className="bar-col" key={i}>
              <div className="bar-value">{m.count > 0 ? m.count : ''}</div>
              <div
                className="bar"
                style={{ height: `${(m.count / maxFreq) * 100}%` }}
                title={`${m.label}: ${m.count}次`}
              />
              <div className="bar-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Species pie chart */}
      <div className="stat-card">
        <h3>🥧 鱼种收获分布</h3>
        {speciesData.length > 0 ? (
          <div className="pie-container">
            <div
              className="pie"
              style={{ background: pieGradient }}
            />
            <div className="pie-legend">
              {speciesData.map((s, i) => (
                <div className="pie-legend-item" key={s.name}>
                  <div
                    className="pie-legend-dot"
                    style={{ background: PIE_COLORS[i] }}
                  />
                  <span>{s.name}</span>
                  <span style={{ color: '#999', fontSize: 12 }}>
                    {formatWeight(s.weight)} ({totalWeight > 0 ? ((s.weight / totalWeight) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>暂无数据</p>
        )}
      </div>

      {/* Monthly detail selector */}
      <div className="stat-card">
        <h3>📅 月度详情</h3>
        <div className="month-selector">
          <button className="month-btn" onClick={prevMonth}>‹</button>
          <span className="month-label">{getMonthLabel(viewYear, viewMonth)}</span>
          <button className="month-btn" onClick={nextMonth}>›</button>
        </div>
        <div className="detail-row">
          <span className="detail-label">出钓次数</span>
          <span className="detail-value">{monthRecords.length} 次</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">总收获</span>
          <span className="detail-value">
            {formatWeight(monthRecords.reduce((s, r) => s + r.weight, 0))}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">钓获鱼种</span>
          <span className="detail-value">
            {[...new Set(monthRecords.map(r => r.fishSpecies))].length} 种
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">常去钓点</span>
          <span className="detail-value">
            {(() => {
              const locMap: Record<string, number> = {};
              monthRecords.forEach(r => { locMap[r.location] = (locMap[r.location] || 0) + 1; });
              const top = Object.entries(locMap).sort((a, b) => b[1] - a[1])[0];
              return top ? `${top[0]} (${top[1]}次)` : '-';
            })()}
          </span>
        </div>
      </div>

      {/* Biggest catch */}
      {biggestCatch && (
        <div className="stat-card">
          <h3>🏆 最大单尾</h3>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div className="stat-big">{formatWeight(biggestCatch.weight)}</div>
            <div className="stat-sub" style={{ marginTop: 8 }}>
              {biggestCatch.fishSpecies} · {biggestCatch.location}
            </div>
            <div className="stat-sub">
              {biggestCatch.date}
            </div>
          </div>
        </div>
      )}

      {/* Personal bests */}
      <div className="stat-card">
        <h3>🏅 个人最佳排行</h3>
        {speciesBest.map((r, i) => (
          <div className="leaderboard-item" key={r.id}>
            <div className={`rank ${rankClasses[i] || 'normal'}`}>
              {i + 1}
            </div>
            <div className="leaderboard-info">
              <div className="leaderboard-fish">{r.fishSpecies}</div>
              <div className="leaderboard-detail">{r.location} · {r.date}</div>
            </div>
            <div className="leaderboard-weight">{formatWeight(r.weight)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
