import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Code2,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  History,
  Upload,
  Github,
  Home,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/editor', label: 'Editor', icon: Code2 },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/github', label: 'GitHub', icon: Github },
  { to: '/history', label: 'History', icon: History },
];

export default function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Code2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            AI Code Reviewer
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <span className="hidden text-sm text-gray-600 dark:text-gray-400 sm:block">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-700">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
