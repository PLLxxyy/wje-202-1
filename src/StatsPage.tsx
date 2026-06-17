import { useState, useMemo } from 'react';
import { FishingRecord, WEATHER_EMOJIS, WATER_QUALITY_EMOJIS, FLOW_RATE_EMOJIS } from './types';
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

  // Weather impact analysis
  const weatherAnalysis = useMemo(() => {
    const map: Record<string, { count: number; totalWeight: number }> = {};
    records.forEach(r => {
      if (!map[r.weather]) map[r.weather] = { count: 0, totalWeight: 0 };
      map[r.weather].count++;
      map[r.weather].totalWeight += r.weight;
    });
    return Object.entries(map)
      .map(([weather, data]) => ({
        weather,
        count: data.count,
        totalWeight: data.totalWeight,
        avgWeight: data.count > 0 ? data.totalWeight / data.count : 0,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight);
  }, [records]);

  // Water temperature impact analysis (group by 5℃ range)
  const waterTempAnalysis = useMemo(() => {
    const map: Record<string, { count: number; totalWeight: number; rangeStart: number }> = {};
    records.filter(r => r.waterTemp > 0).forEach(r => {
      const rangeStart = Math.floor(r.waterTemp / 5) * 5;
      const range = `${rangeStart}~${rangeStart + 5}℃`;
      if (!map[range]) map[range] = { count: 0, totalWeight: 0, rangeStart };
      map[range].count++;
      map[range].totalWeight += r.weight;
    });
    return Object.entries(map)
      .map(([range, data]) => ({
        range,
        rangeStart: data.rangeStart,
        count: data.count,
        totalWeight: data.totalWeight,
        avgWeight: data.count > 0 ? data.totalWeight / data.count : 0,
      }))
      .sort((a, b) => a.rangeStart - b.rangeStart);
  }, [records]);

  // Water quality impact analysis
  const waterQualityAnalysis = useMemo(() => {
    const map: Record<string, { count: number; totalWeight: number }> = {};
    records.forEach(r => {
      const key = r.waterQuality || '未记录';
      if (!map[key]) map[key] = { count: 0, totalWeight: 0 };
      map[key].count++;
      map[key].totalWeight += r.weight;
    });
    return Object.entries(map)
      .map(([quality, data]) => ({
        quality,
        count: data.count,
        totalWeight: data.totalWeight,
        avgWeight: data.count > 0 ? data.totalWeight / data.count : 0,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight);
  }, [records]);

  // Flow rate impact analysis
  const flowRateAnalysis = useMemo(() => {
    const map: Record<string, { count: number; totalWeight: number }> = {};
    records.forEach(r => {
      const key = r.flowRate || '未记录';
      if (!map[key]) map[key] = { count: 0, totalWeight: 0 };
      map[key].count++;
      map[key].totalWeight += r.weight;
    });
    return Object.entries(map)
      .map(([rate, data]) => ({
        rate,
        count: data.count,
        totalWeight: data.totalWeight,
        avgWeight: data.count > 0 ? data.totalWeight / data.count : 0,
      }))
      .sort((a, b) => b.totalWeight - a.totalWeight);
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

      {/* Environment Impact: Weather */}
      <div className="stat-card">
        <h3>🌤️ 天气影响分析</h3>
        {weatherAnalysis.length > 0 ? (
          <>
            {weatherAnalysis.map((w, i) => {
              const maxWeight = Math.max(...weatherAnalysis.map(x => x.totalWeight), 1);
              return (
                <div key={w.weather} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span>
                      {WEATHER_EMOJIS[w.weather] || '🌤️'} {w.weather}
                    </span>
                    <span style={{ color: '#666', fontSize: 13 }}>
                      {w.count}次 · 总计{formatWeight(w.totalWeight)} · 均{formatWeight(Math.round(w.avgWeight))}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: '#e8f5e9',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(w.totalWeight / maxWeight) * 100}%`,
                        background: i === 0 ? '#2d6a4f' : '#74c69d',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>暂无数据</p>
        )}
      </div>

      {/* Environment Impact: Water Temperature */}
      <div className="stat-card">
        <h3>🌡️ 水温影响分析</h3>
        {waterTempAnalysis.length > 0 ? (
          <>
            {waterTempAnalysis.map((t, i) => {
              const maxWeight = Math.max(...waterTempAnalysis.map(x => x.totalWeight), 1);
              return (
                <div key={t.range} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span>{t.range}</span>
                    <span style={{ color: '#666', fontSize: 13 }}>
                      {t.count}次 · 总计{formatWeight(t.totalWeight)} · 均{formatWeight(Math.round(t.avgWeight))}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: '#e3f2fd',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(t.totalWeight / maxWeight) * 100}%`,
                        background: i === waterTempAnalysis.length - 1 ? '#1976d2' : '#64b5f6',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>暂无水温数据，请在记录时填写水温</p>
        )}
      </div>

      {/* Environment Impact: Water Quality */}
      <div className="stat-card">
        <h3>💧 水质影响分析</h3>
        {waterQualityAnalysis.length > 0 ? (
          <>
            {waterQualityAnalysis.map((q, i) => {
              const maxWeight = Math.max(...waterQualityAnalysis.map(x => x.totalWeight), 1);
              return (
                <div key={q.quality} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span>
                      {WATER_QUALITY_EMOJIS[q.quality] || '💧'} {q.quality}
                    </span>
                    <span style={{ color: '#666', fontSize: 13 }}>
                      {q.count}次 · 总计{formatWeight(q.totalWeight)} · 均{formatWeight(Math.round(q.avgWeight))}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: '#f1f8e9',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(q.totalWeight / maxWeight) * 100}%`,
                        background: i === 0 ? '#558b2f' : '#9ccc65',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>暂无数据</p>
        )}
      </div>

      {/* Environment Impact: Flow Rate */}
      <div className="stat-card">
        <h3>🌊 流速影响分析</h3>
        {flowRateAnalysis.length > 0 ? (
          <>
            {flowRateAnalysis.map((f, i) => {
              const maxWeight = Math.max(...flowRateAnalysis.map(x => x.totalWeight), 1);
              return (
                <div key={f.rate} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span>
                      {FLOW_RATE_EMOJIS[f.rate] || '🧊'} {f.rate}
                    </span>
                    <span style={{ color: '#666', fontSize: 13 }}>
                      {f.count}次 · 总计{formatWeight(f.totalWeight)} · 均{formatWeight(Math.round(f.avgWeight))}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: '#e0f7fa',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(f.totalWeight / maxWeight) * 100}%`,
                        background: i === 0 ? '#00695c' : '#4db6ac',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p style={{ color: '#999', fontSize: 14 }}>暂无数据</p>
        )}
      </div>
    </>
  );
}
