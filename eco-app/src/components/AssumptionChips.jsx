export default function AssumptionChips({ assumptions = {}, details = {} }) {
  const chips = [
    { label: 'Grid Tariff', value: `₹${(assumptions.gridTariff || 0).toFixed(2)}/kWh` },
    { label: 'Export Tariff', value: `₹${(assumptions.exportTariff || 0).toFixed(2)}/kWh` },
    { label: 'Self Consumption', value: `${Math.round(assumptions.selfConsumptionPct || 0)}%` },
    { label: 'Tariff Escalation', value: `${(assumptions.tariffEscalationPct || 0).toFixed(1)}%` },
    { label: 'Solar Yield', value: `${Math.round(assumptions.solarSpecificYield || 0)} kWh/kW` },
    { label: 'Wind CF', value: `${(assumptions.windCapacityFactorPct || 0).toFixed(1)}%` },
    { label: 'Solar Capacity', value: `${(details.solarCapacityKw || 0).toFixed(1)} kW` },
    { label: 'Wind Capacity', value: `${details.windCapacityKw || 0} kW` },
  ];

  return (
    <div className="assumptions-strip" role="list" aria-label="Calculation assumptions">
      {chips.map((chip) => (
        <div key={chip.label} className="assumption-chip" role="listitem">
          <span>{chip.label}</span>
          <strong>{chip.value}</strong>
        </div>
      ))}
    </div>
  );
}
