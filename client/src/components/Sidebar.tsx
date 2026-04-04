import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  FileText,
  Upload,
  Brain,
  Home,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bot,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Records', path: '/records', icon: <FileText className="w-5 h-5" /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Analytics Premium', path: '/analytics-premium', icon: <Sparkles className="w-5 h-5" />, badge: 'PRO' },
    { name: 'Uploads', path: '/uploads', icon: <Upload className="w-5 h-5" />, badge: 'NEW' },
    { name: 'Insights', path: '/insights', icon: <Brain className="w-5 h-5" />, badge: 'AI' },
    { name: 'AI Analysis', path: '/ai-analysis', icon: <Bot className="w-5 h-5" />, badge: 'AI' },
    { name: 'AI Chat', path: '/ai-chat', icon: <Bot className="w-5 h-5" />, badge: 'AI' },
    { name: 'Predictions', path: '/predictions', icon: <TrendingUp className="w-5 h-5" />, badge: 'AI' },
    { name: 'Dashboard Premium', path: '/dashboard-premium', icon: <Zap className="w-5 h-5" />, badge: 'PRO' },
    { name: 'Innovative Dashboard', path: '/innovative-dashboard', icon: <Sparkles className="w-5 h-5" />, badge: 'NEW' },
    { name: 'Home', path: '/home', icon: <Home className="w-5 h-5" /> },
    { name: 'Landing', path: '/landing', icon: <Home className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Image Intelligence', path: '/image-intelligence', icon: <Brain className="w-5 h-5" />, badge: 'AI' },
    { name: 'Company Setup', path: '/company-setup', icon: <Home className="w-5 h-5" /> },
    { name: 'Admin', path: '/admin', icon: <BarChart3 className="w-5 h-5" />, badge: 'ADMIN' },
    { name: 'Payments', path: '/payments', icon: <FileText className="w-5 h-5" /> }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </motion.button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? '280px' : '80px',
          x: isMobileOpen ? 0 : -400
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 z-40 lg:translate-x-0"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="font-bold text-lg bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
          >
            {isOpen && 'BHIE'}
          </motion.div>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hidden lg:flex"
            whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.7)' }}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex-shrink-0 text-lg">{item.icon}</div>
              
              <motion.span
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 text-left text-sm font-medium truncate"
              >
                {item.name}
              </motion.span>

              {item.badge && (
                <motion.span
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full"
                >
                  {item.badge}
                </motion.span>
              )}

              {/* Active indicator */}
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-lg"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-slate-700 p-4">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600/10 hover:text-red-400 transition-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <motion.span
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium"
            >
              Logout
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop spacing */}
      <motion.div
        animate={{ width: isOpen ? '280px' : '80px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:block"
      />
    </>
  );
};

export default Sidebar;
