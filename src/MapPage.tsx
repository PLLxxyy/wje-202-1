import { useMemo, useCallback } from 'react';
import { FishingRecord, SpotInfo } from './types';
import { loadSpots, saveSpots } from './storage';

interface Props {
  records: FishingRecord[];
  onSelectSpot: (spotName: string) => void;
}

const GRID_SIZE = 10;

export default function MapPage({ records, onSelectSpot }: Props) {
  const spots = useMemo(() => loadSpots(), [records]);

  // Build spot data with counts
  const spotData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      map[r.location] = (map[r.location] || 0) + 1;
    });
    return map;
  }, [records]);

  const spotNames = useMemo(() => {
    return Object.keys(spotData).sort((a, b) => spotData[b] - spotData[a]);
  }, [spotData]);

  const maxCount = useMemo(() => {
    return Math.max(...Object.values(spotData), 1);
  }, [spotData]);

  // Map spots to grid positions using a hash
  const gridSpots = useMemo(() => {
    const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(null)
    );
    const placed: Record<string, { r: number; c: number }> = {};

    spotNames.forEach((name, idx) => {
      let r: number, c: number;
      // Simple hash to get deterministic positions
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
      }
      // Try to place without collision
      r = Math.abs(hash) % GRID_SIZE;
      c = Math.abs((hash >> 8)) % GRID_SIZE;
      let attempts = 0;
      while (grid[r][c] !== null && attempts < GRID_SIZE * GRID_SIZE) {
        r = (r + 1) % GRID_SIZE;
        if (r === 0) c = (c + 1) % GRID_SIZE;
        attempts++;
      }
      if (grid[r][c] === null) {
        grid[r][c] = name;
        placed[name] = { r, c };
      }
    });

    return { grid, placed };
  }, [spotNames]);

  const getCellColor = (count: number) => {
    if (count === 0) return '#f0f7f4';
    const intensity = Math.min(count / maxCount, 1);
    const r = Math.round(232 - intensity * 187); // 232 -> 45
    const g = Math.round(245 - intensity * 139); // 245 -> 106
    const b = Math.round(233 - intensity * 161); // 233 -> 79
    return `rgb(${r},${g},${b})`;
  };

  const toggleFavorite = useCallback((spotName: string) => {
    const spotsData = loadSpots();
    const spot = spotsData.find(s => s.name === spotName);
    if (spot) {
      spot.favorite = !spot.favorite;
    } else {
      spotsData.push({ name: spotName, visitCount: spotData[spotName] || 1, favorite: true });
    }
    saveSpots(spotsData);
    // Force re-render via records state change (trigger parent)
    // We'll just directly manipulate DOM as a workaround
    window.dispatchEvent(new Event('storage'));
  }, [spotData]);

  const favoriteSpots = useMemo(() => {
    return spots.filter(s => s.favorite);
  }, [spots]);

  const allSpotsWithCount = useMemo(() => {
    return spotNames.map(name => ({
      name,
      count: spotData[name],
      favorite: spots.find(s => s.name === name)?.favorite || false,
    }));
  }, [spotNames, spotData, spots]);

  return (
    <>
      <div className="stat-card">
        <div className="map-header">
          <h3>🗺️ 钓点分布图</h3>
          <span style={{ fontSize: 12, color: '#999' }}>共 {spotNames.length} 个钓点</span>
        </div>
        {spotNames.length > 0 ? (
          <>
            <div
              className="map-grid"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {gridSpots.grid.map((row, r) =>
                row.map((cell, c) => {
                  const count = cell ? spotData[cell] : 0;
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`map-cell ${cell ? 'has-data' : ''}`}
                      style={{ background: getCellColor(count) }}
                      onClick={() => cell && onSelectSpot(cell)}
                      title={cell ? `${cell}: ${count}次` : ''}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  );
                })
              )}
            </div>
            <div className="map-legend">
              <span>少</span>
              <div className="legend-bar" />
              <span>多</span>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ padding: 30 }}>
            <p>还没有钓点数据</p>
          </div>
        )}
      </div>

      {/* Spot list with favorite toggle */}
      <div className="stat-card">
        <h3>📍 钓点列表</h3>
        {allSpotsWithCount.map(spot => (
          <div className="favorite-card" key={spot.name}>
            <div>
              <div className="favorite-name">{spot.name}</div>
              <div className="favorite-count">到访 {spot.count} 次</div>
            </div>
            <button
              className="favorite-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(spot.name);
              }}
              title={spot.favorite ? '取消收藏' : '收藏'}
            >
              <span className={spot.favorite ? 'star-active' : 'star-inactive'}>
                {spot.favorite ? '★' : '☆'}
              </span>
            </button>
          </div>
        ))}
        {allSpotsWithCount.length === 0 && (
          <p style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: 20 }}>
            暂无钓点
          </p>
        )}
      </div>

      {/* Favorite spots */}
      {favoriteSpots.length > 0 && (
        <div className="stat-card">
          <h3>⭐ 常去钓点</h3>
          {favoriteSpots.map(spot => (
            <div className="favorite-card" key={spot.name}>
              <div>
                <div className="favorite-name">⭐ {spot.name}</div>
                <div className="favorite-count">到访 {spot.visitCount} 次</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
