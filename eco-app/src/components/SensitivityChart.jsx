import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const VARIANCE_FACTORS = [
  { key: 'gridTariff', label: 'Grid Tariff ±10%', factor: 0.18 },
  { key: 'solarYield', label: 'Solar Yield ±8%', factor: 0.14 },
  { key: 'windCF', label: 'Wind CF ±10%', factor: 0.11 },
  { key: 'opex', label: 'O&M Cost ±8%', factor: -0.09 },
  { key: 'retrofit', label: 'Retrofit Cost ±6%', factor: -0.08 },
];

export default function SensitivityChart({ paybackYears = 0 }) {
  const data = VARIANCE_FACTORS.map((item) => ({
    label: item.label,
    delta: Number((paybackYears * item.factor).toFixed(2)),
  }));

  return (
    <div className="sensitivity-chart-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 14, left: 32, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 197, 94, 0.14)" />
          <XAxis type="number" tick={{ fill: '#9db4c3', fontSize: 11 }} />
          <YAxis type="category" dataKey="label" tick={{ fill: '#d9f1ff', fontSize: 11 }} width={110} />
          <Tooltip
            formatter={(value) => [`${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)} yrs`, 'Payback Delta']}
            contentStyle={{ background: '#101826', border: '1px solid #22c55e', borderRadius: 8 }}
          />
          <Bar dataKey="delta" fill="#22D3EE" radius={[5, 5, 5, 5]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
