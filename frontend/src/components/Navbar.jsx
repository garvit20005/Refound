import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          Re<span>Found</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/explore" onClick={closeMenu}>Explore</NavLink>

          {user ? (
            <>
              <NavLink to="/report" onClick={closeMenu}>Report</NavLink>
              <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
              <NavLink to="/my-reports" onClick={closeMenu}>My Reports</NavLink>
              <NavLink to="/my-claims" onClick={closeMenu}>My Claims</NavLink>
              <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>
              )}
              <button className="btn btn-outline btn-small" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-small" onClick={closeMenu}>
                Sign up
              </Link>
            </>
          )}

          <button className="btn btn-outline btn-small" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
