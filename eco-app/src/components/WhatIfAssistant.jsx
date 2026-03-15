import { useMemo, useState } from 'react';
import { calculateMetrics, POLICY_PACKS, formatCurrency, formatPayback } from '../utils/calculations';

const QUICK_PROMPTS = [
  'What if tariff rises 2%?',
  'How to cut payback below 6 years?',
  'What if O&M rises 1.5%?',
  'What if solar allocation increases by 10%?',
  'Switch to conservative policy pack',
  'Minimize CapEx under payback 7 years',
];

const FACILITY_CANDIDATES = ['corporate', 'government', 'manufacturing', 'heritage', 'household', 'hospitals'];
const INFRA_CANDIDATES = ['new', 'retrofit'];

const toPercent = (value) => Number((value * 100).toFixed(1));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const POLICY_ALIAS = [
  { id: 'conservative', tokens: ['conservative'] },
  { id: 'balanced', tokens: ['balanced', 'base'] },
  { id: 'high-escalation', tokens: ['high escalation', 'high-escalation', 'aggressive tariff'] },
  { id: 'export-friendly', tokens: ['export friendly', 'export-friendly'] },
  { id: 'retrofit-stressed', tokens: ['retrofit stressed', 'retrofit-stressed', 'stressed retrofit'] },
];

function hasDecreaseIntent(normalized) {
  return normalized.includes('decrease') || normalized.includes('reduce') || normalized.includes('lower') || normalized.includes('down') || normalized.includes('drop');
}

function extractNumber(prompt) {
  const numberMatch = prompt.match(/(-?\d+(?:\.\d+)?)/);
  return numberMatch ? Number.parseFloat(numberMatch[1]) : null;
}

function extractPercent(prompt) {
  const percentMatch = prompt.match(/(-?\d+(?:\.\d+)?)\s*%/);
  return percentMatch ? Number.parseFloat(percentMatch[1]) : null;
}

function computeVariant(baseScenario, overrides = {}, inputOverrides = {}) {
  const roofSpace = Number.isFinite(inputOverrides.roofSpace) ? inputOverrides.roofSpace : baseScenario.roofSpace;
  const solarAlloc = Number.isFinite(inputOverrides.solarAlloc) ? inputOverrides.solarAlloc : baseScenario.solarAlloc;
  const windTurbines = Number.isFinite(inputOverrides.windTurbines) ? inputOverrides.windTurbines : baseScenario.windTurbines;
  const infrastructureStatus = inputOverrides.infrastructureStatus || baseScenario.infrastructureStatus;
  const facilityType = inputOverrides.facilityType || baseScenario.facilityType;
  const analysisYears = Number.isFinite(inputOverrides.analysisYears) ? inputOverrides.analysisYears : baseScenario.analysisYears;
  const policyPackId = inputOverrides.policyPackId || baseScenario.policyPackId;

  return calculateMetrics(
    roofSpace,
    solarAlloc,
    windTurbines,
    infrastructureStatus,
    facilityType,
    analysisYears,
    policyPackId,
    overrides,
    baseScenario.annualGridConsumptionKwh
  );
}

function buildDeltaSummary(baseScenario, variant, headline) {
  const annualDelta = variant.annualSavings - baseScenario.metrics.annualSavings;
  const paybackDelta = variant.paybackYears - baseScenario.metrics.paybackYears;

  return {
    summary: `${headline} Annual savings move by ${formatCurrency(annualDelta)} and payback shifts by ${paybackDelta.toFixed(1)} years.`,
    detail: `New payback: ${formatPayback(variant.paybackYears)} | New annual savings: ${formatCurrency(variant.annualSavings)}`,
    recommendation: null,
  };
}

function evaluateTariffScenario(prompt, baseScenario) {
  const tariffMatch = prompt.match(/(\d+(?:\.\d+)?)\s*%/i);
  const percent = tariffMatch ? Number.parseFloat(tariffMatch[1]) : 2;
  const normalized = prompt.toLowerCase();
  const direction = hasDecreaseIntent(normalized) ? -1 : 1;
  const delta = direction * (percent / 100);

  const baseTariff = baseScenario.metrics?.assumptions?.gridTariff || 8.5;
  const variant = computeVariant(
    baseScenario,
    {
      GRID_TARIFF_INR_PER_KWH: Math.max(0.5, baseTariff * (1 + delta)),
    }
  );

  const sign = direction >= 0 ? '+' : '-';
  return buildDeltaSummary(baseScenario, variant, `With grid tariff ${sign}${percent.toFixed(1)}%,`);
}

function evaluateOpexScenario(prompt, baseScenario) {
  const opexMatch = prompt.match(/(\d+(?:\.\d+)?)\s*%/i);
  const percent = opexMatch ? Number.parseFloat(opexMatch[1]) : 1;
  const normalized = prompt.toLowerCase();
  const direction = hasDecreaseIntent(normalized) ? -1 : 1;
  const delta = direction * (percent / 100);

  const baseOpex = (baseScenario.metrics?.assumptions?.opexEscalationPct || 5) / 100;
  const variant = computeVariant(
    baseScenario,
    {
      OPEX_ESCALATION_RATE: Math.max(0, baseOpex + delta),
    }
  );

  const sign = direction >= 0 ? '+' : '-';
  return buildDeltaSummary(baseScenario, variant, `With O&M escalation ${sign}${percent.toFixed(1)}%,`);
}

function evaluateSolarScenario(prompt, baseScenario) {
  const normalized = prompt.toLowerCase();
  const percent = extractPercent(prompt) ?? 10;
  const isSetIntent = normalized.includes('set') || normalized.includes('to');
  const direction = hasDecreaseIntent(normalized) ? -1 : 1;

  const solarAlloc = isSetIntent
    ? clamp(percent, 0, 100)
    : clamp(baseScenario.solarAlloc + (direction * percent), 0, 100);

  const variant = computeVariant(baseScenario, {}, { solarAlloc });
  const modeLabel = isSetIntent ? `set to ${solarAlloc.toFixed(0)}%` : `${direction >= 0 ? '+' : '-'}${percent.toFixed(1)}%`;

  return {
    ...buildDeltaSummary(baseScenario, variant, `With solar allocation ${modeLabel},`),
    recommendation: {
      solarAlloc,
    },
  };
}

function evaluateWindScenario(prompt, baseScenario) {
  const normalized = prompt.toLowerCase();
  const value = extractNumber(prompt) ?? 2;
  const isSetIntent = normalized.includes('set') || normalized.includes('to');
  const direction = hasDecreaseIntent(normalized) ? -1 : 1;

  const windTurbines = isSetIntent
    ? clamp(Math.round(value), 0, 50)
    : clamp(baseScenario.windTurbines + Math.round(direction * value), 0, 50);

  const variant = computeVariant(baseScenario, {}, { windTurbines });
  const modeLabel = isSetIntent ? `set to ${windTurbines}` : `${direction >= 0 ? '+' : '-'}${Math.abs(Math.round(value))}`;

  return {
    ...buildDeltaSummary(baseScenario, variant, `With wind turbines ${modeLabel},`),
    recommendation: {
      windTurbines,
    },
  };
}

function evaluateRoofScenario(prompt, baseScenario) {
  const normalized = prompt.toLowerCase();
  const percent = extractPercent(prompt);
  const value = extractNumber(prompt);
  const isSetIntent = normalized.includes('set') || normalized.includes('to');
  const direction = hasDecreaseIntent(normalized) ? -1 : 1;

  let roofSpace = baseScenario.roofSpace;

  if (percent !== null) {
    roofSpace = isSetIntent
      ? clamp(Math.round((baseScenario.roofSpace * percent) / 100), 500, 50000)
      : clamp(Math.round(baseScenario.roofSpace * (1 + (direction * percent / 100))), 500, 50000);
  } else if (value !== null) {
    roofSpace = isSetIntent
      ? clamp(Math.round(value), 500, 50000)
      : clamp(baseScenario.roofSpace + Math.round(direction * value), 500, 50000);
  }

  const variant = computeVariant(baseScenario, {}, { roofSpace });

  return {
    ...buildDeltaSummary(baseScenario, variant, `With roof space adjusted to ${roofSpace.toLocaleString('en-IN')} sq ft,`),
    recommendation: {
      roofSpace,
    },
  };
}

function evaluatePolicyPackSwitch(prompt, baseScenario) {
  const normalized = prompt.toLowerCase();
  const matchedPack = POLICY_ALIAS.find((policy) =>
    policy.tokens.some((token) => normalized.includes(token))
  );

  if (!matchedPack) {
    return {
      summary: 'I could not find the requested policy pack name.',
      detail: 'Try one of: conservative, balanced, high escalation, export friendly, retrofit stressed.',
      recommendation: null,
    };
  }

  const variant = computeVariant(baseScenario, {}, { policyPackId: matchedPack.id });
  const label = POLICY_PACKS[matchedPack.id]?.label || matchedPack.id;

  return {
    ...buildDeltaSummary(baseScenario, variant, `Switching to ${label},`),
    recommendation: {
      policyPackId: matchedPack.id,
    },
  };
}

function evaluatePaybackTarget(prompt, baseScenario) {
  const targetMatch = prompt.match(/(?:below|under|<|less than)\s*(\d+(?:\.\d+)?)/i);
  const targetPayback = targetMatch ? Number.parseFloat(targetMatch[1]) : 6;

  let best = null;

  for (const facilityType of FACILITY_CANDIDATES) {
    for (const infrastructureStatus of INFRA_CANDIDATES) {
      for (let solarAlloc = 30; solarAlloc <= 90; solarAlloc += 5) {
        for (let windTurbines = 0; windTurbines <= 24; windTurbines += 1) {
          const metrics = calculateMetrics(
            baseScenario.roofSpace,
            solarAlloc,
            windTurbines,
            infrastructureStatus,
            facilityType,
            baseScenario.analysisYears,
            baseScenario.policyPackId,
            {},
            baseScenario.annualGridConsumptionKwh
          );

          const deploymentScore = (solarAlloc / 5) + windTurbines;
          const hitsTarget = metrics.paybackYears <= targetPayback;

          const candidate = {
            facilityType,
            infrastructureStatus,
            solarAlloc,
            windTurbines,
            deploymentScore,
            metrics,
            hitsTarget,
          };

          if (!best) {
            best = candidate;
            continue;
          }

          if (candidate.hitsTarget && !best.hitsTarget) {
            best = candidate;
            continue;
          }

          if (candidate.hitsTarget === best.hitsTarget) {
            if (candidate.deploymentScore < best.deploymentScore) {
              best = candidate;
              continue;
            }

            if (candidate.deploymentScore === best.deploymentScore && candidate.metrics.totalCapex < best.metrics.totalCapex) {
              best = candidate;
              continue;
            }

            if (
              candidate.deploymentScore === best.deploymentScore &&
              candidate.metrics.totalCapex === best.metrics.totalCapex &&
              candidate.metrics.paybackYears < best.metrics.paybackYears
            ) {
              best = candidate;
            }
          }
        }
      }
    }
  }

  if (!best) {
    return {
      summary: 'I could not produce a recommendation from this prompt.',
      detail: 'Try asking for a tariff or payback what-if.',
      recommendation: null,
    };
  }

  if (!best.hitsTarget) {
    return {
      summary: `No scenario reached payback below ${targetPayback.toFixed(1)} years under current roof space and policy pack.`,
      detail: `Closest found: ${formatPayback(best.metrics.paybackYears)} with ${best.solarAlloc}% solar and ${best.windTurbines} wind turbines.`,
      recommendation: {
        facilityType: best.facilityType,
        infrastructureStatus: best.infrastructureStatus,
        solarAlloc: best.solarAlloc,
        windTurbines: best.windTurbines,
      },
    };
  }

  return {
    summary: `Found a feasible path below ${targetPayback.toFixed(1)} years payback.`,
    detail: `Recommended mix: ${best.solarAlloc}% solar, ${best.windTurbines} wind turbines, ${best.infrastructureStatus} infra, ${best.facilityType} facility. Result: ${formatPayback(best.metrics.paybackYears)} payback and ${formatCurrency(best.metrics.annualSavings)} annual savings.`,
    recommendation: {
      facilityType: best.facilityType,
      infrastructureStatus: best.infrastructureStatus,
      solarAlloc: best.solarAlloc,
      windTurbines: best.windTurbines,
    },
  };
}

function evaluateMinCapexUnderPayback(prompt, baseScenario) {
  const targetMatch = prompt.match(/(?:below|under|<|less than)?\s*(\d+(?:\.\d+)?)\s*(?:years|yrs|year)?/i);
  const targetPayback = targetMatch ? Number.parseFloat(targetMatch[1]) : 7;

  let best = null;

  for (const infrastructureStatus of INFRA_CANDIDATES) {
    for (let solarAlloc = 20; solarAlloc <= 90; solarAlloc += 5) {
      for (let windTurbines = 0; windTurbines <= 24; windTurbines += 1) {
        const metrics = computeVariant(
          baseScenario,
          {},
          {
            infrastructureStatus,
            solarAlloc,
            windTurbines,
          }
        );

        if (metrics.paybackYears > targetPayback) {
          continue;
        }

        const candidate = {
          infrastructureStatus,
          solarAlloc,
          windTurbines,
          metrics,
        };

        if (!best) {
          best = candidate;
          continue;
        }

        if (candidate.metrics.totalCapex < best.metrics.totalCapex) {
          best = candidate;
          continue;
        }

        if (
          candidate.metrics.totalCapex === best.metrics.totalCapex &&
          candidate.metrics.paybackYears < best.metrics.paybackYears
        ) {
          best = candidate;
        }
      }
    }
  }

  if (!best) {
    return {
      summary: `No configuration was found under ${targetPayback.toFixed(1)} years payback with current policy and roof space.`,
      detail: 'Try relaxing the target or using a higher-tariff policy pack.',
      recommendation: null,
    };
  }

  return {
    summary: `Lowest-capex configuration under ${targetPayback.toFixed(1)} years was found.`,
    detail: `CapEx ${formatCurrency(best.metrics.totalCapex)}, payback ${formatPayback(best.metrics.paybackYears)}, using ${best.solarAlloc}% solar and ${best.windTurbines} wind turbines.`,
    recommendation: {
      infrastructureStatus: best.infrastructureStatus,
      solarAlloc: best.solarAlloc,
      windTurbines: best.windTurbines,
    },
  };
}

function evaluatePrompt(prompt, baseScenario) {
  const normalized = prompt.trim().toLowerCase();

  if (!normalized) {
    return {
      summary: 'Ask a what-if question to get a model-backed answer.',
      detail: 'Try: "What if tariff rises 2%?" or "How to cut payback below 6 years?"',
      recommendation: null,
    };
  }

  if (normalized.includes('tariff') && (normalized.includes('rise') || normalized.includes('increase') || normalized.includes('up'))) {
    return evaluateTariffScenario(prompt, baseScenario);
  }

  if (normalized.includes('o&m') || normalized.includes('opex')) {
    return evaluateOpexScenario(prompt, baseScenario);
  }

  if (normalized.includes('policy') || normalized.includes('pack')) {
    return evaluatePolicyPackSwitch(prompt, baseScenario);
  }

  if (normalized.includes('solar') && (normalized.includes('allocation') || normalized.includes('solar'))) {
    return evaluateSolarScenario(prompt, baseScenario);
  }

  if (normalized.includes('wind') || normalized.includes('turbine')) {
    return evaluateWindScenario(prompt, baseScenario);
  }

  if (normalized.includes('roof') || normalized.includes('space')) {
    return evaluateRoofScenario(prompt, baseScenario);
  }

  if (normalized.includes('payback') && (normalized.includes('below') || normalized.includes('under') || normalized.includes('less'))) {
    if (normalized.includes('capex') || normalized.includes('capital') || normalized.includes('cost')) {
      return evaluateMinCapexUnderPayback(prompt, baseScenario);
    }
    return evaluatePaybackTarget(prompt, baseScenario);
  }

  return {
    summary: 'I can answer tariff, O&M, solar, wind, roof-space, policy-pack, and payback optimization queries using your live scenario model.',
    detail: 'Try: "What if solar allocation increases by 10%?", "Switch to conservative policy pack", "Minimize CapEx under payback 7 years".',
    recommendation: null,
  };
}

export default function WhatIfAssistant({ currentScenario, onApplyRecommendation }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);

  const baselineSummary = useMemo(() => {
    return `Baseline: ${formatPayback(currentScenario.metrics.paybackYears)} payback, ${formatCurrency(currentScenario.metrics.annualSavings)} annual savings, ${toPercent((currentScenario.metrics.assumptions?.tariffEscalationPct || 4) / 100)}% tariff escalation assumption.`;
  }, [currentScenario]);

  const runQuery = (value) => {
    setQuery(value);
    const result = evaluatePrompt(value, currentScenario);
    setAnswer(result);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runQuery(query);
  };

  return (
    <div className="glass-mini-card assistant-shell mt-4">
      <div className="assistant-header-row">
        <h4 className="assistant-title">AI What-If Assistant</h4>
        <span className="assistant-badge">Model-Driven</span>
      </div>

      <p className="assistant-baseline">{baselineSummary}</p>

      <details className="assistant-help-block">
        <summary>Supported Questions</summary>
        <ul className="assistant-help-list">
          <li>Tariff changes: rise/increase/decrease by %</li>
          <li>O&amp;M or Opex changes by %</li>
          <li>Solar allocation increase/decrease/set</li>
          <li>Wind turbine increase/decrease/set</li>
          <li>Roof space increase/decrease/set</li>
          <li>Switch policy packs (conservative/balanced/etc.)</li>
          <li>Optimization goals (payback target, min CapEx under payback)</li>
        </ul>
      </details>

      <div className="assistant-chip-row">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="assistant-chip"
            onClick={() => runQuery(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="assistant-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-dark"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask: What if solar allocation increases by 10%?"
          aria-label="Ask a model-backed what-if question"
        />
        <button type="submit" className="btn-secondary">Run</button>
      </form>

      {answer && (
        <div className="assistant-answer">
          <p>{answer.summary}</p>
          <p>{answer.detail}</p>
          {answer.recommendation && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => onApplyRecommendation(answer.recommendation)}
            >
              Apply Recommendation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
