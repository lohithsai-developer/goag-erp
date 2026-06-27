import { motion } from 'framer-motion';

export default function Card({ children, title, icon, onClick, className = '' }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 p-5 pb-0">
          {icon && <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
