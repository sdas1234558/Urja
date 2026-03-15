import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import ControlPanel from '../components/ControlPanel';
import Dashboard from '../components/Dashboard';
import StoryFlow from '../components/StoryFlow';
import StoryStepIndicator from '../components/StoryStepIndicator';
import PitchSlide from '../components/PitchSlide';
import { ProjectsModal } from './ProjectsModal';
import {
  calculateMetrics,
  calculateConfidenceSummary,
  calculateDecisionDrivers,
  CONFIG,
  POLICY_PACKS,
  generateChartData,
  normalizeAnnualGridConsumption,
} from '../utils/calculations';
import { useLocation, useNavigate } from 'react-router-dom';

const PRESET_CONFIGS = [
  {
    id: 'balanced-corporate',
    label: 'Balanced Corporate Mix',
    values: {
      facilityType: 'corporate',
      infrastructureStatus: 'new',
      roofSpace: 30000,
      solarAllocation: 70,
      windTurbines: 10,
    },
  },
  {
    id: 'retrofit-aggressive',
    label: 'Aggressive Retrofit',
    values: {
      facilityType: 'manufacturing',
      infrastructureStatus: 'retrofit',
      roofSpace: 45000,
      solarAllocation: 80,
      windTurbines: 22,
    },
  },
  {
    id: 'heritage-conservative',
    label: 'Heritage Conservative',
    values: {
      facilityType: 'heritage',
      infrastructureStatus: 'retrofit',
      roofSpace: 18000,
      solarAllocation: 45,
      windTurbines: 5,
    },
  },
];

const AUTOSAVE_KEY = 'calculator-draft-v2';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [storyStep, setStoryStep] = useState(1);
  const [comparisonScenarios, setComparisonScenarios] = useState([]);
  const [activePreset, setActivePreset] = useState('custom');

  // State for all inputs
  const [facilityType, setFacilityType] = useState('corporate');
  const [infrastructureStatus, setInfrastructureStatus] = useState('new');
  const [roofSpace, setRoofSpace] = useState(25000);
  const [solarAlloc, setSolarAlloc] = useState(60);
  const [windTurbines, setWindTurbines] = useState(15);
  const [analysisYears, setAnalysisYears] = useState(CONFIG.DEFAULT_ANALYSIS_YEARS);
  const [annualGridConsumptionKwh, setAnnualGridConsumptionKwh] = useState(CONFIG.DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH);
  const [policyPackId, setPolicyPackId] = useState('balanced');

  // State for calculated results
  const [metrics, setMetrics] = useState({
    totalCapex: 0,
    annualSavings: 0,
    paybackYears: 0,
    co2Offset: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const restored = location.state?.restoredCalculation;
    if (restored) {
      if (restored.facilityType) setFacilityType(restored.facilityType);
      if (restored.infrastructureStatus) setInfrastructureStatus(restored.infrastructureStatus);
      if (Number.isFinite(restored.roofSpace)) setRoofSpace(restored.roofSpace);
      if (Number.isFinite(restored.solarAllocation)) setSolarAlloc(restored.solarAllocation);
      if (Number.isFinite(restored.windTurbines)) setWindTurbines(restored.windTurbines);
      if (Number.isFinite(restored.analysisYears)) {
        setAnalysisYears(Math.min(CONFIG.MAX_ANALYSIS_YEARS, Math.max(CONFIG.MIN_ANALYSIS_YEARS, restored.analysisYears)));
      }
      if (Number.isFinite(restored.annualGridConsumptionKwh)) {
        setAnnualGridConsumptionKwh(normalizeAnnualGridConsumption(restored.annualGridConsumptionKwh));
      }
      if (typeof restored.policyPackId === 'string' && POLICY_PACKS[restored.policyPackId]) {
        setPolicyPackId(restored.policyPackId);
      }
      if (Array.isArray(restored.comparisonScenarios)) {
        setComparisonScenarios(restored.comparisonScenarios);
      }
      setActivePreset('custom');
      return;
    }

    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed.facilityType) setFacilityType(parsed.facilityType);
      if (parsed.infrastructureStatus) setInfrastructureStatus(parsed.infrastructureStatus);
      if (Number.isFinite(parsed.roofSpace)) setRoofSpace(parsed.roofSpace);
      if (Number.isFinite(parsed.solarAllocation)) setSolarAlloc(parsed.solarAllocation);
      if (Number.isFinite(parsed.windTurbines)) setWindTurbines(parsed.windTurbines);
      if (Number.isFinite(parsed.analysisYears)) setAnalysisYears(parsed.analysisYears);
      if (Number.isFinite(parsed.annualGridConsumptionKwh)) {
        setAnnualGridConsumptionKwh(normalizeAnnualGridConsumption(parsed.annualGridConsumptionKwh));
      }
      if (typeof parsed.policyPackId === 'string' && POLICY_PACKS[parsed.policyPackId]) {
        setPolicyPackId(parsed.policyPackId);
      }
      if (Array.isArray(parsed.comparisonScenarios)) {
        setComparisonScenarios(parsed.comparisonScenarios);
      }
    } catch (error) {
      console.warn('Failed to load saved calculator draft:', error);
    }
  }, [location.state]);

  // Recalculate whenever inputs change
  useEffect(() => {
    const newMetrics = calculateMetrics(
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
    setMetrics(newMetrics);

    const newChartData = generateChartData(newMetrics);
    setChartData(newChartData);
  }, [roofSpace, solarAlloc, windTurbines, infrastructureStatus, facilityType, analysisYears, policyPackId, annualGridConsumptionKwh]);

  const confidenceSummary = useMemo(
    () =>
      calculateConfidenceSummary({
        roofSpace,
        solarAlloc,
        windTurbines,
        infrastructureStatus,
        facilityType,
        analysisYears,
        policyPackId,
        annualGridConsumptionKwh,
      }),
    [roofSpace, solarAlloc, windTurbines, infrastructureStatus, facilityType, analysisYears, policyPackId, annualGridConsumptionKwh]
  );

  const decisionDrivers = useMemo(
    () =>
      calculateDecisionDrivers({
        roofSpace,
        solarAlloc,
        windTurbines,
        infrastructureStatus,
        facilityType,
        analysisYears,
        policyPackId,
        annualGridConsumptionKwh,
      }),
    [roofSpace, solarAlloc, windTurbines, infrastructureStatus, facilityType, analysisYears, policyPackId, annualGridConsumptionKwh]
  );

  useEffect(() => {
    const snapshot = {
      facilityType,
      infrastructureStatus,
      roofSpace,
      solarAllocation: solarAlloc,
      windTurbines,
      analysisYears,
      annualGridConsumptionKwh,
      policyPackId,
      comparisonScenarios,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot));
  }, [
    facilityType,
    infrastructureStatus,
    roofSpace,
    solarAlloc,
    windTurbines,
    analysisYears,
    annualGridConsumptionKwh,
    policyPackId,
    comparisonScenarios,
  ]);

  const handleExport = () => {
    // Navigate to report page with current calculation data
    navigate('/report', { state: {
      facilityType,
      infrastructureStatus,
      roofSpace,
      solarAllocation: solarAlloc,
      windTurbines,
      analysisYears,
      annualGridConsumptionKwh,
      policyPackId,
      metrics,
      chartData,
      confidenceSummary,
      decisionDrivers,
    }});
  };

  const handleLoadProject = (projectData) => {
    setFacilityType(projectData.facilityType);
    setInfrastructureStatus(projectData.infrastructureStatus);
    setRoofSpace(projectData.roofSpace);
    setSolarAlloc(projectData.solarAllocation);
    setWindTurbines(projectData.windTurbines);

    const loadedYears = Number.isFinite(projectData.analysisYears)
      ? projectData.analysisYears
      : (Array.isArray(projectData.chartData) ? projectData.chartData.length - 1 : CONFIG.DEFAULT_ANALYSIS_YEARS);

    setAnalysisYears(Math.min(CONFIG.MAX_ANALYSIS_YEARS, Math.max(CONFIG.MIN_ANALYSIS_YEARS, loadedYears)));
    if (Number.isFinite(projectData.annualGridConsumptionKwh)) {
      setAnnualGridConsumptionKwh(normalizeAnnualGridConsumption(projectData.annualGridConsumptionKwh));
    }
    if (typeof projectData.policyPackId === 'string' && POLICY_PACKS[projectData.policyPackId]) {
      setPolicyPackId(projectData.policyPackId);
    }
    setActivePreset('custom');
  };

  const applyPreset = (presetId) => {
    const preset = PRESET_CONFIGS.find((item) => item.id === presetId);
    if (!preset) return;

    setFacilityType(preset.values.facilityType);
    setInfrastructureStatus(preset.values.infrastructureStatus);
    setRoofSpace(preset.values.roofSpace);
    setSolarAlloc(preset.values.solarAllocation);
    setWindTurbines(preset.values.windTurbines);
    setActivePreset(presetId);
  };

  const resetScenario = () => {
    setFacilityType('corporate');
    setInfrastructureStatus('new');
    setRoofSpace(25000);
    setSolarAlloc(60);
    setWindTurbines(15);
    setAnalysisYears(CONFIG.DEFAULT_ANALYSIS_YEARS);
    setAnnualGridConsumptionKwh(CONFIG.DEFAULT_ANNUAL_GRID_CONSUMPTION_KWH);
    setPolicyPackId('balanced');
    setActivePreset('custom');
  };

  const optimizeForPayback = () => {
    const facilityCandidates = ['corporate', 'government', 'manufacturing', 'heritage', 'household', 'hospitals'];
    const infrastructureCandidates = ['new', 'retrofit'];
    const maxPracticalSolar = 90;
    const maxPracticalWind = 20;

    let best = null;

    for (const candidateFacility of facilityCandidates) {
      for (const candidateInfra of infrastructureCandidates) {
        for (let candidateSolar = 0; candidateSolar <= maxPracticalSolar; candidateSolar += 5) {
          for (let candidateWind = 0; candidateWind <= maxPracticalWind; candidateWind += 1) {
            // Avoid impractical zero-installation result.
            if (candidateSolar === 0 && candidateWind === 0) {
              continue;
            }

            const candidateMetrics = calculateMetrics(
              roofSpace,
              candidateSolar,
              candidateWind,
              candidateInfra,
              candidateFacility,
              analysisYears,
              policyPackId,
              {},
              annualGridConsumptionKwh
            );

            const finalCumulative =
              -candidateMetrics.totalCapex +
              (candidateMetrics.annualNetSavingsSeries || [])
                .slice(0, analysisYears)
                .reduce((sum, value) => sum + value, 0);

            const breaksEvenWithinRange = finalCumulative >= 0;
            const deploymentScore = (candidateSolar / 5) + candidateWind;

            const candidate = {
              facilityType: candidateFacility,
              infrastructureStatus: candidateInfra,
              solarAllocation: candidateSolar,
              windTurbines: candidateWind,
              deploymentScore,
              totalCapex: candidateMetrics.totalCapex,
              paybackYears: candidateMetrics.paybackYears,
              finalCumulative,
              breaksEvenWithinRange,
            };

            if (!best) {
              best = candidate;
              continue;
            }

            if (candidate.breaksEvenWithinRange && !best.breaksEvenWithinRange) {
              best = candidate;
              continue;
            }

            if (candidate.breaksEvenWithinRange === best.breaksEvenWithinRange) {
              // Prefer the least installed capacity first for practical deployment.
              if (candidate.deploymentScore < best.deploymentScore) {
                best = candidate;
                continue;
              }

              if (candidate.deploymentScore === best.deploymentScore && candidate.totalCapex < best.totalCapex) {
                best = candidate;
                continue;
              }

              if (
                candidate.deploymentScore === best.deploymentScore &&
                candidate.totalCapex === best.totalCapex &&
                candidate.paybackYears < best.paybackYears
              ) {
                best = candidate;
                continue;
              }

              if (
                candidate.deploymentScore === best.deploymentScore &&
                candidate.totalCapex === best.totalCapex &&
                candidate.paybackYears === best.paybackYears &&
                candidate.finalCumulative > best.finalCumulative
              ) {
                best = candidate;
              }
            }
          }
        }
      }
    }

    if (best) {
      setFacilityType(best.facilityType);
      setInfrastructureStatus(best.infrastructureStatus);
      setSolarAlloc(best.solarAllocation);
      setWindTurbines(best.windTurbines);
    }

    setActivePreset('custom');
  };

  const addScenarioToCompare = () => {
    const scenario = {
      id: Date.now(),
      label: `Scenario ${comparisonScenarios.length + 1}`,
      metrics,
      inputs: {
        facilityType,
        infrastructureStatus,
        roofSpace,
        solarAllocation: solarAlloc,
        windTurbines,
        annualGridConsumptionKwh,
      },
    };

    setComparisonScenarios((prev) => [scenario, ...prev].slice(0, 4));
  };

  const clearComparison = () => {
    setComparisonScenarios([]);
  };

  const applyAssistantRecommendation = (recommendation) => {
    if (recommendation.facilityType) setFacilityType(recommendation.facilityType);
    if (recommendation.infrastructureStatus) setInfrastructureStatus(recommendation.infrastructureStatus);
    if (recommendation.policyPackId && POLICY_PACKS[recommendation.policyPackId]) {
      setPolicyPackId(recommendation.policyPackId);
    }
    if (Number.isFinite(recommendation.solarAlloc)) setSolarAlloc(recommendation.solarAlloc);
    if (Number.isFinite(recommendation.windTurbines)) setWindTurbines(recommendation.windTurbines);
    if (Number.isFinite(recommendation.roofSpace)) setRoofSpace(recommendation.roofSpace);
    if (Number.isFinite(recommendation.annualGridConsumptionKwh)) {
      setAnnualGridConsumptionKwh(normalizeAnnualGridConsumption(recommendation.annualGridConsumptionKwh));
    }
    setActivePreset('custom');
  };

  const getCurrentCalculation = () => {
    return {
      facilityType,
      infrastructureStatus,
      roofSpace,
      solarAllocation: solarAlloc,
      windTurbines,
      annualGridConsumptionKwh,
      analysisYears,
      policyPackId,
      metrics,
      chartData,
      comparisonScenarios,
      confidenceSummary,
      decisionDrivers,
    };
  };

  const insight =
    confidenceSummary.downsideProbabilityPct <= 20
      ? 'High confidence: downside probability is low with this deployment profile.'
      : confidenceSummary.downsideProbabilityPct <= 40
        ? 'Balanced outcome: review risk drivers before finalizing capex.'
        : 'Low confidence: downside risk is elevated, refine assumptions before approval.';

  // Show main app
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onExport={handleExport}
        onOpenProjects={() => setProjectsModalOpen(true)}
      />

      <div className="px-6 pt-4">
        <StoryStepIndicator
          currentStep={storyStep}
          onStepChange={setStoryStep}
        />
      </div>

      <div className="calculator-layout flex flex-1 overflow-hidden">
        <StoryFlow
          currentStep={storyStep}
          onNext={() => setStoryStep((current) => Math.min(current + 1, 4))}
          onPrevious={() => setStoryStep((current) => Math.max(current - 1, 1))}
        >
          <ControlPanel
            facilityType={facilityType}
            infrastructureStatus={infrastructureStatus}
            roofSpace={roofSpace}
            solarAlloc={solarAlloc}
            windTurbines={windTurbines}
            onFacilityTypeChange={setFacilityType}
            onInfrastructureChange={setInfrastructureStatus}
            onRoofSpaceChange={setRoofSpace}
            onSolarAllocChange={setSolarAlloc}
            onWindTurbinesChange={setWindTurbines}
            analysisYears={analysisYears}
            onAnalysisYearsChange={setAnalysisYears}
            annualGridConsumptionKwh={annualGridConsumptionKwh}
            onAnnualGridConsumptionChange={setAnnualGridConsumptionKwh}
            policyPackId={policyPackId}
            onPolicyPackChange={setPolicyPackId}
            policyPacks={Object.values(POLICY_PACKS)}
            presets={PRESET_CONFIGS}
            activePreset={activePreset}
            onApplyPreset={applyPreset}
            onOptimize={optimizeForPayback}
            onReset={resetScenario}
            onSnapshot={addScenarioToCompare}
          />
          <Dashboard
            metrics={metrics}
            chartData={chartData}
            periodYears={analysisYears}
            comparisonScenarios={comparisonScenarios}
            insight={insight}
            confidenceSummary={confidenceSummary}
            decisionDrivers={decisionDrivers}
            currentScenario={{
              roofSpace,
              solarAlloc,
              windTurbines,
              infrastructureStatus,
              facilityType,
              analysisYears,
              policyPackId,
              annualGridConsumptionKwh,
              metrics,
            }}
            onApplyAssistantRecommendation={applyAssistantRecommendation}
            onClearComparison={clearComparison}
            onOpenPitch={() => setPitchOpen(true)}
          />
        </StoryFlow>
      </div>

      <ProjectsModal
        isOpen={projectsModalOpen}
        onClose={() => setProjectsModalOpen(false)}
        onLoadProject={handleLoadProject}
        currentCalculation={getCurrentCalculation()}
      />

      <PitchSlide
        isOpen={pitchOpen}
        onClose={() => setPitchOpen(false)}
        facilityType={facilityType}
        analysisYears={analysisYears}
        metrics={metrics}
        chartData={chartData}
        confidenceSummary={confidenceSummary}
        decisionDrivers={decisionDrivers}
      />
    </div>
  );
}
