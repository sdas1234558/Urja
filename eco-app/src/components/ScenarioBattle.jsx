import { formatCurrency, formatPayback } from '../utils/calculations';

function winnerFor(scenarios, selector, compare = 'min') {
  if (!scenarios.length) return null;

  return scenarios.reduce((best, current) => {
    if (!best) return current;
    const currentValue = selector(current);
    const bestValue = selector(best);
    if (compare === 'min') return currentValue < bestValue ? current : best;
    return currentValue > bestValue ? current : best;
  }, null);
}

export default function ScenarioBattle({ scenarios = [] }) {
  if (scenarios.length < 2) {
    return (
      <div className="battle-empty">
        Add at least two snapshots in Scenario Lab to activate battle mode.
      </div>
    );
  }

  const topThree = scenarios.slice(0, 3);
  const winnerPayback = winnerFor(topThree, (s) => s.metrics.paybackYears, 'min');
  const winnerCapex = winnerFor(topThree, (s) => s.metrics.totalCapex, 'min');
  const winnerSavings = winnerFor(topThree, (s) => s.metrics.annualSavings, 'max');

  return (
    <div className="battle-grid">
      {topThree.map((scenario) => (
        <article className="battle-card" key={scenario.id}>
          <h4>{scenario.label}</h4>
          <ul>
            <li>
              <span>Payback</span>
              <strong>{formatPayback(scenario.metrics.paybackYears)}</strong>
              {winnerPayback?.id === scenario.id && <em className="winner-tag">Winner</em>}
            </li>
            <li>
              <span>CapEx</span>
              <strong>{formatCurrency(scenario.metrics.totalCapex)}</strong>
              {winnerCapex?.id === scenario.id && <em className="winner-tag">Winner</em>}
            </li>
            <li>
              <span>Annual Savings</span>
              <strong>{formatCurrency(scenario.metrics.annualSavings)}</strong>
              {winnerSavings?.id === scenario.id && <em className="winner-tag">Winner</em>}
            </li>
          </ul>
        </article>
      ))}
    </div>
  );
}
