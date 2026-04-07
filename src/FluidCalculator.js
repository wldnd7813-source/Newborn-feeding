import React, { useState } from 'react';

const FEED_TIMES = [7, 10, 13, 16, 19, 23, 2, 5];

function FluidCalculator() {
  // 수액보완 상태
  const [fluidWeight, setFluidWeight] = useState('');
  const [fluidVolumePerKg, setFluidVolumePerKg] = useState('');
  const [fluidBaseFeeding, setFluidBaseFeeding] = useState('');
  const [includeMethod, setIncludeMethod] = useState('full');
  const [customIncludeMl, setCustomIncludeMl] = useState('');
  const [fluidBaseResult, setFluidBaseResult] = useState(null);
  const [baseFluidData, setBaseFluidData] = useState(null);

  // 수유량 변경
  const [changeHour, setChangeHour] = useState('');
  const [changeMinute, setChangeMinute] = useState('0');
  const [changeVolume, setChangeVolume] = useState('');
  const [fluidChanges, setFluidChanges] = useState([]);
  const [fluidFinalResult, setFluidFinalResult] = useState(null);

  // 기본 수액 계산
  const calculateBaseFluid = () => {
    const weight = parseFloat(fluidWeight);
    const volumePerKg = parseFloat(fluidVolumePerKg);
    const baseFeeding = parseFloat(fluidBaseFeeding);

    if (!weight || !volumePerKg || !baseFeeding) {
      alert('모든 값을 입력해주세요.');
      return;
    }

    let includeMl;
    let feedingLabel;
    if (includeMethod === 'full') {
      includeMl = baseFeeding;
      feedingLabel = '전체 포함';
    } else if (includeMethod === 'half') {
      includeMl = baseFeeding * 0.5;
      feedingLabel = '반만 포함';
    } else {
      includeMl = parseFloat(customIncludeMl);
      if (!includeMl || includeMl < 0 || includeMl > baseFeeding) {
        alert(`포함량을 0~${baseFeeding}mL 사이로 입력해주세요.`);
        return;
      }
      feedingLabel = `직접입력 (${includeMl}mL)`;
    }

    const totalRequired = weight * volumePerKg;
    const totalFeeding = baseFeeding * 8;
    const effectiveFeeding = includeMl * 8;
    const fluidSupply = totalRequired - effectiveFeeding;
    const fluidPerHour = fluidSupply / 24;

    const data = {
      weight, volumePerKg, totalRequired, baseFeeding,
      totalFeeding, includeMethod, includeMl,
      effectiveFeeding, fluidSupply, fluidPerHour
    };

    setBaseFluidData(data);
    setFluidBaseResult({ totalRequired, totalFeeding, baseFeeding, effectiveFeeding, fluidSupply, fluidPerHour, feedingLabel });
    setFluidChanges([]);
    setFluidFinalResult(null);
  };

  // 수유량 변경 추가
  const addChange = () => {
    const volume = parseFloat(changeVolume);
    if (changeHour === '' || !volume) {
      alert('변경 시각과 수유량을 입력해주세요.');
      return;
    }

    const changeTimeMinutes = parseInt(changeHour) * 60 + parseInt(changeMinute);
    const duplicate = fluidChanges.find(c => c.timeMinutes === changeTimeMinutes);
    if (duplicate) {
      alert('이미 해당 시각에 변경 내역이 있습니다.');
      return;
    }

    const newChanges = [...fluidChanges, {
      hour: parseInt(changeHour),
      minute: parseInt(changeMinute),
      timeMinutes: changeTimeMinutes,
      volume
    }].sort((a, b) => a.timeMinutes - b.timeMinutes);

    setFluidChanges(newChanges);
    recalculateFluid(newChanges);
    setChangeHour('');
    setChangeMinute('0');
    setChangeVolume('');
  };

  // 변경 내역 삭제
  const removeChange = (index) => {
    const newChanges = fluidChanges.filter((_, i) => i !== index);
    setFluidChanges(newChanges);
    if (newChanges.length === 0) {
      setFluidFinalResult(null);
    } else {
      recalculateFluid(newChanges);
    }
  };

  // 수액 재계산
  const recalculateFluid = (changes) => {
    if (!baseFluidData || changes.length === 0) return;

    const segments = [];
    let currentTime = 360; // 06:00
    let previousVolume = baseFluidData.baseFeeding;

    changes.forEach((change) => {
      const changeTime = change.timeMinutes < 360 ? change.timeMinutes + 1440 : change.timeMinutes;
      const duration = (changeTime - currentTime) / 60;

      const feedCount = FEED_TIMES.filter(ft => {
        const ftMin = ft < 6 ? (ft + 24) * 60 : ft * 60;
        return ftMin >= currentTime && ftMin < changeTime;
      }).length;

      const feedingInPeriod = previousVolume * feedCount;
      const effectiveFeeding = (baseFluidData.includeMl / baseFluidData.baseFeeding) * feedingInPeriod;
      const requiredInPeriod = (baseFluidData.totalRequired / 24) * duration;
      const fluidInPeriod = requiredInPeriod - effectiveFeeding;
      const fluidRate = duration > 0 ? fluidInPeriod / duration : 0;

      const startHour = Math.floor(currentTime / 60) % 24;
      const startMin = currentTime % 60;
      const endHour = Math.floor(changeTime / 60) % 24;
      const endMin = changeTime % 60;
      const isNight = (startHour >= 23 || startHour < 6);

      segments.push({
        start: `${String(startHour).padStart(2,'0')}:${String(startMin).padStart(2,'0')}`,
        end: `${String(endHour).padStart(2,'0')}:${String(endMin).padStart(2,'0')}`,
        fluidRate, isNight
      });

      currentTime = changeTime;
      previousVolume = change.volume;
    });

    // 마지막 구간
    const endTime = 360 + 1440;
    const duration = (endTime - currentTime) / 60;
    const feedCount = FEED_TIMES.filter(ft => {
      const ftMin = ft < 6 ? (ft + 24) * 60 : ft * 60;
      return ftMin >= currentTime && ftMin < endTime;
    }).length;

    const feedingInPeriod = previousVolume * feedCount;
    const effectiveFeeding = (baseFluidData.includeMl / baseFluidData.baseFeeding) * feedingInPeriod;
    const requiredInPeriod = (baseFluidData.totalRequired / 24) * duration;
    const fluidInPeriod = requiredInPeriod - effectiveFeeding;
    const fluidRate = duration > 0 ? fluidInPeriod / duration : 0;

    const startHour = Math.floor(currentTime / 60) % 24;
    const startMin = currentTime % 60;
    const isNight = (startHour >= 23 || startHour < 6);

    segments.push({
      start: `${String(startHour).padStart(2,'0')}:${String(startMin).padStart(2,'0')}`,
      end: '06:00',
      fluidRate, isNight
    });

    setFluidFinalResult(segments);
  };

  return (
    <div className="container">
      <header>
        <div className="header-icon">💉</div>
        <h1>수액량 계산기</h1>
      </header>

      <>

          <div className="card">
            <div className="input-group">
              <label>체중 <span className="label-badge">kg</span></label>
              <input
                type="number" step="0.01" inputMode="decimal"
                placeholder="예: 2.5"
                value={fluidWeight}
                onChange={(e) => setFluidWeight(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>체중당 수액량 <span className="label-badge">mL/kg/day</span></label>
              <input
                type="number" step="1" inputMode="numeric"
                placeholder="예: 150"
                value={fluidVolumePerKg}
                onChange={(e) => setFluidVolumePerKg(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>회당 기본 수유량 <span className="label-badge">mL</span></label>
              <input
                type="number" step="1" inputMode="numeric"
                placeholder="예: 40"
                value={fluidBaseFeeding}
                onChange={(e) => setFluidBaseFeeding(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>수유량 포함 방식</label>
              <div className="radio-group">
                <div className="radio-option">
                  <input type="radio" name="include_method" value="full" id="full"
                    checked={includeMethod === 'full'}
                    onChange={(e) => setIncludeMethod(e.target.value)}
                  />
                  <label htmlFor="full" className="radio-label">전체</label>
                </div>
                <div className="radio-option">
                  <input type="radio" name="include_method" value="half" id="half"
                    checked={includeMethod === 'half'}
                    onChange={(e) => setIncludeMethod(e.target.value)}
                  />
                  <label htmlFor="half" className="radio-label">반만</label>
                </div>
                <div className="radio-option">
                  <input type="radio" name="include_method" value="custom" id="custom"
                    checked={includeMethod === 'custom'}
                    onChange={(e) => setIncludeMethod(e.target.value)}
                  />
                  <label htmlFor="custom" className="radio-label">직접입력</label>
                </div>
              </div>
            </div>

            {includeMethod === 'custom' && (
              <div className="input-group">
                <label>수유량 중 포함량 <span className="label-badge">최대 {fluidBaseFeeding || 40}mL</span></label>
                <input
                  type="number" step="1" min="0" inputMode="numeric"
                  placeholder="예: 30"
                  value={customIncludeMl}
                  onChange={(e) => setCustomIncludeMl(e.target.value)}
                />
              </div>
            )}

            <button onClick={calculateBaseFluid}>💫 계산하기</button>
          </div>

          {fluidBaseResult && (
            <div className="result">
              <div className="result-header">
                <div className="result-title">기본 수액 계산 결과</div>
                <div className="result-value">{fluidBaseResult.fluidPerHour.toFixed(2)} mL/hr</div>
                <div className="result-subvalue">기본 수액 속도</div>
              </div>
              <div className="feed-list">
                <div className="feed-row">
                  <div className="feed-time">총 필요 수액량</div>
                  <div className="feed-volume">{fluidBaseResult.totalRequired.toFixed(0)} mL/day</div>
                </div>
                <div className="feed-row">
                  <div className="feed-time">하루 수유 총량</div>
                  <div className="feed-volume">{fluidBaseResult.totalFeeding.toFixed(0)} mL ({fluidBaseResult.baseFeeding}mL x 8회)</div>
                </div>
                <div className="feed-row">
                  <div className="feed-time">포함 방식</div>
                  <div className="feed-volume">{fluidBaseResult.feedingLabel}</div>
                </div>
                <div className="feed-row">
                  <div className="feed-time">실제 수유 적용량</div>
                  <div className="feed-volume">{fluidBaseResult.effectiveFeeding.toFixed(0)} mL/day</div>
                </div>
                <div className="feed-row">
                  <div className="feed-time">수액 보충량</div>
                  <div className="feed-volume">{fluidBaseResult.fluidSupply.toFixed(0)} mL/day</div>
                </div>
              </div>
            </div>
          )}

          {/* 수유량 변경 섹션 */}
          {fluidBaseResult && (
            <div className="card">
              <label style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', marginTop: 0 }}>수유량 변경</label>

              <div className="input-group">
                <label>변경 시각</label>
                <div className="time-group">
                  <select value={changeHour} onChange={(e) => setChangeHour(e.target.value)}>
                    <option value="">시</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, '0')}시</option>
                    ))}
                  </select>
                  <select value={changeMinute} onChange={(e) => setChangeMinute(e.target.value)}>
                    {[0, 10, 20, 30, 40, 50].map(min => (
                      <option key={min} value={min}>{String(min).padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>변경 후 수유량 <span className="label-badge">mL</span></label>
                <input
                  type="number" step="1" inputMode="numeric"
                  placeholder="예: 10"
                  value={changeVolume}
                  onChange={(e) => setChangeVolume(e.target.value)}
                />
              </div>

              <button className="fluid-btn-secondary" onClick={addChange}>➕ 변경 추가</button>

              {fluidChanges.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '15px', fontWeight: 700, marginTop: 0 }}>변경 내역</label>
                  {fluidChanges.map((change, index) => (
                    <div key={index} className="fluid-change-item">
                      <div className="fluid-change-info">
                        <div className="fluid-change-time">
                          {String(change.hour).padStart(2, '0')}:{String(change.minute).padStart(2, '0')}
                        </div>
                        <div className="fluid-change-volume">수유량: {change.volume} mL</div>
                      </div>
                      <button className="fluid-btn-danger" onClick={() => removeChange(index)}>삭제</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 구간별 수액 속도 결과 */}
          {fluidFinalResult && (
            <div className="result">
              <div className="result-header">
                <div className="result-title">구간별 수액 속도</div>
                <div className="result-value">{fluidFinalResult.length}구간</div>
                <div className="result-subvalue">수유량 변경 반영</div>
              </div>
              <div className="feed-list">
                {fluidFinalResult.map((seg, idx) => (
                  <div key={idx} className={`feed-row ${seg.isNight ? 'night' : ''}`}>
                    <div className="feed-time">
                      <span className="feed-icon">{seg.isNight ? '🌙' : '☀️'}</span>
                      {seg.start} ~ {seg.end}
                    </div>
                    <div className="feed-volume">{seg.fluidRate.toFixed(2)} mL/hr</div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </>
    </div>
  );
}

export default FluidCalculator;
