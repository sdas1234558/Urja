import { useScrollReveal } from '../hooks/useScrollReveal';

export default function BentoGrid() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal({ rootMargin: '0px 0px -50px 0px' });
  const ref3 = useScrollReveal();
  const ref4 = useScrollReveal();
  const ref5 = useScrollReveal();
  const ref6 = useScrollReveal();

  return (
    <div className="bento-section">
      <div className="bento-header">
        <h2 className="bento-title">Why Choose Urja?</h2>
        <p className="bento-subtitle">
          Comprehensive renewable energy solutions tailored for corporate & government facilities
        </p>
      </div>

      <div className="bento-grid">
        {/* Card 1: ROI Calculator */}
        <div ref={ref1} className="bento-card scroll-reveal card-1">
          <div className="card-icon">📊</div>
          <h3>Live ROI Calculator</h3>
          <p>Real-time financial projections with customizable 2-25 year break-even analysis. Adjust roof space, solar allocation, and wind turbines instantaneously.</p>
          <div className="card-feature">✓ Instant Calculations</div>
        </div>

        {/* Card 2: Carbon Impact */}
        <div ref={ref2} className="bento-card scroll-reveal card-2">
          <div className="card-icon">🌍</div>
          <h3>Carbon Offset Tracking</h3>
          <p>Monitor your environmental impact with real-time CO₂ reduction metrics. Every kWh saved reduces your carbon footprint.</p>
          <div className="card-feature">✓ Sustainability Report</div>
        </div>

        {/* Card 3: Financial Models */}
        <div ref={ref3} className="bento-card scroll-reveal card-3">
          <div className="card-icon">💰</div>
          <h3>Financial Analysis</h3>
          <p>Leverage market-based tariff assumptions with retrofit cost optimization. Get practical annual savings and cash-flow projections.</p>
          <div className="card-feature">✓ Investor-Grade Modeling</div>
        </div>

        {/* Card 4: Project Management */}
        <div ref={ref4} className="bento-card scroll-reveal card-4">
          <div className="card-icon">📁</div>
          <h3>Project Management</h3>
          <p>Save and load multiple projects. Compare different scenarios and track all your renewable energy initiatives in one place.</p>
          <div className="card-feature">✓ Cloud Sync Ready</div>
        </div>

        {/* Card 5: PDF Reports */}
        <div ref={ref5} className="bento-card scroll-reveal card-5">
          <div className="card-icon">📄</div>
          <h3>Printable Reports</h3>
          <p>Generate professional PDF reports for stakeholders. Beautiful, print-optimized layouts showcase your investment potential.</p>
          <div className="card-feature">✓ Export & Share</div>
        </div>

        {/* Card 6: Enterprise Support */}
        <div ref={ref6} className="bento-card scroll-reveal card-6">
          <div className="card-icon">🔧</div>
          <h3>Enterprise Ready</h3>
          <p>Built for corporate, government, manufacturing, and heritage buildings. Flexible facility type configurations for any use case.</p>
          <div className="card-feature">✓ All Industries</div>
        </div>
      </div>
    </div>
  );
}
