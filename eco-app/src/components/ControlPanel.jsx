import { CONFIG } from '../utils/calculations';

export default function ControlPanel({
  facilityType,
  infrastructureStatus,
  roofSpace,
  solarAlloc,
  windTurbines,
  onFacilityTypeChange,
  onInfrastructureChange,
  onRoofSpaceChange,
  onSolarAllocChange,
  onWindTurbinesChange,
  analysisYears,
  onAnalysisYearsChange,
  annualGridConsumptionKwh,
  onAnnualGridConsumptionChange,
  policyPackId,
  onPolicyPackChange,
  policyPacks = [],
  presets = [],
  activePreset = 'custom',
  onApplyPreset,
  onOptimize,
  onReset,
  onSnapshot,
}) {
  return (
    <div style={{ backgroundColor: '#0f1419', borderRightColor: '#0f3460', width: '30%' }} className="calculator-controls border-r-2 p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Quick Presets */}
        <div className="glass-mini-card">
          <label className="section-title">Scenario Presets</label>
          <select
            value={activePreset}
            onChange={(e) => onApplyPreset?.(e.target.value)}
            className="input-dark"
            aria-label="Select scenario preset"
          >
            <option value="custom">Custom Scenario</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Facility Type */}
        <div className="glass-mini-card">
          <label className="section-title">Facility Type</label>
          <select
            value={facilityType}
            onChange={(e) => onFacilityTypeChange(e.target.value)}
            className="input-dark"
            aria-label="Select facility type"
          >
            <option value="corporate">Corporate IT Park</option>
            <option value="government">Government Complex</option>
            <option value="manufacturing">Manufacturing Hub</option>
            <option value="heritage">Heritage Building</option>
            <option value="household">Household Community</option>
            <option value="hospitals">Hospitals</option>
          </select>
        </div>

        {/* Policy Pack */}
        <div className="glass-mini-card">
          <label className="section-title">Policy Pack</label>
          <select
            value={policyPackId}
            onChange={(e) => onPolicyPackChange?.(e.target.value)}
            className="input-dark"
            aria-label="Select policy pack"
          >
            {policyPacks.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.label}
              </option>
            ))}
          </select>
          <p style={{ color: '#999' }} className="text-xs mt-2">
            Applies tariff and O&amp;M assumptions without adding extra sliders.
          </p>
        </div>

        {/* Infrastructure Status */}
        <div className="glass-mini-card">
          <label className="section-title">Infrastructure Status</label>
          <div className="toggle-btn">
            <button
              className={`btn-secondary ${infrastructureStatus === 'new' ? 'active' : ''}`}
              onClick={() => onInfrastructureChange('new')}
            >
              New Construction
            </button>
            <button
              className={`btn-secondary ${infrastructureStatus === 'retrofit' ? 'active' : ''}`}
              onClick={() => onInfrastructureChange('retrofit')}
            >
              Retrofit
            </button>
          </div>
        </div>

        {/* Usable Roof Space */}
        <div className="glass-mini-card">
          <label className="section-title">Usable Roof Space</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={roofSpace}
              onChange={(e) => onRoofSpaceChange(parseInt(e.target.value))}
              className="slider-dark flex-1"
              aria-label="Usable roof space in square feet"
            />
            <span className="text-right min-w-[100px]">
              <span style={{ color: '#22c55e' }} className="font-bold">
                {roofSpace.toLocaleString('en-IN')}
              </span>
              <span style={{ color: '#999' }} className="text-xs block">sq ft</span>
            </span>
          </div>
        </div>

        {/* Solar Allocation */}
        <div className="glass-mini-card">
          <label className="section-title">Solar Allocation</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={solarAlloc}
              onChange={(e) => onSolarAllocChange(parseInt(e.target.value))}
              className="slider-dark flex-1"
              aria-label="Solar allocation percentage"
            />
            <span className="text-right min-w-[80px]">
              <span style={{ color: '#22c55e' }} className="font-bold">{solarAlloc}</span>
              <span style={{ color: '#999' }} className="text-xs block">%</span>
            </span>
          </div>
        </div>

        {/* Micro-Wind Turbines */}
        <div className="glass-mini-card">
          <label className="section-title">Micro-Wind Turbines</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={windTurbines}
              onChange={(e) => onWindTurbinesChange(parseInt(e.target.value))}
              className="slider-dark flex-1"
              aria-label="Micro-wind turbines count"
            />
            <span className="text-right min-w-[80px]">
              <span style={{ color: '#22c55e' }} className="font-bold">{windTurbines}</span>
              <span style={{ color: '#999' }} className="text-xs block">units</span>
            </span>
          </div>
        </div>

        {/* Analysis Horizon */}
        <div className="glass-mini-card">
          <label className="section-title">Analysis Horizon</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={analysisYears}
              onChange={(e) => onAnalysisYearsChange(parseInt(e.target.value, 10))}
              className="slider-dark flex-1"
              aria-label="Analysis horizon in years"
            />
            <span className="text-right min-w-[80px]">
              <span style={{ color: '#22c55e' }} className="font-bold">{analysisYears}</span>
              <span style={{ color: '#999' }} className="text-xs block">years</span>
            </span>
          </div>
          <p style={{ color: '#999' }} className="text-xs mt-2">
            Practical market range: 2-25 years for commercial investment screening.
          </p>
        </div>

        {/* Annual Grid Consumption */}
        <div className="glass-mini-card">
          <label className="section-title">Annual Grid Consumption</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={String(CONFIG.MIN_ANNUAL_GRID_CONSUMPTION_KWH)}
              max={String(CONFIG.MAX_ANNUAL_GRID_CONSUMPTION_KWH)}
              step="5000"
              value={annualGridConsumptionKwh}
              onChange={(e) => onAnnualGridConsumptionChange?.(parseInt(e.target.value, 10))}
              className="slider-dark flex-1"
              aria-label="Annual grid consumption in kilowatt-hour"
            />
            <span className="text-right min-w-[120px]">
              <span style={{ color: '#22c55e' }} className="font-bold">
                {annualGridConsumptionKwh.toLocaleString('en-IN')}
              </span>
              <span style={{ color: '#999' }} className="text-xs block">kWh/yr</span>
            </span>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{ backgroundColor: 'rgba(15, 52, 96, 0.65)', borderLeftColor: '#00d4ff' }} className="border-l-4 p-4 rounded mt-8 glass-mini-card">
          <p style={{ color: '#999' }} className="text-xs leading-relaxed">
            <span style={{ color: '#00d4ff' }} className="font-bold">💡 Pro Tip:</span> All
            calculations use policy-pack tariffs and your annual grid consumption input.
            Results in INR.
          </p>
        </div>

        <div className="control-quick-actions">
          <button className="btn-primary control-action-btn" onClick={onOptimize} type="button">
            Optimize For Fast Payback
          </button>
          <button className="btn-secondary control-action-btn" onClick={onSnapshot} type="button">
            Snapshot For Comparison
          </button>
          <button className="btn-secondary control-action-btn" onClick={onReset} type="button">
            Reset To Baseline
          </button>
        </div>
      </div>
    </div>
  );
}
