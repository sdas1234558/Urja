import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ onExport, onOpenProjects }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isCalculatorPage = location.pathname === '/calculator';
  const isHomePage = location.pathname === '/';

  return (
    <header style={{ backgroundColor: '#0f1419', borderBottomColor: '#16A34A' }} className="border-b-2 py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div style={{ background: 'linear-gradient(to bottom right, #16A34A, #22D3EE)' }} className="w-10 h-10 rounded-lg flex items-center justify-center">
            <span style={{ color: '#0f1419' }} className="font-bold text-lg">⚡</span>
          </div>
          <div>
            <h1 style={{ color: '#16A34A' }} className="text-2xl font-bold flex items-center gap-2">
              Urja
              <span style={{ color: '#F5C542' }} aria-hidden="true">✦</span>
            </h1>
            <p style={{ color: '#22D3EE' }} className="text-xs">Renewable Energy Calculator</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <div style={{ color: '#999', fontSize: '12px' }}>
              {user.name || user.email}
            </div>
          )}

          {/* Navigation Links */}
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            🏠 Home
          </Link>
          <Link to="/calculator" className={`nav-link ${location.pathname === '/calculator' ? 'active' : ''}`}>
            🧮 Calculator
          </Link>

          {/* Calculator-page only buttons */}
          {isCalculatorPage && (
            <>
              <button onClick={onOpenProjects} className="btn-primary">
                <span>💾</span>
                <span>Projects</span>
              </button>
              <button onClick={onExport} className="btn-primary">
                <span>📊</span>
                <span>Report</span>
              </button>
            </>
          )}

          {isHomePage && (
            <button onClick={handleLogout} className="btn-secondary">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// Add CSS for navigation links to your index.css or create a separate stylesheet
