function riskBand(score) {
  if (score <= 35) return 'Low';
  if (score <= 65) return 'Medium';
  return 'High';
}

export default function RiskHeatmap({ metrics = {} }) {
  const assumptions = metrics.assumptions || {};

  const riskRows = [
    {
      label: 'Recovery Risk',
      score: Math.min(100, Math.max(0, ((metrics.paybackYears || 0) / 15) * 100)),
    },
    {
      label: 'Tariff Exposure',
      score: Math.min(100, Math.max(0, 100 - (assumptions.selfConsumptionPct || 0))),
    },
    {
      label: 'Degradation Drift',
      score: Math.min(100, Math.max(0, ((assumptions.solarDegradationPct || 0) * 8) + ((assumptions.windCapacityFactorPct ? 100 - assumptions.windCapacityFactorPct : 0) * 0.5))),
    },
  ];

  return (
    <div className="risk-grid" role="table" aria-label="Risk heatmap">
      {riskRows.map((row) => {
        const band = riskBand(row.score);
        return (
          <div key={row.label} className="risk-cell" role="row">
            <div className="risk-meta">
              <span>{row.label}</span>
              <strong>{band}</strong>
            </div>
            <div className="risk-track">
              <div className={`risk-fill ${band.toLowerCase()}`} style={{ width: `${Math.round(row.score)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
