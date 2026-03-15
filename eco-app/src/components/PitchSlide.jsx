import { formatCO2, formatCurrency, formatPayback } from '../utils/calculations';

export default function PitchSlide({
  isOpen,
  onClose,
  facilityType,
  analysisYears,
  metrics,
  chartData,
  confidenceSummary,
  decisionDrivers = [],
}) {
  if (!isOpen) return null;

  const finalCumulative = chartData?.[chartData.length - 1]?.cumulativeSavings ?? 0;
  const roiPct = metrics.totalCapex > 0
    ? ((finalCumulative / metrics.totalCapex) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="pitch-overlay" onClick={onClose}>
      <div className="pitch-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pitch-header">
          <h2>Investor Pitch Preview</h2>
          <button className="btn-secondary" type="button" onClick={onClose}>Close</button>
        </div>

        <div className="pitch-subhead">
          <p>{facilityType} | {analysisYears}-year investment horizon</p>
          <button type="button" className="btn-primary" onClick={() => window.print()}>
            Print Slide
          </button>
        </div>

        <div className="pitch-highlight">
          <h3>CapEx to Cashflow Story</h3>
          <p>
            Break-even in <strong>{formatPayback(metrics.paybackYears)}</strong>, projected cumulative return
            of <strong> {formatCurrency(finalCumulative)}</strong>, and modeled ROI of <strong>{roiPct}%</strong>.
          </p>
        </div>

        <div className="pitch-grid">
          <div className="pitch-kpi">
            <span>Total CapEx</span>
            <strong>{formatCurrency(metrics.totalCapex)}</strong>
          </div>
          <div className="pitch-kpi">
            <span>Annual Net Savings</span>
            <strong>{formatCurrency(metrics.annualSavings)}</strong>
          </div>
          <div className="pitch-kpi">
            <span>Payback</span>
            <strong>{formatPayback(metrics.paybackYears)}</strong>
          </div>
          <div className="pitch-kpi">
            <span>CO2 Offset</span>
            <strong>{formatCO2(metrics.co2Offset)}</strong>
          </div>
        </div>

        <div className="pitch-grid">
          <div className="pitch-kpi">
            <span>P50 Payback</span>
            <strong>{formatPayback(confidenceSummary?.p50PaybackYears || metrics.paybackYears)}</strong>
          </div>
          <div className="pitch-kpi">
            <span>P90 Payback</span>
            <strong>{formatPayback(confidenceSummary?.p90PaybackYears || metrics.paybackYears)}</strong>
          </div>
          <div className="pitch-kpi">
            <span>Downside Probability</span>
            <strong>{(confidenceSummary?.downsideProbabilityPct || 0).toFixed(1)}%</strong>
          </div>
          <div className="pitch-kpi">
            <span>Policy Pack</span>
            <strong>{confidenceSummary?.policyPack?.label || 'Balanced Base'}</strong>
          </div>
        </div>

        <div className="pitch-conclusion">
          <h3>Executive Snapshot</h3>
          <p>
            Projected cumulative position by year {analysisYears}: <strong>{formatCurrency(finalCumulative)}</strong>.
            This scenario uses practical assumptions with degradation, O&M, and tariff movement.
          </p>
          <ul className="pitch-bullets">
            <li>Fast path to profitability with controlled deployment footprint.</li>
            <li>Transparent assumptions suitable for investor diligence review.</li>
            <li>Reusable scenario framework for expansion planning.</li>
          </ul>

          {decisionDrivers.length > 0 && (
            <ul className="pitch-bullets">
              {decisionDrivers.slice(0, 3).map((driver) => (
                <li key={driver.label}>
                  {driver.label}: {driver.paybackDeltaYears > 0 ? '+' : ''}{driver.paybackDeltaYears.toFixed(1)} yrs payback impact.
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
