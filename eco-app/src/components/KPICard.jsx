export default function KPICard({ label, value, unit, subtitle, confidence = 'medium' }) {
  return (
    <div className="kpi-card card-hover">
      <p style={{ color: '#999' }} className="text-xs uppercase tracking-wider mb-2 flex items-center justify-between gap-2">
        {label}
        <span className={`confidence-dot ${confidence}`} />
      </p>
      <p className="kpi-value">{value}</p>
      <p style={{ color: '#666' }} className="text-xs mt-2">{subtitle}</p>
    </div>
  );
}
