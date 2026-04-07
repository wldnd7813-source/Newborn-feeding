import React, { useState } from 'react';

const WEIGHT_PRESETS = [0.5, 0.8, 1.0, 1.5, 2.0, 3.0];
const FACTOR_OPTIONS = [0.5, 1, 2, 3, 4, 5];

const DRUGS = [
  {
    key: 'dopa', name: 'Dopamine', unit: 'mcg/kg/min', color: 'amber',
    doses: [1, 2, 2.5, 3, 4, 5, 7.5, 10, 12.5, 15, 17.5, 20],
    coeff: 0.0075, defaultFactor: 1,
  },
  {
    key: 'dobu', name: 'Dobuject', unit: 'mcg/kg/min', color: 'amber',
    doses: [1, 2, 2.5, 3, 4, 5, 7.5, 10, 12.5, 15, 17.5, 20],
    coeff: 0.012, defaultFactor: 1,
  },
  {
    key: 'fenta', name: 'Fentanyl', unit: 'mcg/kg/hr', color: 'purple',
    doses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    coeff: 0.1, defaultFactor: 1,
  },
  {
    key: 'mida', name: 'Midazolam', unit: 'mcg/kg/min', color: 'amber',
    doses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    coeff: 0.06, defaultFactor: 1,
  },
  {
    key: 'epi', name: 'Epinephrine', unit: 'mcg/kg/min', color: 'amber',
    doses: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    coeff: 0.6, defaultFactor: 1,
  },
];

function CIVCalculator() {
  const [weight, setWeight] = useState('1.0');
  const [factors, setFactors] = useState({ dopa: 1, dobu: 1, fenta: 1, mida: 1, epi: 1, eglandin: 1 });
  const [priMix, setPriMix] = useState('1:4');
  const [riGIR, setRiGIR] = useState('6');
  const [riRatio, setRiRatio] = useState(6);

  const w = parseFloat(weight) || 1.0;
  const r2 = (v) => (Math.round(v * 100) / 100).toFixed(2);

  const setFactor = (key, val) => setFactors(prev => ({ ...prev, [key]: val }));

  const DrugCard = ({ drug }) => {
    const h = factors[drug.key];
    return (
      <div className="civ-card">
        <div className="civ-card-head">
          <div>
            <div className="civ-drug-name">{drug.name}</div>
            <div className="civ-drug-meta">×{h} 희석</div>
          </div>
          <span className={`civ-badge civ-badge-${drug.color}`}>{drug.unit}</span>
        </div>
        <div className="civ-mix-row">
          {FACTOR_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`civ-mix-btn${opt === drug.defaultFactor ? ' base' : ''}${h === opt ? ' active' : ''}`}
              onClick={() => setFactor(drug.key, opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <table className="civ-dose-table">
          <thead>
            <tr><th>Dose</th><th>cc/hr</th></tr>
          </thead>
          <tbody>
            {drug.doses.map(d => (
              <tr key={d}>
                <td>{d}</td>
                <td className={`civ-hl-${drug.color}`}>{r2(drug.coeff * w * d * h)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const PrimacorCard = () => {
    const is14 = priMix === '1:4';
    return (
      <div className="civ-card">
        <div className="civ-card-head">
          <div>
            <div className="civ-drug-name">Primacor</div>
            <div className="civ-drug-meta">{priMix} mix</div>
          </div>
          <span className="civ-badge civ-badge-amber">mcg/kg/min</span>
        </div>
        <div className="civ-mix-row">
          <button className={`civ-mix-btn base${is14 ? ' active' : ''}`} onClick={() => setPriMix('1:4')}>1:4</button>
          <button className={`civ-mix-btn${!is14 ? ' active' : ''}`} onClick={() => setPriMix('1:9')}>1:9</button>
        </div>
        <table className="civ-dose-table">
          <thead><tr><th>Dose</th><th>cc/hr</th></tr></thead>
          <tbody>
            <tr>
              <td>0.5</td>
              <td className="civ-hl-amber">{r2(is14 ? 0.15 * w : 0.15 * 2.25 * w)}</td>
            </tr>
            <tr>
              <td>0.75</td>
              <td className="civ-hl-amber">{r2(is14 ? 0.22 * w : 0.22 * 2.25 * w)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const EglandinCard = () => {
    const h = factors.eglandin;
    return (
      <div className="civ-card">
        <div className="civ-card-head">
          <div>
            <div className="civ-drug-name">Eglandin</div>
            <div className="civ-drug-meta">×{h} 희석</div>
          </div>
          <span className="civ-badge civ-badge-teal">ng/kg/min</span>
        </div>
        <div className="civ-mix-row">
          {FACTOR_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`civ-mix-btn${opt === 1 ? ' base' : ''}${h === opt ? ' active' : ''}`}
              onClick={() => setFactor('eglandin', opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <table className="civ-dose-table">
          <thead><tr><th>Dose</th><th>cc/hr</th></tr></thead>
          <tbody>
            {[1, 2, 3, 4, 5].map(d => (
              <tr key={d}>
                <td>{d}</td>
                <td className="civ-hl-teal">{r2(2 * d * w * 60 / 1000 * h)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const gluGday = (parseFloat(riGIR) || 0) * 60 * 24 / 1000 * w;
  const riRatioNum = parseInt(riRatio) || 1;

  return (
    <div className="civ-outer">
      {/* 상단 체중 입력바 */}
      <div className="civ-weight-bar">
        <div className="civ-weight-bar-inner">
          <span className="civ-weight-label">기준 체중</span>
          <div className="civ-weight-input-wrap">
            <input
              className="civ-weight-input"
              type="number"
              value={weight}
              min="0.1" max="10" step="0.01"
              onChange={(e) => setWeight(e.target.value)}
              inputMode="decimal"
            />
            <span className="civ-weight-unit">kg</span>
          </div>
          <div className="civ-weight-presets">
            {WEIGHT_PRESETS.map(p => (
              <button
                key={p}
                className={`civ-preset${Math.abs(w - p) < 0.001 ? ' active' : ''}`}
                onClick={() => setWeight(String(p))}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="civ-main">
        {/* 약물 섹션 */}
        <div className="civ-section-label">승압제 · 진통제 · 진정제</div>
        <div className="civ-drug-grid">
          {DRUGS.map(drug => <DrugCard key={drug.key} drug={drug} />)}
          <PrimacorCard />
          <EglandinCard />
        </div>

        {/* RI 모듈 */}
        <div className="civ-section-label">Continuous RI Module</div>
        <div className="civ-ri-card">
          <div className="civ-ri-inputs">
            <div className="civ-ri-field">
              <label>GIR (mg/kg/min)</label>
              <input
                type="number" value={riGIR} min="0" max="20" step="0.5"
                onChange={(e) => setRiGIR(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="civ-ri-field">
              <label>Glu : RI 비율</label>
              <input
                type="number" value={riRatio} min="1" max="12" step="1"
                onChange={(e) => setRiRatio(parseInt(e.target.value) || 1)}
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="civ-ri-glu">
            <span className="civ-ri-glu-label">Glucose</span>
            <span className="civ-ri-glu-val">{r2(gluGday)}</span>
            <span className="civ-ri-glu-unit">g/day</span>
          </div>
          <div className="civ-ri-section-title">RI 농도별 속도 · {riRatioNum}:1 (Glu:RI) 기준</div>
          <table className="civ-dose-table civ-ri-table">
            <thead><tr><th>RI 농도</th><th>cc/hr</th></tr></thead>
            <tbody>
              {[0.25, 0.5, 1].map(conc => (
                <tr key={conc}>
                  <td>{conc} IU/mL</td>
                  <td className="civ-hl-blue">{r2(gluGday / riRatioNum / conc / 24)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="civ-divider" />
          <div className="civ-ri-section-title">Glu:RI 비율별 속도 · 0.5 IU/mL 기준</div>
          <table className="civ-dose-table civ-ri-table">
            <thead><tr><th>Glu : RI</th><th>cc/hr</th></tr></thead>
            <tbody>
              {[1, 2, 4, 6, 8, 10, 12].map(rt => (
                <tr key={rt} onClick={() => setRiRatio(rt)} style={{ cursor: 'pointer' }}>
                  <td className={rt === riRatioNum ? 'civ-hl-active' : ''}>{rt} : 1</td>
                  <td className={rt === riRatioNum ? 'civ-hl-active' : 'civ-hl-blue'}>{r2(gluGday / rt / 0.5 / 24)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="civ-footer">
          ※ 본 계산기는 임상 참고용입니다. 투약 전 반드시 처방 및 프로토콜을 확인하세요.
        </div>
      </div>
    </div>
  );
}

export default CIVCalculator;
