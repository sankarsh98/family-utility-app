import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui';
import { Train, Pill, Shield, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading, error, user, isAllowed } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to home after successful login
  useEffect(() => {
    if (user && isAllowed) {
      navigate('/', { replace: true });
    }
  }, [user, isAllowed, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo with Indian-style decorative border */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-gold-500 to-maroon-500 rounded-3xl rotate-3 opacity-50"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-primary-500 to-maroon-500 rounded-3xl flex items-center justify-center shadow-golden border-2 border-gold-400">
              <img src="/icon.png" alt="Family Utility" className="w-16 h-16 rounded-xl object-cover" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }} />
              <Users className="w-10 h-10 text-white hidden" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-maroon-500 via-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Family Utility
          </h1>
          <p className="text-gray-600 mt-2">Your family's digital assistant</p>
          <div className="flex justify-center gap-1 mt-3">
            <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
            <span className="w-2 h-1 bg-gold-500 rounded-full"></span>
            <span className="w-8 h-1 bg-secondary-500 rounded-full"></span>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="p-4 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-primary-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <Train className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Train Tickets</p>
            <p className="text-xs text-gray-500">Track & manage</p>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-secondary-200">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-secondary-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Medicines</p>
            <p className="text-xs text-gray-500">Organize & remind</p>
          </div>
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => signInWithGoogle()}
            loading={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-saffron"
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            }
          >
            Continue with Google
          </Button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Testing mode notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"
        >
          <Shield className="w-4 h-4" />
          <span>Testing Mode - Authorized users only</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
