import React, { useState } from 'react';

const DRUGS = [
  {
    key: 'dopa', name: 'Dopamine', unit: 'mcg/kg/min', color: 'amber',
    doses: [1, 2, 2.5, 3, 4, 5, 7.5, 10, 12.5, 15, 17.5, 20],
    coeff: 0.0075, defaultFactor: 1,
    type: 'standard',
  },
  {
    key: 'dobu', name: 'Dobuject', unit: 'mcg/kg/min', color: 'amber',
    doses: [1, 2, 2.5, 3, 4, 5, 7.5, 10, 12.5, 15, 17.5, 20],
    coeff: 0.012, defaultFactor: 1,
    type: 'standard',
  },
  {
    key: 'fenta', name: 'Fentanyl', unit: 'mcg/kg/hr', color: 'purple',
    doses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    coeff: 0.1, defaultFactor: 1,
    type: 'standard',
  },
  {
    key: 'mida', name: 'Midazolam', unit: 'mcg/kg/min', color: 'amber',
    doses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    coeff: 0.06, defaultFactor: 1,
    type: 'standard',
  },
  {
    key: 'epi', name: 'Epinephrine', unit: 'mcg/kg/min', color: 'amber',
    doses: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    coeff: 0.6, defaultFactor: 1,
    type: 'standard',
  },
  {
    key: 'primacor', name: 'Primacor', unit: 'mcg/kg/min', color: 'amber',
    type: 'primacor',
  },
  {
    key: 'eglandin', name: 'Eglandin', unit: 'ng/kg/min', color: 'teal',
    doses: [1, 2, 3, 4, 5],
    defaultFactor: 1,
    type: 'eglandin',
  },
  {
    key: 'ri', name: 'Continuous RI Module', unit: '', color: 'blue',
    type: 'ri',
  },
];

const FACTOR_OPTIONS = [0.5, 1, 2, 3, 4, 5];


function CIVCalculator() {
  const [weight, setWeight] = useState('');
  const [selectedDrug, setSelectedDrug] = useState('dopa');
  const [factor, setFactor] = useState(1);
  const [priMix, setPriMix] = useState('1:4');
  const [riGIR, setRiGIR] = useState('6');
  const [riRatio, setRiRatio] = useState(6);

  const w = parseFloat(weight) || 0;
  const r2 = (v) => (Math.round(v * 100) / 100).toFixed(2);

  const drug = DRUGS.find(d => d.key === selectedDrug);

  const handleDrugChange = (key) => {
    setSelectedDrug(key);
    const d = DRUGS.find(x => x.key === key);
    setFactor(d?.defaultFactor || 1);
  };

  const renderOptions = () => {
    if (!drug) return null;

    if (drug.type === 'standard' || drug.type === 'eglandin') {
      return (
        <div className="civ2-option-group">
          <label className="civ2-option-label">희석 배수</label>
          <div className="civ2-factor-row">
            {FACTOR_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`civ2-factor-btn${factor === opt ? ' active' : ''}${opt === (drug.defaultFactor || 1) ? ' base' : ''}`}
                onClick={() => setFactor(opt)}
              >
                ×{opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (drug.type === 'primacor') {
      return (
        <div className="civ2-option-group">
          <label className="civ2-option-label">Mix 비율</label>
          <div className="civ2-factor-row">
            <button
              className={`civ2-factor-btn base${priMix === '1:4' ? ' active' : ''}`}
              onClick={() => setPriMix('1:4')}
            >
              1:4
            </button>
            <button
              className={`civ2-factor-btn${priMix === '1:9' ? ' active' : ''}`}
              onClick={() => setPriMix('1:9')}
            >
              1:9
            </button>
          </div>
        </div>
      );
    }

    if (drug.type === 'ri') {
      return (
        <div className="civ2-ri-options">
          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label>GIR <span className="label-badge">mg/kg/min</span></label>
            <input
              type="number" step="0.5" min="0" max="20" inputMode="decimal"
              placeholder="예: 6"
              value={riGIR}
              onChange={(e) => setRiGIR(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Glu : RI 비율</label>
            <input
              type="number" step="1" min="1" max="12" inputMode="numeric"
              placeholder="예: 6"
              value={riRatio}
              onChange={(e) => setRiRatio(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTable = () => {
    if (!w) return null;

    if (drug.type === 'standard') {
      return (
        <div className="result">
          <div className="result-header">
            <div className="result-title">{drug.name} 속도표</div>
            <div className="result-subvalue">희석 배수 ×{factor} 기준</div>
          </div>
          <div className="feed-list">
            <div className="feed-row" style={{ background: '#F5F7FA' }}>
              <div className="feed-time" style={{ fontWeight: 700 }}>Dose ({drug.unit})</div>
              <div className="feed-volume" style={{ fontWeight: 700 }}>cc/hr</div>
            </div>
            {drug.doses.map(d => (
              <div key={d} className="feed-row">
                <div className="feed-time">{d}</div>
                <div className={`feed-volume civ2-result-val civ2-val-${drug.color}`}>
                  {r2(drug.coeff * w * d * factor)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (drug.type === 'eglandin') {
      return (
        <div className="result">
          <div className="result-header">
            <div className="result-title">Eglandin 속도표</div>
            <div className="result-subvalue">희석 배수 ×{factor} 기준</div>
          </div>
          <div className="feed-list">
            <div className="feed-row" style={{ background: '#F5F7FA' }}>
              <div className="feed-time" style={{ fontWeight: 700 }}>Dose (ng/kg/min)</div>
              <div className="feed-volume" style={{ fontWeight: 700 }}>cc/hr</div>
            </div>
            {drug.doses.map(d => (
              <div key={d} className="feed-row">
                <div className="feed-time">{d}</div>
                <div className="feed-volume civ2-result-val civ2-val-teal">
                  {r2(2 * d * w * 60 / 1000 * factor)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (drug.type === 'primacor') {
      const is14 = priMix === '1:4';
      return (
        <div className="result">
          <div className="result-header">
            <div className="result-title">Primacor 속도표</div>
            <div className="result-subvalue">{priMix} mix 기준</div>
          </div>
          <div className="feed-list">
            <div className="feed-row" style={{ background: '#F5F7FA' }}>
              <div className="feed-time" style={{ fontWeight: 700 }}>Dose (mcg/kg/min)</div>
              <div className="feed-volume" style={{ fontWeight: 700 }}>cc/hr</div>
            </div>
            <div className="feed-row">
              <div className="feed-time">0.5</div>
              <div className="feed-volume civ2-result-val civ2-val-amber">
                {r2(is14 ? 0.15 * w : 0.15 * 2.25 * w)}
              </div>
            </div>
            <div className="feed-row">
              <div className="feed-time">0.75</div>
              <div className="feed-volume civ2-result-val civ2-val-amber">
                {r2(is14 ? 0.22 * w : 0.22 * 2.25 * w)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (drug.type === 'ri') {
      const gluGday = (parseFloat(riGIR) || 0) * 60 * 24 / 1000 * w;
      const riRatioNum = parseInt(riRatio) || 1;
      return (
        <div className="result">
          <div className="result-header">
            <div className="result-title">RI 계산 결과</div>
            <div className="result-value">{r2(gluGday)} g/day</div>
            <div className="result-subvalue">Glucose 투여량</div>
          </div>
          <div className="feed-list">
            <div className="feed-row" style={{ background: '#F5F7FA' }}>
              <div className="feed-time" style={{ fontWeight: 700 }}>RI 농도 · {riRatioNum}:1 기준</div>
              <div className="feed-volume" style={{ fontWeight: 700 }}>cc/hr</div>
            </div>
            {[0.25, 0.5, 1].map(conc => (
              <div key={conc} className="feed-row">
                <div className="feed-time">{conc} IU/mL</div>
                <div className="feed-volume civ2-result-val civ2-val-blue">
                  {r2(gluGday / riRatioNum / conc / 24)}
                </div>
              </div>
            ))}
          </div>
          <div className="feed-list" style={{ marginTop: '12px' }}>
            <div className="feed-row" style={{ background: '#F5F7FA' }}>
              <div className="feed-time" style={{ fontWeight: 700 }}>Glu:RI 비율 · 0.5 IU/mL 기준</div>
              <div className="feed-volume" style={{ fontWeight: 700 }}>cc/hr</div>
            </div>
            {[1, 2, 4, 6, 8, 10, 12].map(rt => (
              <div
                key={rt}
                className={`feed-row${rt === riRatioNum ? ' civ2-row-active' : ''}`}
                onClick={() => setRiRatio(rt)}
                style={{ cursor: 'pointer' }}
              >
                <div className="feed-time">{rt} : 1</div>
                <div className={`feed-volume civ2-result-val${rt === riRatioNum ? ' civ2-val-active' : ' civ2-val-blue'}`}>
                  {r2(gluGday / rt / 0.5 / 24)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container">
      <header>
        <div className="header-icon">💊</div>
        <h1>CIV 약물 계산기</h1>
      </header>

      <div className="card">
        {/* 체중 입력 */}
        <div className="input-group">
          <label>체중 <span className="label-badge">kg</span></label>
          <input
            type="number" step="0.01" inputMode="decimal"
            placeholder="예: 1.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        {/* 약물 선택 */}
        <div className="input-group" style={{ marginBottom: '8px' }}>
          <label>약물 선택</label>
          <div className="civ2-drug-grid">
            {DRUGS.map(d => (
              <button
                key={d.key}
                className={`civ2-drug-btn${selectedDrug === d.key ? ' active' : ''}`}
                onClick={() => handleDrugChange(d.key)}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* 약물별 옵션 */}
        {renderOptions()}
      </div>

      {/* 결과 테이블 */}
      {renderTable()}

      <div className="civ-footer">
        ※ 본 계산기는 임상 참고용입니다. 투약 전 반드시 처방 및 프로토콜을 확인하세요.
      </div>
    </div>
  );
}

export default CIVCalculator;
