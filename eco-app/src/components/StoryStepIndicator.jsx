const STEPS = ['Setup', 'Configure', 'Review', 'Export'];

export default function StoryStepIndicator({ currentStep = 1, onStepChange }) {
  return (
    <div className="story-steps-wrap">
      {STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const status = stepNumber < currentStep ? 'done' : stepNumber === currentStep ? 'active' : 'pending';

        return (
          <button
            key={step}
            type="button"
            className={`story-step ${status}`}
            onClick={() => onStepChange?.(stepNumber)}
          >
            <span className="story-step-index">{stepNumber}</span>
            <span className="story-step-label">{step}</span>
          </button>
        );
      })}
    </div>
  );
}
