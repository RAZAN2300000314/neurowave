import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  MessageSquarePlus,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { logout } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function AppLayout() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: t('home'), icon: Brain, end: true },
    { to: '/chat', label: t('chat'), icon: MessageSquarePlus, end: false },
    { to: '/history', label: t('history'), icon: History, end: false },
    { to: '/settings', label: t('settings'), icon: Settings, end: false },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-dark-600">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neural-400 to-pulse-500 flex items-center justify-center shadow-md">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            NEURO<span className="text-gradient">WAVE</span>
          </span>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono leading-none mt-0.5">
            BRAIN SIGNAL AI
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 dark:border-dark-600 space-y-1">
        <button onClick={toggleTheme} className="sidebar-item w-full">
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 shrink-0" />
          )}
          <span>{theme === 'dark' ? t('lightMode') : t('darkMode')}</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neural-400 to-pulse-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(user?.displayName ?? user?.email ?? '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.displayName ?? 'User'}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            title={t('logout')}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-600">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-dark-800 z-50 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-dark-600">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neural-400 to-pulse-500 flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="font-display text-sm font-bold text-gray-900 dark:text-white">
              NEURO<span className="text-gradient">WAVE</span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
