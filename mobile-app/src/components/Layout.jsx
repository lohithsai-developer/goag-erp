import { motion } from 'framer-motion';
import { LogOut, User, Bell, Settings } from 'lucide-react';

export default function Layout({ children, title, user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="flex-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">GOAG DRONES</h1>
              <p className="text-xs text-gray-500">Enterprise Resource Planning</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Bell size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role?.replace('_', ' ').toUpperCase()}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-red-50 rounded-full transition group"
              >
                <LogOut size={20} className="text-gray-600 group-hover:text-red-500 transition" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Page Title */}
      {title && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-4"
        >
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 py-4"
      >
        {children}
      </motion.main>
    </div>
  );
}
