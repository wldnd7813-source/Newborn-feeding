import React, { useState } from 'react';
import AdminStats from './AdminStats';

function Calculator({ onNavigate, onAdminMode, isAdmin }) {
  const [weight, setWeight] = useState('');
  const [mlPerKg, setMlPerKg] = useState('');
  const [status, setStatus] = useState('stay');
  const [admissionHour, setAdmissionHour] = useState('');
  const [admissionMinute, setAdmissionMinute] = useState('');
  const [result, setResult] = useState(null);

  const FEED_TIMES = [
    { label: "07:00", min: 420, icon: "🍼" },
    { label: "10:00", min: 600, icon: "🍼" },
    { label: "13:00", min: 780, icon: "🍼" },
    { label: "16:00", min: 960, icon: "🍼" },
    { label: "19:00", min: 1140, icon: "🍼" },
    { label: "23:00", min: 1380, icon: "🍼" },
    { label: "02:00", min: 1560, icon: "🍼" },
    { label: "05:00", min: 1740, icon: "🍼" }
  ];

  const roundUp5 = (v) => Math.ceil(v / 5) * 5;
  const floor5 = (v) => Math.floor(v / 5) * 5;

  const calculate = () => {
    const w = parseFloat(weight);
    const m = parseFloat(mlPerKg);

    // 관리자 모드 활성화 체크
    if (w === 99.99 && m === 1725 && status === 'stay') {
      onAdminMode();
      alert('🔐 관리자 모드가 활성화되었습니다!');
      return;
    }

    if (!w || !m) {
      alert("체중과 체중당 수유량을 입력하세요.");
      return;
    }
  
  // 나머지 코드...

    const daily = roundUp5(w * m);
    let effective = daily;
    let feeds = [];

    if (status === "stay") {
      feeds = FEED_TIMES.map(t => ({ time: t.label, volume: 0, icon: t.icon }));
    } else {
      const h = admissionHour;
      const min = admissionMinute;
      if (h === "" || min === "") {
        alert("입원 시각을 입력하세요.");
        return;
      }

      let admitMin = Number(h) * 60 + Number(min);
      if (admitMin < 360) admitMin += 1440;

      const remainHr = 24 - ((admitMin - 360) / 60);
      effective = roundUp5(daily / 24 * remainHr);

      feeds.push({ 
        time: `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`, 
        volume: 0,
        icon: "🏥"
      });

      let future = FEED_TIMES.filter(t => t.min >= admitMin);
      if (future.length && future[0].min - admitMin < 60) future.shift();
      future.forEach(t => feeds.push({ time: t.label, volume: 0, icon: t.icon }));
    }

    const base = floor5(effective / feeds.length);
    let rest = effective - base * feeds.length;

    feeds.forEach(f => f.volume = base);
    for (let i = feeds.length - 1; i >= 0 && rest > 0; i--, rest -= 5) {
      feeds[i].volume += 5;
    }

    setResult({ daily, effective, feeds });
  };

  return (
  <div className="container">
    <header>
      <div className="header-icon">🍼</div>
      <h1>신생아 수유량 계산기</h1>
    </header>

    {/* 관리자 통계 */}
    {isAdmin && <AdminStats />}

      <div className="card">
        <div className="input-group">
          <label>
            체중 (kg)
            <span className="label-badge">필수</span>
          </label>
          <input 
            type="number" 
            min="0" 
            max="99.99"
            step="0.01" 
            placeholder="예: 2.34"
            value={weight}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || parseFloat(value) <= 99.99) {
                setWeight(value);
              }
            }}
          />
        </div>

        <div className="input-group">
          <label>
            체중당 수유량 (mL/kg/day)
            <span className="label-badge">필수</span>
          </label>
          <input 
            type="number" 
            min="0" 
            max="9999"
            step="1" 
            placeholder="예: 70"
            value={mlPerKg}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || parseInt(value) <= 9999) {
                setMlPerKg(value);
              }
            }}
          />
        </div>

        <div className="input-group">
          <label>환자 상태</label>
          <div className="radio-group">
            <div className="radio-option">
              <input 
                type="radio" 
                name="admit" 
                value="stay" 
                id="stay" 
                checked={status === 'stay'}
                onChange={(e) => setStatus(e.target.value)}
              />
              <label htmlFor="stay" className="radio-label">
                <span className="radio-icon">🏥</span>
                재원
              </label>
            </div>
            <div className="radio-option">
              <input 
                type="radio" 
                name="admit" 
                value="new" 
                id="new"
                checked={status === 'new'}
                onChange={(e) => setStatus(e.target.value)}
              />
              <label htmlFor="new" className="radio-label">
                <span className="radio-icon">➕</span>
                입원
              </label>
            </div>
          </div>
        </div>

        <div className="input-group">
          <label>입원 시각</label>
          <div className="time-group">
            <select 
              disabled={status === 'stay'}
              value={admissionHour}
              onChange={(e) => setAdmissionHour(e.target.value)}
            >
              <option value="">시</option>
              {Array.from({length: 24}, (_, i) => (
                <option key={i} value={i}>{i}시</option>
              ))}
            </select>

            <select 
              disabled={status === 'stay'}
              value={admissionMinute}
              onChange={(e) => setAdmissionMinute(e.target.value)}
            >
              <option value="">분</option>
              {Array.from({length: 12}, (_, i) => i * 5).map(min => (
                <option key={min} value={min}>{String(min).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={calculate}>💫 계산하기</button>
      </div>

      {result && (
        <div className="result">
          <div className="result-header">
            <div className="result-title">일일 총 수유량</div>
            <div className="result-value">{result.daily} mL</div>
            <div className="result-subvalue">적용량: {result.effective} mL</div>
          </div>
          <div className="feed-list">
            {result.feeds.map((f, idx) => (
              <div 
                key={idx} 
                className={`feed-row ${["02:00","05:00"].includes(f.time) ? "night" : ""}`}
              >
                <div className="feed-time">
                  <span className="feed-icon">{f.icon}</span>
                  {f.time}
                </div>
                <div className="feed-volume">{f.volume} mL</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer>
        <button 
          className="footer-link"
          onClick={() => onNavigate('suggestions')}
        >
          💡 개선사항 제안하기
        </button>
      </footer>
    </div>
  );
}

export default Calculator;