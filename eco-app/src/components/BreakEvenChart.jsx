import { useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  ReferenceLine,
  Brush,
  ResponsiveContainer,
} from 'recharts';

export default function BreakEvenChart({ data }) {
  const [pinnedPoint, setPinnedPoint] = useState(null);

  const transformedData = data.map((item) => ({
    ...item,
    positive: Math.max(item.cumulativeSavings, 0),
    negative: Math.min(item.cumulativeSavings, 0),
    confidenceUpper: Math.round(item.cumulativeSavings * 1.12),
    confidenceLower: Math.round(item.cumulativeSavings * 0.88),
  }));

  const initialCost = transformedData[0]?.cumulativeSavings || 0;

  // Custom tooltip for dark theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const baseSeries = payload.find((entry) => entry.dataKey === 'cumulativeSavings');
      const value = baseSeries?.value ?? 0;
      const formatted = `₹${Math.round(value).toLocaleString('en-IN')}`;
      const status = value >= 0 ? 'Profit Zone' : 'Recovery Zone';

      return (
        <div style={{ backgroundColor: '#101826', borderColor: '#22c55e', color: '#e0e0e0' }} className="border p-3 rounded text-sm shadow-lg">
          <div style={{ color: '#22D3EE', fontWeight: 700 }}>{label}</div>
          <div style={{ color: value >= 0 ? '#22c55e' : '#ef4444', fontWeight: 700, marginTop: 4 }}>
            {formatted}
          </div>
          <div style={{ color: '#999', marginTop: 4 }}>{status}</div>
        </div>
      );
    }
    return null;
  };

  const handleChartClick = (eventState) => {
    const payload = eventState?.activePayload?.find((entry) => entry.dataKey === 'cumulativeSavings');
    if (!payload || !payload.payload) return;
    setPinnedPoint({
      year: payload.payload.year,
      cumulativeSavings: payload.payload.cumulativeSavings,
      annualNet: payload.payload.annualNet,
    });
  };

  const handleExportSvg = () => {
    const svg = document.querySelector('.chart-container svg');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'break-even-chart.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="chart-container">
      <div className="chart-tools-row">
        <button type="button" className="btn-secondary" onClick={handleExportSvg}>
          Save Chart SVG
        </button>
      </div>
      {pinnedPoint && (
        <div className="chart-pin-chip">
          <span>{pinnedPoint.year}</span>
          <strong>₹{Math.round(pinnedPoint.cumulativeSavings).toLocaleString('en-IN')}</strong>
          <small>Annual Net: ₹{Math.round(pinnedPoint.annualNet || 0).toLocaleString('en-IN')}</small>
          <button type="button" onClick={() => setPinnedPoint(null)}>Clear</button>
        </div>
      )}
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart
          data={transformedData}
          margin={{ top: 5, right: 24, left: 0, bottom: 30 }}
          onClick={handleChartClick}
          role="img"
          aria-label="Break-even cumulative cashflow chart"
        >
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.08} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="rgba(34, 197, 94, 0.15)" />

          <XAxis
            dataKey="year"
            tick={{ fill: '#00d4ff', fontSize: 12 }}
            stroke="#0f3460"
          />
          <YAxis
            tick={{ fill: '#22c55e', fontSize: 12, fontWeight: 'bold' }}
            stroke="#0f3460"
          />
          <ReferenceLine y={0} stroke="#22D3EE" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            labelStyle={{ color: '#e0e0e0', fontSize: 12, fontWeight: 'bold' }}
          />

          <Area
            type="monotone"
            dataKey="negative"
            name="Initial Cost Recovery"
            stroke="none"
            fill="url(#negativeGradient)"
            isAnimationActive
            animationDuration={900}
          />
          <Area
            type="monotone"
            dataKey="confidenceUpper"
            name="Confidence Upper"
            stroke="none"
            fill="rgba(34, 211, 238, 0.08)"
            isAnimationActive
            animationDuration={700}
          />
          <Area
            type="monotone"
            dataKey="confidenceLower"
            name="Confidence Lower"
            stroke="none"
            fill="rgba(34, 211, 238, 0.04)"
            isAnimationActive
            animationDuration={700}
          />
          <Area
            type="monotone"
            dataKey="positive"
            name="Net Positive Returns"
            stroke="none"
            fill="url(#positiveGradient)"
            isAnimationActive
            animationDuration={900}
          />

          <Line
            type="monotone"
            dataKey="cumulativeSavings"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ fill: '#00d4ff', r: 5, strokeWidth: 2, stroke: '#22c55e' }}
            name="Cumulative Returns (₹)"
            activeDot={{ r: 7, stroke: '#00d4ff', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={900}
          />
          <ReferenceDot
            x={transformedData[0]?.year}
            y={initialCost}
            r={6}
            fill="#ef4444"
            stroke="#fecaca"
            label={{
              value: `Initial Cost: -₹${Math.abs(Math.round(initialCost)).toLocaleString('en-IN')}`,
              position: 'bottom',
              fill: '#ef4444',
              fontSize: 12,
            }}
          />

          <Brush
            dataKey="year"
            height={18}
            stroke="#22D3EE"
            travellerWidth={8}
            fill="rgba(15, 52, 96, 0.6)"
          />

          {pinnedPoint && (
            <ReferenceDot
              x={pinnedPoint.year}
              y={pinnedPoint.cumulativeSavings}
              r={7}
              fill="#facc15"
              stroke="#fef08a"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
