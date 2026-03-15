// Practical assumptions calibrated for India commercial rooftop scenarios.
export const CONFIG = {
  GRID_TARIFF_INR_PER_KWH: 8.5,
  EXPORT_TARIFF_INR_PER_KWH: 3.2,
  TARIFF_ESCALATION_RATE: 0.04,
  OPEX_ESCALATION_RATE: 0.05,
  SOLAR_KW_PER_SQFT: 0.01,
  SOLAR_SPECIFIC_YIELD: 1420,
  SOLAR_CAPEX_PER_KW: 48000,
  SOLAR_OM_RATE: 0.015,
  SOLAR_DEGRADATION: 0.006,
  WIND_RATED_KW_PER_TURBINE: 5,
  WIND_CAPACITY_FACTOR: 0.17,
  WIND_CAPEX_PER_TURBINE: 650000,
  WIND_OM_RATE: 0.03,
  WIND_DEGRADATION: 0.01,
  CONTINGENCY_RATE: 0.03,
  CO2_PER_KWH: 0.708,
  RETROFIT_MULTIPLIER: 1.12,
  DEFAULT_ANALYSIS_YEARS: 15,
  MIN_ANALYSIS_YEARS: 2,
  MAX_ANALYSIS_YEARS: 25,
  DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH: 240000, // ~20,000 kWh/month typical facility
  MIN_ANNUAL_GRID_CONSUMPTION_KWH: 500, // 500 kWh/year minimum
  MAX_ANNUAL_GRID_CONSUMPTION_KWH: 1200000, // Upper bound (100,000 kWh/month)
};

export const POLICY_PACKS = {
  conservative: {
    id: 'conservative',
    label: 'Conservative Grid',
    gridTariff: 7.9,
    exportTariff: 2.8,
    tariffEscalationRate: 0.03,
    opexEscalationRate: 0.055,
    contingencyRate: 0.04,
    uncertainty: {
      tariffEscalationDelta: 0.012,
      opexEscalationDelta: 0.015,
      solarYieldDelta: 0.08,
      windCfDelta: 0.09,
    },
  },
  balanced: {
    id: 'balanced',
    label: 'Balanced Base',
    gridTariff: 8.5,
    exportTariff: 3.2,
    tariffEscalationRate: 0.04,
    opexEscalationRate: 0.05,
    contingencyRate: 0.03,
    uncertainty: {
      tariffEscalationDelta: 0.01,
      opexEscalationDelta: 0.012,
      solarYieldDelta: 0.07,
      windCfDelta: 0.08,
    },
  },
  'high-escalation': {
    id: 'high-escalation',
    label: 'High Escalation',
    gridTariff: 8.9,
    exportTariff: 3.4,
    tariffEscalationRate: 0.06,
    opexEscalationRate: 0.052,
    contingencyRate: 0.03,
    uncertainty: {
      tariffEscalationDelta: 0.015,
      opexEscalationDelta: 0.014,
      solarYieldDelta: 0.08,
      windCfDelta: 0.08,
    },
  },
  'export-friendly': {
    id: 'export-friendly',
    label: 'Export-Friendly',
    gridTariff: 8.4,
    exportTariff: 4.0,
    tariffEscalationRate: 0.038,
    opexEscalationRate: 0.049,
    contingencyRate: 0.03,
    uncertainty: {
      tariffEscalationDelta: 0.01,
      opexEscalationDelta: 0.012,
      solarYieldDelta: 0.07,
      windCfDelta: 0.08,
    },
  },
  'retrofit-stressed': {
    id: 'retrofit-stressed',
    label: 'Retrofit-Stressed',
    gridTariff: 8.2,
    exportTariff: 3.0,
    tariffEscalationRate: 0.035,
    opexEscalationRate: 0.06,
    contingencyRate: 0.05,
    retrofitMultiplier: 1.18,
    uncertainty: {
      tariffEscalationDelta: 0.012,
      opexEscalationDelta: 0.018,
      solarYieldDelta: 0.09,
      windCfDelta: 0.1,
    },
  },
};

const DEFAULT_POLICY_PACK_ID = 'balanced';

const normalizeAnalysisYears = (analysisYears) => {
  const parsed = Number.parseInt(analysisYears, 10);
  if (Number.isNaN(parsed)) return CONFIG.DEFAULT_ANALYSIS_YEARS;
  return Math.min(CONFIG.MAX_ANALYSIS_YEARS, Math.max(CONFIG.MIN_ANALYSIS_YEARS, parsed));
};

export const normalizeAnnualGridConsumption = (consumption) => {
  const parsed = Number(consumption);
  if (!Number.isFinite(parsed)) return CONFIG.DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH;
  return Math.min(CONFIG.MAX_ANNUAL_GRID_CONSUMPTION_KWH, Math.max(CONFIG.MIN_ANNUAL_GRID_CONSUMPTION_KWH, parsed));
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getPolicyPack = (policyPackId) => {
  return POLICY_PACKS[policyPackId] || POLICY_PACKS[DEFAULT_POLICY_PACK_ID];
};

const resolveModelConfig = (policyPackId, overrides = {}) => {
  const policyPack = getPolicyPack(policyPackId);
  return {
    ...CONFIG,
    GRID_TARIFF_INR_PER_KWH: policyPack.gridTariff,
    EXPORT_TARIFF_INR_PER_KWH: policyPack.exportTariff,
    TARIFF_ESCALATION_RATE: policyPack.tariffEscalationRate,
    OPEX_ESCALATION_RATE: policyPack.opexEscalationRate,
    CONTINGENCY_RATE: policyPack.contingencyRate,
    RETROFIT_MULTIPLIER: policyPack.retrofitMultiplier || CONFIG.RETROFIT_MULTIPLIER,
    ...overrides,
  };
};

const FACILITY_PROFILES = {
  corporate: {
    selfConsumptionRate: 0.78,
    capexMultiplier: 1.0,
  },
  government: {
    selfConsumptionRate: 0.72,
    capexMultiplier: 1.02,
  },
  manufacturing: {
    selfConsumptionRate: 0.9,
    capexMultiplier: 1.05,
  },
  heritage: {
    selfConsumptionRate: 0.68,
    capexMultiplier: 1.1,
  },
  household: {
    selfConsumptionRate: 0.64,
    capexMultiplier: 0.95,
  },
  hospitals: {
    selfConsumptionRate: 0.95,
    capexMultiplier: 1.08,
  },
};

const getFacilityProfile = (facilityType) => {
  return FACILITY_PROFILES[facilityType] || FACILITY_PROFILES.corporate;
};

const calculatePaybackYears = (totalCapex, annualNetCashFlows) => {
  let cumulative = -totalCapex;

  for (let year = 1; year <= annualNetCashFlows.length; year++) {
    const previous = cumulative;
    cumulative += annualNetCashFlows[year - 1];

    if (cumulative >= 0) {
      const yearlyGain = annualNetCashFlows[year - 1];
      const fraction = yearlyGain > 0 ? Math.abs(previous) / yearlyGain : 0;
      return Number((year - 1 + Math.min(Math.max(fraction, 0), 1)).toFixed(1));
    }
  }

  return Math.max(25, annualNetCashFlows.length + 1);
};

const calculateYearlyCashFlow = ({
  year,
  solarEnergyYear1,
  windEnergyYear1,
  solarCapex,
  windCapex,
  selfConsumptionRate,
  modelConfig,
}) => {
  const yearIndex = year - 1;
  const solarEnergy = solarEnergyYear1 * ((1 - CONFIG.SOLAR_DEGRADATION) ** yearIndex);
  const windEnergy = windEnergyYear1 * ((1 - CONFIG.WIND_DEGRADATION) ** yearIndex);
  const totalEnergy = solarEnergy + windEnergy;

  const importTariff = modelConfig.GRID_TARIFF_INR_PER_KWH * ((1 + modelConfig.TARIFF_ESCALATION_RATE) ** yearIndex);
  const exportTariff = modelConfig.EXPORT_TARIFF_INR_PER_KWH * ((1 + modelConfig.TARIFF_ESCALATION_RATE) ** yearIndex);

  const weightedTariff =
    (selfConsumptionRate * importTariff) +
    ((1 - selfConsumptionRate) * exportTariff);

  const grossSavings = totalEnergy * weightedTariff;
  const yearlyOmBase = (solarCapex * modelConfig.SOLAR_OM_RATE) + (windCapex * modelConfig.WIND_OM_RATE);
  const omCost = yearlyOmBase * ((1 + modelConfig.OPEX_ESCALATION_RATE) ** yearIndex);

  return {
    totalEnergy,
    grossSavings,
    omCost,
    netCashFlow: grossSavings - omCost,
  };
};

/**
 * Calculate renewable energy metrics based on input parameters
 * @param {number} roofSpace - Usable roof space in sq ft
 * @param {number} solarAlloc - Solar allocation percentage (0-100)
 * @param {number} windTurbines - Number of micro-wind turbines (0-50)
 * @param {string} infrastructureStatus - 'new' or 'retrofit'
 * @param {string} facilityType - facility segment for self-consumption assumptions
 * @param {number} analysisYears - custom investment horizon
 * @returns {Object} Calculated metrics: totalCapex, annualSavings, paybackYears, co2Offset
 */
export function calculateMetrics(
  roofSpace,
  solarAlloc,
  windTurbines,
  infrastructureStatus,
  facilityType = 'corporate',
  analysisYears = CONFIG.DEFAULT_ANALYSIS_YEARS,
  policyPackId = DEFAULT_POLICY_PACK_ID,
  overrides = {},
  annualGridConsumptionKwh = CONFIG.DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH
) {
  const modelConfig = resolveModelConfig(policyPackId, overrides);
  const policyPack = getPolicyPack(policyPackId);
  const solarAllocDecimal = solarAlloc / 100;
  const facilityProfile = getFacilityProfile(facilityType);
  const normalizedAnalysisYears = normalizeAnalysisYears(analysisYears);

  const solarArea = roofSpace * solarAllocDecimal;
  const solarCapacityKw = solarArea * modelConfig.SOLAR_KW_PER_SQFT;
  let solarCapex = solarCapacityKw * modelConfig.SOLAR_CAPEX_PER_KW;
  const solarAnnualOutput = solarCapacityKw * modelConfig.SOLAR_SPECIFIC_YIELD;

  let windCapex = windTurbines * modelConfig.WIND_CAPEX_PER_TURBINE;
  const windAnnualOutput =
    windTurbines *
    modelConfig.WIND_RATED_KW_PER_TURBINE *
    8760 *
    modelConfig.WIND_CAPACITY_FACTOR;

  solarCapex *= facilityProfile.capexMultiplier;
  windCapex *= facilityProfile.capexMultiplier;

  let totalCapex = solarCapex + windCapex;
  if (infrastructureStatus === 'retrofit') {
    totalCapex *= modelConfig.RETROFIT_MULTIPLIER;
  }
  totalCapex *= (1 + modelConfig.CONTINGENCY_RATE);

  const yearlyCashFlows = [];
  const yearlyNetSavings = [];

  for (let year = 1; year <= normalizedAnalysisYears; year++) {
    const yearly = calculateYearlyCashFlow({
      year,
      solarEnergyYear1: solarAnnualOutput,
      windEnergyYear1: windAnnualOutput,
      solarCapex,
      windCapex,
      selfConsumptionRate: facilityProfile.selfConsumptionRate,
      modelConfig,
    });

    yearlyCashFlows.push(yearly);
    yearlyNetSavings.push(yearly.netCashFlow);
  }

  const annualSavings = yearlyNetSavings[0] || 0;
  const paybackYears = totalCapex > 0 ? calculatePaybackYears(totalCapex, yearlyNetSavings) : 0;
  const year1Energy = solarAnnualOutput + windAnnualOutput;
  const co2Offset = (year1Energy * modelConfig.CO2_PER_KWH) / 1000;
  const normalizedAnnualConsumption = Math.max(CONFIG.MIN_ANNUAL_GRID_CONSUMPTION_KWH, Number(annualGridConsumptionKwh) || CONFIG.DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH);
  const selfConsumedEnergy = Math.min(year1Energy * facilityProfile.selfConsumptionRate, normalizedAnnualConsumption);
  const gridImportAfterInstall = Math.max(0, normalizedAnnualConsumption - selfConsumedEnergy);
  const exportEnergy = Math.max(0, year1Energy - selfConsumedEnergy);
  const baselineAnnualBill = normalizedAnnualConsumption * modelConfig.GRID_TARIFF_INR_PER_KWH;
  const postInstallAnnualBillGross = gridImportAfterInstall * modelConfig.GRID_TARIFF_INR_PER_KWH;
  const exportAnnualCredit = exportEnergy * modelConfig.EXPORT_TARIFF_INR_PER_KWH;
  const postInstallAnnualBillNet = postInstallAnnualBillGross - exportAnnualCredit;
  const annualBillSavings = baselineAnnualBill - postInstallAnnualBillNet;
  const billReductionPct = baselineAnnualBill > 0 ? (annualBillSavings / baselineAnnualBill) * 100 : 0;

  return {
    totalCapex: Math.round(totalCapex),
    annualSavings: Math.round(annualSavings),
    paybackYears: Number(paybackYears.toFixed(1)),
    co2Offset: parseFloat(co2Offset.toFixed(2)),
    assumptions: {
      gridTariff: modelConfig.GRID_TARIFF_INR_PER_KWH,
      exportTariff: modelConfig.EXPORT_TARIFF_INR_PER_KWH,
      tariffEscalationPct: modelConfig.TARIFF_ESCALATION_RATE * 100,
      opexEscalationPct: modelConfig.OPEX_ESCALATION_RATE * 100,
      selfConsumptionPct: facilityProfile.selfConsumptionRate * 100,
      solarSpecificYield: modelConfig.SOLAR_SPECIFIC_YIELD,
      solarDegradationPct: modelConfig.SOLAR_DEGRADATION * 100,
      windCapacityFactorPct: modelConfig.WIND_CAPACITY_FACTOR * 100,
      contingencyPct: modelConfig.CONTINGENCY_RATE * 100,
      policyPackId: policyPack.id,
      policyPackLabel: policyPack.label,
      annualGridConsumptionKwh: Math.round(normalizedAnnualConsumption),
    },
    details: {
      solarCapacityKw: Number(solarCapacityKw.toFixed(1)),
      windCapacityKw: windTurbines * modelConfig.WIND_RATED_KW_PER_TURBINE,
      year1EnergyKwh: Math.round(year1Energy),
      year1GrossSavings: Math.round(yearlyCashFlows[0]?.grossSavings || 0),
      year1OmCost: Math.round(yearlyCashFlows[0]?.omCost || 0),
    },
    billImpact: {
      baselineAnnualBill: Math.round(baselineAnnualBill),
      postInstallAnnualBillNet: Math.round(postInstallAnnualBillNet),
      annualBillSavings: Math.round(annualBillSavings),
      baselineMonthlyBill: Math.round(baselineAnnualBill / 12),
      postInstallMonthlyBillNet: Math.round(postInstallAnnualBillNet / 12),
      monthlyBillSavings: Math.round(annualBillSavings / 12),
      billReductionPct: Number(billReductionPct.toFixed(1)),
      gridImportAfterInstallKwh: Math.round(gridImportAfterInstall),
      annualExportCredit: Math.round(exportAnnualCredit),
    },
    analysisYears: normalizedAnalysisYears,
    annualNetSavingsSeries: yearlyNetSavings.map((value) => Math.round(value)),
  };
}

const quantile = (values, percentile) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

export function calculateConfidenceSummary({
  roofSpace,
  solarAlloc,
  windTurbines,
  infrastructureStatus,
  facilityType = 'corporate',
  analysisYears = CONFIG.DEFAULT_ANALYSIS_YEARS,
  policyPackId = DEFAULT_POLICY_PACK_ID,
  annualGridConsumptionKwh = CONFIG.DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH,
  iterations = 180,
}) {
  const runCount = clamp(Number.parseInt(iterations, 10) || 180, 60, 500);
  const policyPack = getPolicyPack(policyPackId);
  const uncertainty = policyPack.uncertainty;

  const paybacks = [];
  const finalCumulatives = [];

  for (let i = 0; i < runCount; i++) {
    const variant = calculateMetrics(
      roofSpace,
      solarAlloc,
      windTurbines,
      infrastructureStatus,
      facilityType,
      analysisYears,
      policyPackId,
      {
        TARIFF_ESCALATION_RATE: clamp(
          policyPack.tariffEscalationRate + ((Math.random() * 2 - 1) * uncertainty.tariffEscalationDelta),
          0,
          0.15
        ),
        OPEX_ESCALATION_RATE: clamp(
          policyPack.opexEscalationRate + ((Math.random() * 2 - 1) * uncertainty.opexEscalationDelta),
          0,
          0.15
        ),
        SOLAR_SPECIFIC_YIELD: Math.max(
          850,
          CONFIG.SOLAR_SPECIFIC_YIELD * (1 + ((Math.random() * 2 - 1) * uncertainty.solarYieldDelta))
        ),
        WIND_CAPACITY_FACTOR: clamp(
          CONFIG.WIND_CAPACITY_FACTOR * (1 + ((Math.random() * 2 - 1) * uncertainty.windCfDelta)),
          0.08,
          0.38
        ),
      },
      annualGridConsumptionKwh
    );

    const cumulative = generateChartData(variant)?.[variant.analysisYears]?.cumulativeSavings || 0;
    paybacks.push(variant.paybackYears);
    finalCumulatives.push(cumulative);
  }

  const p50Payback = quantile(paybacks, 0.5);
  const p90Payback = quantile(paybacks, 0.9);
  const downsideProbability = (finalCumulatives.filter((value) => value < 0).length / runCount) * 100;

  const confidenceBand =
    downsideProbability <= 20
      ? 'high'
      : downsideProbability <= 40
        ? 'medium'
        : 'low';

  return {
    simulations: runCount,
    p50PaybackYears: Number(p50Payback.toFixed(1)),
    p90PaybackYears: Number(p90Payback.toFixed(1)),
    downsideProbabilityPct: Number(downsideProbability.toFixed(1)),
    confidenceBand,
    policyPack: {
      id: policyPack.id,
      label: policyPack.label,
    },
  };
}

export function calculateDecisionDrivers({
  roofSpace,
  solarAlloc,
  windTurbines,
  infrastructureStatus,
  facilityType = 'corporate',
  analysisYears = CONFIG.DEFAULT_ANALYSIS_YEARS,
  policyPackId = DEFAULT_POLICY_PACK_ID,
  annualGridConsumptionKwh = CONFIG.DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH,
}) {
  const base = calculateMetrics(
    roofSpace,
    solarAlloc,
    windTurbines,
    infrastructureStatus,
    facilityType,
    analysisYears,
    policyPackId,
    {},
    annualGridConsumptionKwh
  );

  const variants = [
    {
      label: 'Tariff escalation +1%',
      metric: calculateMetrics(
        roofSpace,
        solarAlloc,
        windTurbines,
        infrastructureStatus,
        facilityType,
        analysisYears,
        policyPackId,
        {
          TARIFF_ESCALATION_RATE: base.assumptions.tariffEscalationPct / 100 + 0.01,
        },
        annualGridConsumptionKwh
      ),
    },
    {
      label: 'O&M escalation +1%',
      metric: calculateMetrics(
        roofSpace,
        solarAlloc,
        windTurbines,
        infrastructureStatus,
        facilityType,
        analysisYears,
        policyPackId,
        {
          OPEX_ESCALATION_RATE: base.assumptions.opexEscalationPct / 100 + 0.01,
        },
        annualGridConsumptionKwh
      ),
    },
    {
      label: 'Solar yield -5%',
      metric: calculateMetrics(
        roofSpace,
        solarAlloc,
        windTurbines,
        infrastructureStatus,
        facilityType,
        analysisYears,
        policyPackId,
        {
          SOLAR_SPECIFIC_YIELD: Math.max(850, base.assumptions.solarSpecificYield * 0.95),
        },
        annualGridConsumptionKwh
      ),
    },
  ];

  return variants
    .map((item) => ({
      label: item.label,
      paybackDeltaYears: Number((item.metric.paybackYears - base.paybackYears).toFixed(1)),
      annualSavingsDelta: Math.round(item.metric.annualSavings - base.annualSavings),
    }))
    .sort((a, b) => Math.abs(b.paybackDeltaYears) - Math.abs(a.paybackDeltaYears));
}

/**
 * Generate chart data for break-even analysis over selected horizon
 * @param {Object|number} metricsOrCapex - Metrics object or total capex number for legacy mode
 * @param {number} annualSavingsLegacy - Annual savings (legacy mode only)
 * @returns {Array} Array of objects with year and cumulativeSavings
 */
export function generateChartData(metricsOrCapex, annualSavingsLegacy = 0) {
  const isMetricsInput = typeof metricsOrCapex === 'object' && metricsOrCapex !== null;
  const totalCapex = isMetricsInput ? metricsOrCapex.totalCapex : metricsOrCapex;
  const annualNetSavingsSeries = isMetricsInput
    ? (metricsOrCapex.annualNetSavingsSeries || [])
    : [];

  const data = [];
  let cumulativeSavings = -totalCapex;
  const years = isMetricsInput
    ? normalizeAnalysisYears(metricsOrCapex.analysisYears ?? annualNetSavingsSeries.length)
    : CONFIG.DEFAULT_ANALYSIS_YEARS;

  for (let year = 0; year <= years; year++) {
    const annualNet =
      year === 0
        ? 0
        : (annualNetSavingsSeries[year - 1] ?? annualSavingsLegacy);

    data.push({
      year: `Year ${year}`,
      cumulativeSavings: Math.round(cumulativeSavings),
      annualNet: Math.round(annualNet),
    });

    if (year < years) {
      cumulativeSavings += annualNet;
    }
  }

  return data;
}

/**
 * Format currency to Indian Rupees
 * @param {number} value - Numeric value
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

/**
 * Format CO2 offset to metric tons
 * @param {number} value - Numeric value
 * @returns {string} Formatted CO2 string
 */
export function formatCO2(value) {
  return `${value.toFixed(2)} MT`;
}

/**
 * Format payback period to years
 * @param {number} value - Numeric value
 * @returns {string} Formatted payback string
 */
export function formatPayback(value) {
  return `${value.toFixed(1)} yrs`;
}
