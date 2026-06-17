import { useState } from 'react';
import { FishingRecord, WEATHER_OPTIONS, BAIT_OPTIONS } from './types';
import { generateId } from './storage';

interface Props {
  onAdd: (record: FishingRecord) => void;
  onClose: () => void;
  existingLocations: string[];
}

export default function AddRecordModal({ onAdd, onClose, existingLocations }: Props) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(timeStr);
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [weather, setWeather] = useState('晴天');
  const [fishSpecies, setFishSpecies] = useState('鲫鱼');
  const [customFish, setCustomFish] = useState('');
  const [weight, setWeight] = useState('');
  const [bait, setBait] = useState('蚯蚓');
  const [notes, setNotes] = useState('');

  const allLocations = [...new Set([...existingLocations, customLocation].filter(Boolean))];

  const handleSubmit = () => {
    const finalLocation = customLocation || location || '未知钓点';
    const finalFish = customFish || fishSpecies;
    const weightNum = parseFloat(weight) || 0;

    onAdd({
      id: generateId(),
      date,
      time,
      location: finalLocation,
      weather,
      fishSpecies: finalFish,
      weight: weightNum,
      bait,
      notes,
      photoIndex: Math.ceil(Math.random() * 5),
      favorite: false,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>新增钓鱼记录</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">日期</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">时间</label>
              <input
                type="time"
                className="form-input"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">钓点</label>
            {allLocations.length > 0 && (
              <div className="spot-chips">
                {allLocations.map(loc => (
                  <button
                    key={loc}
                    className={`spot-chip ${location === loc ? 'selected' : ''}`}
                    onClick={() => { setLocation(loc); setCustomLocation(''); }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              className="form-input"
              placeholder="输入新钓点名称"
              value={customLocation}
              onChange={e => { setCustomLocation(e.target.value); setLocation(''); }}
            />
          </div>

          {/* Weather */}
          <div className="form-group">
            <label className="form-label">天气</label>
            <select
              className="form-select"
              value={weather}
              onChange={e => setWeather(e.target.value)}
            >
              {WEATHER_OPTIONS.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Fish species */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">鱼种</label>
              <select
                className="form-select"
                value={fishSpecies}
                onChange={e => setFishSpecies(e.target.value)}
              >
                {['鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼', '鲈鱼', '黑鱼', '鲶鱼', '翘嘴', '鳊鱼', '黄颡鱼', '罗非鱼'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">自定义鱼种</label>
              <input
                type="text"
                className="form-input"
                placeholder="可选"
                value={customFish}
                onChange={e => setCustomFish(e.target.value)}
              />
            </div>
          </div>

          {/* Weight & Bait */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">重量 (克)</label>
              <input
                type="number"
                className="form-input"
                placeholder="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">饵料</label>
              <select
                className="form-select"
                value={bait}
                onChange={e => setBait(e.target.value)}
              >
                {BAIT_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">备注</label>
            <textarea
              className="form-textarea"
              placeholder="今天的钓鱼心得..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}>
            保存记录
          </button>
        </div>
      </div>
    </div>
  );
}
