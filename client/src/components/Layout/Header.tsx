import { Bell, Moon, Sun, UserCircle, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user } = useAuth();

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <span className="ml-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-bold flex items-center"><Crown className="w-3 h-3 mr-1" />Pro</span>;
      case 'enterprise':
        return <span className="ml-1 px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs rounded-full font-bold flex items-center"><Crown className="w-3 h-3 mr-1" />Ent</span>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white/80 dark:bg-[#0A0A0A]/80 border border-white/5/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0A0A0A]/60">
              <Bell className="w-5 h-5 text-gray-700 dark:text-[#C0C0C0]" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0A0A0A]/60 transition-colors">
              <Moon className="w-5 h-5 text-gray-700 dark:text-[#C0C0C0] hidden dark:block" />
              <Sun className="w-5 h-5 text-gray-700 dark:text-[#C0C0C0] block dark:hidden" />
            </button>
            
            {user && (
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#0A0A0A]/60 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <UserCircle className="w-6 h-6 text-gray-700 dark:text-[#C0C0C0]" />
                <span className="text-sm font-medium flex items-center">
                  {user.name || user.email.split('@')[0]} 
                  {getPlanBadge(user.plan)}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

