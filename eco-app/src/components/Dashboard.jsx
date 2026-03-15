import { useEffect, useRef, useState } from 'react';
import KPICard from './KPICard';
import BreakEvenChart from './BreakEvenChart';
import AssumptionChips from './AssumptionChips';
import SensitivityChart from './SensitivityChart';
import RiskHeatmap from './RiskHeatmap';
import WhatIfAssistant from './WhatIfAssistant';
import { formatCurrency, formatPayback, formatCO2 } from '../utils/calculations';

export default function Dashboard({
  metrics,
  chartData,
  periodYears = 10,
  comparisonScenarios = [],
  insight,
  confidenceSummary,
  decisionDrivers = [],
  currentScenario,
  onApplyAssistantRecommendation,
  onClearComparison,
  onOpenPitch,
}) {
  const [activeTab, setActiveTab] = useState('insights');
  const [showConfidencePanel, setShowConfidencePanel] = useState(false);
  const [tabSwitchValue, setTabSwitchValue] = useState('');
  const touchStartX = useRef(null);
  const tabs = ['insights', 'scenario', 'risk'];
  const TAB_LABELS = {
    insights: 'Insights',
    scenario: 'Lab',
    risk: 'Risk',
  };

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab('insights');
    }
  }, [activeTab, tabs]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches?.[0]?.clientX ?? null;
    if (endX === null) return;

    const delta = endX - touchStartX.current;
    const swipeThreshold = 40;
    if (Math.abs(delta) < swipeThreshold) return;

    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < 0) return;

    if (delta < 0 && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }

    if (delta > 0 && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const modeledNetInPeriod = (metrics.annualNetSavingsSeries || [])
    .slice(0, periodYears)
    .reduce((sum, value) => sum + value, 0);

  const roiScore = metrics.totalCapex > 0
    ? (modeledNetInPeriod / metrics.totalCapex) * 100
    : 0;

  const confidence = metrics.paybackYears <= 5 ? 'high' : metrics.paybackYears <= 8 ? 'medium' : 'low';

  const finalCumulative = chartData?.[chartData.length - 1]?.cumulativeSavings || 0;
  const billImpact = metrics.billImpact || {};
  const inactiveTabs = tabs.filter((tab) => tab !== activeTab);

  const handleSelectTab = (event) => {
    const selected = event.target.value;
    if (!selected) return;
    setActiveTab(selected);
    setTabSwitchValue('');
  };

  return (
    <div style={{ backgroundColor: '#0a0e12' }} className="calculator-dashboard flex-1 p-6 overflow-y-auto">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total CapEx"
          value={formatCurrency(metrics.totalCapex)}
          subnet="Installation Cost"
          subtitle="Installation Cost"
          confidence={confidence}
        />
        <KPICard
          label="Annual Savings"
          value={formatCurrency(metrics.annualSavings)}
          subnet="Grid Electricity"
          subtitle="Grid Electricity"
          confidence={confidence}
        />
        <KPICard
          label="Payback Period"
          value={formatPayback(metrics.paybackYears)}
          subnet="Break-Even Point"
          subtitle="Break-Even Point"
          confidence={confidence}
        />
        <KPICard
          label="CO₂ Offset"
          value={formatCO2(metrics.co2Offset)}
          subnet="Annual Carbon Saved"
          subtitle="Annual Carbon Saved"
          confidence={confidence}
        />
      </div>

      <AssumptionChips assumptions={metrics.assumptions} details={metrics.details} />

      <div className="value-strip">
        <div>
          <span>Projected Profit @ {periodYears}y</span>
          <strong>{formatCurrency(finalCumulative)}</strong>
        </div>
        <div>
          <span>Payback</span>
          <strong>{formatPayback(metrics.paybackYears)}</strong>
        </div>
        <div>
          <span>Bill Reduction</span>
          <strong>{(billImpact.billReductionPct || 0).toFixed(1)}%</strong>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card-dark p-6">
        <h2 className="section-title mb-4">
          {periodYears}-Year Break-Even Analysis
        </h2>
        <BreakEvenChart data={chartData} />
      </div>

      <div className="glass-panel dashboard-tabs-shell mt-6" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="tab-switcher-row mb-4" role="tablist" aria-label="Dashboard tabs">
          <button
            type="button"
            className="tab-btn active tab-active-pill"
            role="tab"
            aria-selected="true"
          >
            {TAB_LABELS[activeTab]}
          </button>

          {inactiveTabs.length > 0 && (
            <select
              value={tabSwitchValue}
              onChange={handleSelectTab}
              className="input-dark tab-dropdown"
              aria-label="Switch dashboard section"
            >
              <option value="">Switch section...</option>
              {inactiveTabs.map((tab) => (
                <option key={tab} value={tab}>
                  {TAB_LABELS[tab]}
                </option>
              ))}
            </select>
          )}
        </div>

        {activeTab === 'insights' && (
          <div className="tab-pane tab-pane-insights">
            <h3 className="section-title mb-3">Decision Insight</h3>
            <p className="text-sm" style={{ color: '#e0e0e0', lineHeight: 1.6 }}>
              {insight}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="glass-mini-card">
                <div style={{ color: '#999', fontSize: 12 }}>{periodYears}-year ROI score</div>
                <div style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>{roiScore.toFixed(1)}%</div>
              </div>
              <div className="glass-mini-card">
                <div style={{ color: '#999', fontSize: 12 }}>Projected payback</div>
                <div style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>{formatPayback(metrics.paybackYears)}</div>
              </div>
            </div>

            <details className="glass-mini-card mt-4 bill-impact-shell">
              <summary>Bill Impact (compact)</summary>
              <div className="bill-impact-grid mt-3">
                <div>
                  <span>Current monthly bill</span>
                  <strong>{formatCurrency(billImpact.baselineMonthlyBill || 0)}</strong>
                </div>
                <div>
                  <span>Post-install monthly bill</span>
                  <strong>{formatCurrency(billImpact.postInstallMonthlyBillNet || 0)}</strong>
                </div>
                <div>
                  <span>Annual bill savings</span>
                  <strong>{formatCurrency(billImpact.annualBillSavings || 0)}</strong>
                </div>
                <div>
                  <span>Bill reduction</span>
                  <strong>{(billImpact.billReductionPct || 0).toFixed(1)}%</strong>
                </div>
              </div>
            </details>

            <div className="glass-mini-card mt-4 confidence-shell">
              <div className="confidence-header-row">
                <h4 style={{ margin: 0, color: '#dffef6' }}>Confidence &amp; Downside</h4>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowConfidencePanel((value) => !value)}
                >
                  {showConfidencePanel ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              <div className="confidence-kpi-grid">
                <div>
                  <span>P50 Payback</span>
                  <strong>{formatPayback(confidenceSummary?.p50PaybackYears || metrics.paybackYears)}</strong>
                </div>
                <div>
                  <span>P90 Payback</span>
                  <strong>{formatPayback(confidenceSummary?.p90PaybackYears || metrics.paybackYears)}</strong>
                </div>
                <div>
                  <span>Downside Probability</span>
                  <strong>{(confidenceSummary?.downsideProbabilityPct || 0).toFixed(1)}%</strong>
                </div>
                <div>
                  <span>Policy Pack</span>
                  <strong>{confidenceSummary?.policyPack?.label || 'Balanced Base'}</strong>
                </div>
              </div>

              {showConfidencePanel && (
                <div className="confidence-expanded mt-3">
                  <p className="confidence-subtext">
                    Based on {confidenceSummary?.simulations || 0} simulation runs varying tariff, O&amp;M, and generation assumptions.
                  </p>
                  <h5 className="driver-title">Top Drivers</h5>
                  <ul className="driver-list">
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
                </div>
              )}
            </div>

            <div className="mt-4">
              <button type="button" className="btn-primary" onClick={onOpenPitch}>
                Open Investor Pitch
              </button>
            </div>

            <WhatIfAssistant
              currentScenario={currentScenario}
              onApplyRecommendation={onApplyAssistantRecommendation}
            />
          </div>
        )}

        {activeTab === 'scenario' && (
          <div className="tab-pane tab-pane-scenario">
            <div className="flex justify-between items-center mb-3">
              <h3 className="section-title mb-0">Scenario Lab</h3>
              {comparisonScenarios.length > 0 && (
                <button type="button" className="btn-secondary" onClick={onClearComparison}>
                  Clear
                </button>
              )}
            </div>

            {comparisonScenarios.length === 0 ? (
              <p style={{ color: '#999', fontSize: 13 }}>
                Add snapshots from the control panel to compare multiple strategies.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: '#22D3EE', textAlign: 'left' }}>
                      <th className="py-2">Scenario</th>
                      <th className="py-2">CapEx</th>
                      <th className="py-2">Savings</th>
                      <th className="py-2">Payback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonScenarios.map((scenario) => (
                      <tr key={scenario.id} style={{ borderTop: '1px solid #1a2b3f' }}>
                        <td className="py-2" style={{ color: '#e0e0e0' }}>{scenario.label}</td>
                        <td className="py-2" style={{ color: '#22c55e' }}>{formatCurrency(scenario.metrics.totalCapex)}</td>
                        <td className="py-2" style={{ color: '#22c55e' }}>{formatCurrency(scenario.metrics.annualSavings)}</td>
                        <td className="py-2" style={{ color: '#22c55e' }}>{formatPayback(scenario.metrics.paybackYears)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="tab-pane tab-pane-summary">
            <h3 className="section-title mb-3">Risk and Sensitivity</h3>
            <div className="risk-layout">
              <div className="glass-mini-card">
                <h4 className="text-sm mb-3" style={{ color: '#9fd9cf' }}>Payback Sensitivity</h4>
                <SensitivityChart paybackYears={metrics.paybackYears} />
              </div>
              <div className="glass-mini-card">
                <h4 className="text-sm mb-3" style={{ color: '#9fd9cf' }}>Risk Heatmap</h4>
                <RiskHeatmap metrics={metrics} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
