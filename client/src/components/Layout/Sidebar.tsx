import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FileBarChart, 
  Shield, 
  LogOut,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose: _onClose }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl z-40">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Finly
        </h1>
        <p className="text-sm text-gray-400 mt-1">{user.role}</p>
      </div>
      
      <nav className="mt-8 px-4 space-y-2">
        <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700/50 transition-all group">
          <LayoutDashboard className="w-5 h-5 group-hover:scale-110" />
          <span>Dashboard</span>
        </Link>

        <Link to="/records" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700/50 transition-all group">
          <FileText className="w-5 h-5 group-hover:scale-110" />
          <span>Records</span>
        </Link>

        <Link to="/reports" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700/50 transition-all group">
          <FileBarChart className="w-5 h-5 group-hover:scale-110" />
          <span>Reports</span>
        </Link>

{user.plan !== 'enterprise' && (
  <>
    <Link to="/admin" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700/50 transition-all group">
      <Shield className="w-5 h-5 group-hover:scale-110" />
      <span>Admin</span>
    </Link>
  </>
)}
<Link to="/pricing" className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-700/50 transition-all group">
  <CreditCard className="w-5 h-5 group-hover:scale-110" />
  <span>Billing</span>
</Link>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-red-600/50 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
