import { useLocation, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPayback, formatCO2, CONFIG } from '../utils/calculations';
import '../styles/report.css';

export default function ReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state || {
    facilityType: 'Corporate IT Park',
    infrastructureStatus: 'New Construction',
    roofSpace: 25000,
    solarAllocation: 60,
    windTurbines: 15,
    annualGridConsumptionKwh: 240000,
    analysisYears: 15,
    metrics: {
      totalCapex: 0,
      annualSavings: 0,
      paybackYears: 0,
      co2Offset: 0,
    },
    chartData: [],
    confidenceSummary: {
      simulations: 0,
      p50PaybackYears: 0,
      p90PaybackYears: 0,
      downsideProbabilityPct: 0,
      policyPack: { label: 'Balanced Base' },
    },
    decisionDrivers: [],
  };

  const handlePrint = () => {
    window.print();
  };

  const facilityLabelMap = {
    corporate: 'Corporate IT Park',
    government: 'Government Complex',
    manufacturing: 'Manufacturing Hub',
    heritage: 'Heritage Building',
    household: 'Household Community',
    hospitals: 'Hospitals',
  };

  const facilityDisplay = facilityLabelMap[data.facilityType] || data.facilityType;
  const projectionYears = Number.isFinite(data.analysisYears)
    ? data.analysisYears
    : Math.max((data.chartData?.length || 1) - 1, 1);
  const finalPeriodCumulative = data.chartData?.[data.chartData.length - 1]?.cumulativeSavings ?? 0;
  const assumptions = data.metrics?.assumptions || {};
  const billImpact = data.metrics?.billImpact || {};
  const confidenceSummary = data.confidenceSummary || {};
  const decisionDrivers = data.decisionDrivers || [];

  const handleBackToCalculator = () => {
    navigate('/calculator', {
      state: {
        restoredCalculation: {
          facilityType: data.facilityType,
          infrastructureStatus: data.infrastructureStatus,
          roofSpace: data.roofSpace,
          solarAllocation: data.solarAllocation,
          windTurbines: data.windTurbines,
          annualGridConsumptionKwh: data.annualGridConsumptionKwh,
          analysisYears: data.analysisYears,
          policyPackId: data.policyPackId,
        },
      },
    });
  };

  return (
    <div className="report-page">
      <div className="report-toolbar">
        <button onClick={handleBackToCalculator} className="btn-secondary">
          ← Back to Calculator
        </button>
        <button onClick={handlePrint} className="btn-primary">
          📄 Print / Export PDF
        </button>
      </div>

      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div className="logo-section">
            <div className="logo-box">⚡</div>
            <h1>
              Urja <span style={{ color: '#F5C542' }} aria-hidden="true">✦</span>
            </h1>
            <p className="report-subtitle">
              Investor ROI Analysis & Financial Projection Report
            </p>
          </div>
          <div className="report-date">
            Generated: {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>

        {/* Project Summary */}
        <div className="report-section">
          <h2 className="section-heading">Project Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Facility Type</label>
              <value>{facilityDisplay}</value>
            </div>
            <div className="summary-item">
              <label>Infrastructure Status</label>
              <value>{data.infrastructureStatus === 'new' ? 'New Construction' : 'Retrofit (cost uplift included)'}</value>
            </div>
            <div className="summary-item">
              <label>Usable Roof Space</label>
              <value>{data.roofSpace.toLocaleString('en-IN')} sq ft</value>
            </div>
            <div className="summary-item">
              <label>Solar Allocation</label>
              <value>{data.solarAllocation}%</value>
            </div>
            <div className="summary-item">
              <label>Micro-Wind Turbines</label>
              <value>{data.windTurbines} units</value>
            </div>
            <div className="summary-item">
              <label>Grid Tariff Assumption</label>
              <value>₹{(assumptions.gridTariff || 8.5).toFixed(2)}/kWh</value>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2 className="section-heading">Model Assumptions</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Export Tariff</label>
              <value>₹{(assumptions.exportTariff || 3.2).toFixed(2)}/kWh</value>
            </div>
            <div className="summary-item">
              <label>Tariff Escalation</label>
              <value>{(assumptions.tariffEscalationPct || 4).toFixed(1)}% yearly</value>
            </div>
            <div className="summary-item">
              <label>O&amp;M Escalation</label>
              <value>{(assumptions.opexEscalationPct || 5).toFixed(1)}% yearly</value>
            </div>
            <div className="summary-item">
              <label>Self Consumption</label>
              <value>{(assumptions.selfConsumptionPct || 75).toFixed(0)}%</value>
            </div>
            <div className="summary-item">
              <label>Policy Pack</label>
              <value>{confidenceSummary.policyPack?.label || assumptions.policyPackLabel || 'Balanced Base'}</value>
            </div>
            <div className="summary-item">
              <label>Solar Specific Yield</label>
              <value>{Math.round(assumptions.solarSpecificYield || 1420)} kWh/kW/yr</value>
            </div>
            <div className="summary-item">
              <label>Wind Capacity Factor</label>
              <value>{(assumptions.windCapacityFactorPct || 17).toFixed(1)}%</value>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2 className="section-heading">Confidence Summary</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <label>P50 Payback</label>
              <value className="metric-value">{formatPayback(confidenceSummary.p50PaybackYears || data.metrics.paybackYears)}</value>
              <description>Expected outcome</description>
            </div>
            <div className="metric-card">
              <label>P90 Payback</label>
              <value className="metric-value">{formatPayback(confidenceSummary.p90PaybackYears || data.metrics.paybackYears)}</value>
              <description>Conservative outcome</description>
            </div>
            <div className="metric-card">
              <label>Downside Probability</label>
              <value className="metric-value">{(confidenceSummary.downsideProbabilityPct || 0).toFixed(1)}%</value>
              <description>Chance of negative cumulative position</description>
            </div>
            <div className="metric-card">
              <label>Simulation Runs</label>
              <value className="metric-value">{confidenceSummary.simulations || 0}</value>
              <description>Monte Carlo trials</description>
            </div>
          </div>
        </div>

        {/* Financial Analysis */}
        <div className="report-section">
          <h2 className="section-heading">Financial Analysis</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <label>Total Capital Expenditure</label>
              <value className="metric-value">{formatCurrency(data.metrics.totalCapex)}</value>
              <description>One-time installation cost</description>
            </div>
            <div className="metric-card">
              <label>Annual Energy Savings</label>
              <value className="metric-value">{formatCurrency(data.metrics.annualSavings)}</value>
              <description>Grid electricity cost reduction</description>
            </div>
            <div className="metric-card">
              <label>Payback Period</label>
              <value className="metric-value">{formatPayback(data.metrics.paybackYears)}</value>
              <description>Break-even timeline</description>
            </div>
            <div className="metric-card">
              <label>Annual CO₂ Offset</label>
              <value className="metric-value">{formatCO2(data.metrics.co2Offset)}</value>
              <description>Carbon reduction</description>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h2 className="section-heading">Electricity Bill Comparison</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <label>Current Annual Bill</label>
              <value className="metric-value">{formatCurrency(billImpact.baselineAnnualBill || 0)}</value>
              <description>Before renewable deployment</description>
            </div>
            <div className="metric-card">
              <label>Post-Install Annual Bill</label>
              <value className="metric-value">{formatCurrency(billImpact.postInstallAnnualBillNet || 0)}</value>
              <description>After self-consumption and export credits</description>
            </div>
            <div className="metric-card">
              <label>Annual Bill Savings</label>
              <value className="metric-value">{formatCurrency(billImpact.annualBillSavings || 0)}</value>
              <description>Direct year-1 bill reduction</description>
            </div>
            <div className="metric-card">
              <label>Bill Reduction</label>
              <value className="metric-value">{(billImpact.billReductionPct || 0).toFixed(1)}%</value>
              <description>Relative to current bill profile</description>
            </div>
          </div>
          <p className="report-note">
            Baseline consumption: {(assumptions.annualGridConsumptionKwh || data.annualGridConsumptionKwh || CONFIG.MIN_ANNUAL_GRID_CONSUMPTION_KWH).toLocaleString('en-IN')} kWh/year.
          </p>
        </div>

        {/* Projection */}
        <div className="report-section">
          <h2 className="section-heading">{projectionYears}-Year Cumulative Cash Flow Projection</h2>

          {/* Chart */}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(22, 163, 74, 0.2)" />
                <XAxis dataKey="year" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '2px solid #16A34A',
                    borderRadius: '0.5rem',
                    color: '#e0e0e0',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeSavings"
                  stroke="#16A34A"
                  strokeWidth={3}
                  dot={{ fill: '#16A34A', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Cumulative Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="projection-table-wrapper">
            <table className="projection-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Cumulative Savings (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.chartData.map((row, idx) => {
                  const isProfitable = row.cumulativeSavings >= 0;
                  return (
                    <tr key={idx} className={isProfitable ? 'profitable' : 'in-investment'}>
                      <td>{row.year}</td>
                      <td>{formatCurrency(row.cumulativeSavings)}</td>
                      <td>{isProfitable ? '✓ Profitable' : '⊘ Investment'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="report-section">
          <h2 className="section-heading">Key Insights</h2>
          <div className="insights-list">
            <div className="insight-item">
              <div className="insight-icon">💡</div>
              <div>
                <h4>Break-Even Achievement</h4>
                <p>Your installation will break even in approximately {formatPayback(data.metrics.paybackYears)}, after which savings are pure profit.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🌍</div>
              <div>
                <h4>Environmental Impact</h4>
                <p>Annually, you will offset {formatCO2(data.metrics.co2Offset)} of CO₂, equivalent to planting ~500 trees per year.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">📈</div>
              <div>
                <h4>Long-Term Value</h4>
                <p>At year {projectionYears}, modeled cumulative cash position is {formatCurrency(finalPeriodCumulative)} after accounting for O&amp;M, degradation, and tariff movement.</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon">🧭</div>
              <div>
                <h4>Top Drivers</h4>
                {decisionDrivers.length > 0 ? (
                  <ul className="report-driver-list">
                    {decisionDrivers.slice(0, 3).map((driver) => (
                      <li key={driver.label}>
                        <span>{driver.label}</span>
                        <strong>
                          {driver.paybackDeltaYears > 0 ? '+' : ''}
                          {driver.paybackDeltaYears.toFixed(1)} yrs payback, {formatCurrency(driver.annualSavingsDelta)} savings delta
                        </strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Driver analysis unavailable for this run.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p>
            This report is generated by <strong>Urja</strong> ROI Calculator.
            Calculations include self-consumption/export split, yearly tariff escalation,
            annual equipment degradation, and O&amp;M escalation for practical investment screening.
          </p>
          <p className="disclaimer">
            Disclaimer: This report is for informational purposes only. Actual results may vary based on
            weather conditions, equipment efficiency, and tariff rate changes. Consult with energy
            professionals before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
