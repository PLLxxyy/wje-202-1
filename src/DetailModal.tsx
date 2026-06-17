import { FishingRecord, WEATHER_EMOJIS, WATER_QUALITY_EMOJIS, FLOW_RATE_EMOJIS } from './types';
import { formatDate, formatWeight, getFishEmoji } from './storage';

interface Props {
  record: FishingRecord;
  onClose: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function DetailModal({ record, onClose, onDelete, onToggleFavorite }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>钓鱼详情</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className={`detail-photo photo-${record.photoIndex || 1}`}>
            {getFishEmoji(record.fishSpecies)}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary-dark)' }}>
              {record.fishSpecies}
            </div>
            <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
              {formatDate(record.date)} {record.time}
            </div>
          </div>

          <div className="detail-row">
            <span className="detail-label">钓点</span>
            <span className="detail-value">📍 {record.location}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">天气</span>
            <span className="detail-value">
              {WEATHER_EMOJIS[record.weather] || '🌤️'} {record.weather}
            </span>
          </div>
          {record.waterTemp > 0 && (
            <div className="detail-row">
              <span className="detail-label">水温</span>
              <span className="detail-value">🌡️ {record.waterTemp}℃</span>
            </div>
          )}
          {record.waterQuality && (
            <div className="detail-row">
              <span className="detail-label">水质</span>
              <span className="detail-value">
                {WATER_QUALITY_EMOJIS[record.waterQuality] || '💧'} {record.waterQuality}
              </span>
            </div>
          )}
          {record.flowRate && (
            <div className="detail-row">
              <span className="detail-label">流速</span>
              <span className="detail-value">
                {FLOW_RATE_EMOJIS[record.flowRate] || '🧊'} {record.flowRate}
              </span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">重量</span>
            <span className="detail-value">{formatWeight(record.weight)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">饵料</span>
            <span className="detail-value">🪱 {record.bait || '-'}</span>
          </div>
          {record.notes && (
            <div className="detail-row">
              <span className="detail-label">备注</span>
              <span className="detail-value" style={{ maxWidth: '60%', textAlign: 'right' }}>
                {record.notes}
              </span>
            </div>
          )}

          <div className="detail-actions">
            <button
              className="btn btn-secondary"
              onClick={() => onToggleFavorite(record.id)}
            >
              {record.favorite ? '★ 取消收藏' : '☆ 收藏'}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('确定要删除这条记录吗？')) {
                  onDelete(record.id);
                }
              }}
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
