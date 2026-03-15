import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      setMousePosition({
        x: (clientX / innerWidth - 0.5) * 20,
        y: (clientY / innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="hero-section">
      {/* Background Arch */}
      <div
        className="parallax-layer arch-bg"
        style={{
          transform: `perspective(1200px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
        }}
      >
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="arch-svg">
          <defs>
            <linearGradient id="archGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#16A34A', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#22D3EE', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#16A34A', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>
          <path
            d="M 0 300 Q 600 0, 1200 300"
            stroke="url(#archGradient)"
            strokeWidth="100"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M 0 320 Q 600 50, 1200 320"
            stroke="#22D3EE"
            strokeWidth="40"
            fill="none"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Maximize Your <span className="gradient-text">ROI</span> with
          <br />
          Urja Renewable Energy
        </h1>
        <p className="hero-subtitle">
          Advanced solar & wind ROI calculator with real-time financial projections
        </p>
        <div className="hero-cta">
          <button
            className="btn-primary cta-button"
            onClick={() => navigate('/calculator')}
          >
            <span>⚡</span>
            <span>Start ROI Calculator</span>
          </button>
          <button
            className="btn-secondary cta-button-secondary"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span>Learn More</span>
            <span>↓</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">25</div>
            <div className="stat-label">Upto 25 years ROI projection</div>
          </div>
          <div className="stat">
            <div className="stat-value">7.50</div>
            <div className="stat-label">₹/kWh WBSEDCL Rate</div>
          </div>
          <div className="stat">
            <div className="stat-value">20%</div>
            <div className="stat-label">Avg Payback Reduction*</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-dot"></div>
      </div>
    </div>
  );
}
