import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const showSuccess = (message, title = 'Success') => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="bg-white rounded-xl shadow-xl p-4 border-l-4 border-green-500 min-w-[320px]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </motion.div>
  ), { duration: 4000 });
};

export const showError = (message, title = 'Error') => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="bg-white rounded-xl shadow-xl p-4 border-l-4 border-red-500 min-w-[320px]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </motion.div>
  ), { duration: 4000 });
};

export const showOrderConfirmed = (orderNumber) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-2xl p-5 min-w-[380px]"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-white">
          <p className="font-bold text-lg">🎉 Order Confirmed!</p>
          <p className="text-sm opacity-90">Order #{orderNumber} has been placed successfully</p>
        </div>
      </div>
    </motion.div>
  ), { duration: 5000 });
};

export const showTaskAssigned = (taskName, employeeName) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="bg-white rounded-xl shadow-xl p-4 border-l-4 border-blue-500 min-w-[340px]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-gray-800">✅ Task Assigned</p>
          <p className="text-sm text-gray-600">"{taskName}" assigned to {employeeName}</p>
        </div>
      </div>
    </motion.div>
  ), { duration: 4000 });
};

export const showProductionStarted = (orderNumber) => {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl p-5 min-w-[380px]"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="text-white">
          <p className="font-bold text-lg">🏭 Production Started!</p>
          <p className="text-sm opacity-90">Order #{orderNumber} is now in production</p>
        </div>
      </div>
    </motion.div>
  ), { duration: 4000 });
};
