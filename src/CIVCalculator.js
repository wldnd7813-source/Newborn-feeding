import React, { useState } from 'react';

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

function CIVCalculator() {
  const [drugType, setDrugType] = useState('dopamine');
  const [civWeight, setCivWeight] = useState('');
  const [civDrugAmount, setCivDrugAmount] = useState('200');
  const [civDrugUnit, setCivDrugUnit] = useState('mg');
  const [civDrugMl, setCivDrugMl] = useState('5');
  const [civRatioDrug, setCivRatioDrug] = useState('1');
  const [civRatioDilution, setCivRatioDilution] = useState('9');
  const [civDose, setCivDose] = useState('');
  const [civResult, setCivResult] = useState(null);

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

  const setRatioPreset = (drugValue) => {
    setCivRatioDrug(String(drugValue));
    setCivRatioDilution(String(10 - drugValue));
  };

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

  const currentDrug = DRUG_DEFAULTS[drugType];

  return (
    <div className="container">
      <header>
        <div className="header-icon">💊</div>
        <h1>CIV 약물 계산기</h1>
      </header>

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
    </div>
  );
}

export default CIVCalculator;
