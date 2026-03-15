export default function StoryFlow({ currentStep, onNext, onPrevious, children }) {
  const stepContext = {
    1: 'Define baseline project inputs.',
    2: 'Tune scenario and optimization settings.',
    3: 'Review outcomes and compare scenarios.',
    4: 'Export report or open investor pitch view.',
  };

  return (
    <div className="story-flow-shell">
      <div className="story-flow-content">{children}</div>
      <div className="story-flow-actions">
        <div className="story-flow-note">Step {currentStep}: {stepContext[currentStep]}</div>
        <button
          type="button"
          className="btn-secondary"
          onClick={onPrevious}
          disabled={currentStep <= 1}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
          disabled={currentStep >= 4}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
