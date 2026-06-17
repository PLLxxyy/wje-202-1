import { FishingRecord } from './types';
import { formatDate, formatWeight, getFishEmoji } from './storage';
import { WEATHER_EMOJIS } from './types';

interface Props {
  records: FishingRecord[];
  onSelect: (record: FishingRecord) => void;
}

export default function TimelinePage({ records, onSelect }: Props) {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">🎣</div>
        <p>还没有钓鱼记录</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>点击右下角的 + 按钮开始记录</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, FishingRecord[]> = {};
  records.forEach(r => {
    if (!grouped[r.date]) grouped[r.date] = [];
    grouped[r.date].push(r);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="timeline">
      {sortedDates.map(date => (
        <div key={date}>
          {grouped[date].map((record, idx) => (
            <div
              key={record.id}
              className="timeline-item"
              onClick={() => onSelect(record)}
            >
              <div className="timeline-dot" />
              <div className="timeline-card">
                {idx === 0 && (
                  <div className="timeline-date">{formatDate(date)}</div>
                )}
                <div className="timeline-main">
                  <div className="timeline-info">
                    <div className="timeline-fish">
                      {getFishEmoji(record.fishSpecies)} {record.fishSpecies}
                      {record.favorite && <span style={{ marginLeft: 6, color: '#ffd700' }}>★</span>}
                    </div>
                    <div className="timeline-detail">
                      <span>📍 {record.location}</span>
                      {record.time && <span>🕐 {record.time}</span>}
                    </div>
                    <div className="timeline-tags">
                      <span className="tag weather">
                        {WEATHER_EMOJIS[record.weather] || '🌤️'} {record.weather}
                      </span>
                      <span className="tag weight">
                        ⚖️ {formatWeight(record.weight)}
                      </span>
                      {record.bait && (
                        <span className="tag">🪱 {record.bait}</span>
                      )}
                    </div>
                  </div>
                  <div className={`timeline-photo photo-${record.photoIndex || 1}`}>
                    {getFishEmoji(record.fishSpecies)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
