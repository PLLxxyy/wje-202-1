import { useState, useCallback } from 'react';
import { TabType, FishingRecord } from './types';
import { loadRecords, saveRecords, loadSpots, saveSpots } from './storage';
import TimelinePage from './TimelinePage';
import StatsPage from './StatsPage';
import MapPage from './MapPage';
import AddRecordModal from './AddRecordModal';
import DetailModal from './DetailModal';

export default function App() {
  const [tab, setTab] = useState<TabType>('timeline');
  const [records, setRecords] = useState<FishingRecord[]>(() => loadRecords());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FishingRecord | null>(null);

  const handleAddRecord = useCallback((record: FishingRecord) => {
    setRecords(prev => {
      const next = [record, ...prev];
      saveRecords(next);
      // Update spots
      const spots = loadSpots();
      const existing = spots.find(s => s.name === record.location);
      if (existing) {
        existing.visitCount++;
      } else {
        spots.push({ name: record.location, visitCount: 1, favorite: false });
      }
      saveSpots(spots);
      return next;
    });
    setShowAdd(false);
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      saveRecords(next);
      return next;
    });
    setSelectedRecord(null);
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setRecords(prev => {
      const next = prev.map(r =>
        r.id === id ? { ...r, favorite: !r.favorite } : r
      );
      saveRecords(next);
      return next;
    });
  }, []);

  return (
    <>
      <div className="app-header">
        <h1>垂钓日志</h1>
      </div>

      <div className="content">
        {tab === 'timeline' && (
          <TimelinePage
            records={records}
            onSelect={setSelectedRecord}
          />
        )}
        {tab === 'stats' && (
          <StatsPage records={records} />
        )}
        {tab === 'map' && (
          <MapPage
            records={records}
            onSelectSpot={(spotName) => {
              const rec = records.find(r => r.location === spotName);
              if (rec) setSelectedRecord(rec);
            }}
          />
        )}
      </div>

      <button className="fab" onClick={() => setShowAdd(true)} title="新增记录">
        +
      </button>

      <nav className="tab-bar">
        <button
          className={`tab-item ${tab === 'timeline' ? 'active' : ''}`}
          onClick={() => setTab('timeline')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M2 12h20" strokeLinecap="round"/>
            <circle cx="12" cy="6" r="2" fill="currentColor"/>
            <circle cx="6" cy="12" r="2" fill="currentColor"/>
            <circle cx="18" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="18" r="2" fill="currentColor"/>
          </svg>
          <span>时间线</span>
        </button>
        <button
          className={`tab-item ${tab === 'stats' ? 'active' : ''}`}
          onClick={() => setTab('stats')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="12" width="4" height="9" rx="1"/>
            <rect x="10" y="6" width="4" height="15" rx="1"/>
            <rect x="17" y="2" width="4" height="19" rx="1"/>
          </svg>
          <span>统计</span>
        </button>
        <button
          className={`tab-item ${tab === 'map' ? 'active' : ''}`}
          onClick={() => setTab('map')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2l-6 3v17l6-3 6 3 6-3V2l-6 3-6-3z"/>
            <path d="M9 2v17M15 5v17"/>
          </svg>
          <span>钓点</span>
        </button>
      </nav>

      {showAdd && (
        <AddRecordModal
          onAdd={handleAddRecord}
          onClose={() => setShowAdd(false)}
          existingLocations={[...new Set(records.map(r => r.location))]}
        />
      )}

      {selectedRecord && (
        <DetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onDelete={handleDeleteRecord}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </>
  );
}
