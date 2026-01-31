import React, { useState } from 'react';

// 약물 기본값
const DRUG_DEFAULTS = {
  dopamine: {
    amount: 200,
    unit: 'mg',
    ml: 5,
    ratioDrug: 1,
    presets: [
      { drug: 0.5, label: '0.5:9.5' },
      { drug: 1, label: '1:9' },
      { drug: 2, label: '2:8' }
    ],
    doseUnit: '(mcg/kg/min)'
  },
  fentanyl: {
    amount: 500,
    unit: 'mcg',
    ml: 10,
    ratioDrug: 2,
    presets: [
      { drug: 1, label: '1:9' },
      { drug: 2, label: '2:8' },
      { drug: 3, label: '3:7' }
    ],
    doseUnit: '(mcg/kg/min)'
  }
};

const FEED_TIMES = [7, 10, 13, 16, 19, 23, 2, 5];

function FluidCalculator() {
  const [activeTab, setActiveTab] = useState('civ');

  // CIV 상태
  const [drugType, setDrugType] = useState('dopamine');
  const [civWeight, setCivWeight] = useState('');
  const [civDrugAmount, setCivDrugAmount] = useState('200');
  const [civDrugUnit, setCivDrugUnit] = useState('mg');
  const [civDrugMl, setCivDrugMl] = useState('5');
  const [civRatioDrug, setCivRatioDrug] = useState('1');
  const [civRatioDilution, setCivRatioDilution] = useState('9');
  const [civDose, setCivDose] = useState('');
  const [civResult, setCivResult] = useState(null);

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

  // 약물 선택 변경
  const handleDrugChange = (type) => {
    const defaults = DRUG_DEFAULTS[type];
    setDrugType(type);
    setCivDrugAmount(String(defaults.amount));
    setCivDrugUnit(defaults.unit);
    setCivDrugMl(String(defaults.ml));
    setCivRatioDrug(String(defaults.ratioDrug));
    setCivRatioDilution(String(10 - defaults.ratioDrug));
    setCivResult(null);
  };

  // 비율 자동 조정
  const handleRatioChange = (value) => {
    const v = parseFloat(value) || 0;
    if (v > 10) {
      setCivRatioDrug('10');
      setCivRatioDilution('0');
    } else {
      setCivRatioDrug(value);
      setCivRatioDilution((10 - v).toFixed(1));
    }
  };

  // 비율 프리셋
  const setRatioPreset = (drugValue) => {
    setCivRatioDrug(String(drugValue));
    setCivRatioDilution(String(10 - drugValue));
  };

  // CIV 약물 계산
  const calculateCIV = () => {
    const weight = parseFloat(civWeight);
    const drugAmount = parseFloat(civDrugAmount);
    const drugMl = parseFloat(civDrugMl);
    const ratioDrug = parseFloat(civRatioDrug);
    const ratioDilution = parseFloat(civRatioDilution);
    const targetDose = parseFloat(civDose);

    if (!weight || !drugAmount || !drugMl || !targetDose) {
      alert('모든 값을 입력해주세요.');
      return;
    }

    const stockConc = drugAmount / drugMl;
    const finalConc = stockConc * (ratioDrug / 10);

    let pumpRate;
    if (civDrugUnit === 'mg') {
      const targetDoseMg = targetDose / 1000;
      const requiredDrugMgMin = targetDoseMg * weight;
      pumpRate = (requiredDrugMgMin / finalConc) * 60;
    } else {
      const requiredDrugMcgMin = targetDose * weight;
      pumpRate = (requiredDrugMcgMin / finalConc) * 60;
    }

    const drugPerHour = (targetDose * weight * 60) / (civDrugUnit === 'mg' ? 1000 : 1);

    setCivResult({
      stockConc,
      ratioDrug,
      ratioDilution,
      finalConc,
      pumpRate,
      drugPerHour,
      unit: civDrugUnit
    });
  };

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

  const currentDrug = DRUG_DEFAULTS[drugType];

  return (
    <div className="container">
      <header>
        <div className="header-icon">💉</div>
        <h1>수액량 계산기</h1>
      </header>

      {/* 탭 */}
      <div className="fluid-tabs">
        <button
          className={`fluid-tab ${activeTab === 'civ' ? 'active' : ''}`}
          onClick={() => setActiveTab('civ')}
        >
          CIV 약물
        </button>
        <button
          className={`fluid-tab ${activeTab === 'fluid' ? 'active' : ''}`}
          onClick={() => setActiveTab('fluid')}
        >
          수액보완
        </button>
      </div>

      {/* CIV 약물 탭 */}
      {activeTab === 'civ' && (
        <>
          <div className="card">
            <div className="input-group">
              <label>약물 선택</label>
              <select value={drugType} onChange={(e) => handleDrugChange(e.target.value)}>
                <option value="dopamine">Dopamine</option>
                <option value="fentanyl">Fentanyl</option>
              </select>
            </div>

            <div className="input-group">
              <label>체중 <span className="label-badge">kg</span></label>
              <input
                type="number" step="0.01" inputMode="decimal"
                placeholder="예: 2.5"
                value={civWeight}
                onChange={(e) => setCivWeight(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>원액 농도</label>
              <div className="fluid-input-row">
                <input
                  type="number" step="1" inputMode="numeric"
                  placeholder="약물량"
                  value={civDrugAmount}
                  onChange={(e) => setCivDrugAmount(e.target.value)}
                />
                <select value={civDrugUnit} onChange={(e) => setCivDrugUnit(e.target.value)}>
                  <option value="mg">mg</option>
                  <option value="mcg">mcg</option>
                </select>
                <span className="fluid-divider">/</span>
                <input
                  type="number" step="0.1" inputMode="decimal"
                  placeholder="mL"
                  value={civDrugMl}
                  onChange={(e) => setCivDrugMl(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>희석 비율 <span className="label-badge">합계 10</span></label>
              <div className="fluid-ratio-row">
                <input
                  type="number" step="0.5" inputMode="decimal"
                  placeholder="원액"
                  value={civRatioDrug}
                  onChange={(e) => handleRatioChange(e.target.value)}
                />
                <span className="fluid-ratio-colon">:</span>
                <input
                  type="number" readOnly
                  value={civRatioDilution}
                  style={{ background: '#E1E8ED' }}
                />
              </div>
              <div className="fluid-preset-buttons">
                {currentDrug.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    className="fluid-preset-btn"
                    onClick={() => setRatioPreset(preset.drug)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label>목표 투여량 <span className="label-badge">{currentDrug.doseUnit}</span></label>
              <input
                type="number" step="0.1" inputMode="decimal"
                placeholder="예: 5"
                value={civDose}
                onChange={(e) => setCivDose(e.target.value)}
              />
            </div>

            <button onClick={calculateCIV}>💫 계산하기</button>
          </div>

          {civResult && (
            <div className="result">
              <div className="result-header">
                <div className="result-title">CIV 약물 계산 결과</div>
                <div className="result-value">{civResult.pumpRate.toFixed(2)} mL/hr</div>
                <div className="result-subvalue">펌프 속도</div>
              </div>
              <div className="feed-list">
                <div className="feed-row">
                  <div className="feed-time">원액 농도</div>
                  <div className="feed-volume">{civResult.stockConc.toFixed(civResult.unit === 'mg' ? 1 : 0)} {civResult.unit}/mL</div>
                </div>
                <div className="feed-row">
                  <div className="feed-time">희석 비율</div>
                  <div className="feed-volume">{civResult.ratioDrug} : {civResult.ratioDilution}</div>
                </div>
                <div className="feed-row">
                  <div className="feed-time">최종 농도</div>
                  <div className="feed-volume">{civResult.finalConc.toFixed(civResult.unit === 'mg' ? 3 : 2)} {civResult.unit}/mL</div>
                </div>
                <div className="feed-row">
                  <div className="feed-time">시간당 약물량</div>
                  <div className="feed-volume">{civResult.drugPerHour.toFixed(civResult.unit === 'mg' ? 3 : 2)} {civResult.unit}/hr</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 수액보완 탭 */}
      {activeTab === 'fluid' && (
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
      )}
    </div>
  );
}

export default FluidCalculator;
