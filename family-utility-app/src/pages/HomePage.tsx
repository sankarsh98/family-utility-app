import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Train, 
  Pill, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  ArrowRight,
  Users
} from 'lucide-react';
import { Card } from '../components/ui';
import { useTicketStore } from '../store/ticketStore';
import { useMedicineStore } from '../store/medicineStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ROLE_LABELS, ROLE_COLORS } from '../config/constants';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, getUpcomingTickets, getRecentTickets, fetchTickets } = useTicketStore();
  const { medicines, getLowStockMedicines, getEstimatedMonthlyCost, fetchMedicines, fetchFamilyMembers } = useMedicineStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTickets();
    fetchMedicines();
    fetchFamilyMembers();
  }, []);

  const upcomingTickets = getUpcomingTickets().slice(0, 3);
  const recentTickets = getRecentTickets(3);
  const lowStockMedicines = getLowStockMedicines();
  const totalMonthlyCost = getEstimatedMonthlyCost();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Header with Indian styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-primary-100"
        >
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-gold-500 to-maroon-500 rounded-2xl rotate-3 opacity-50"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-primary-500 to-maroon-500 rounded-2xl flex items-center justify-center shadow-golden border-2 border-gold-400 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-maroon-500 via-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Namaste, {user?.displayName?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-600 text-sm">Here's your family overview</p>
              <div className="flex gap-1 mt-2">
                <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                <span className="w-2 h-1 bg-gold-500 rounded-full"></span>
                <span className="w-8 h-1 bg-secondary-500 rounded-full"></span>
              </div>
            </div>
            
            {user?.role && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-md"
                style={{ backgroundColor: ROLE_COLORS[user.role] }}
              >
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              gradient="train" 
              onClick={() => navigate('/trains')}
              className="cursor-pointer border border-primary-200"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Train className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{tickets.length}</span>
                </div>
                <p className="text-sm opacity-80">Total Tickets</p>
                {upcomingTickets.length > 0 && (
                  <p className="text-xs mt-1 opacity-60">
                    {upcomingTickets.length} upcoming
                  </p>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              gradient="medicine"
              onClick={() => navigate('/medicines')}
              className="cursor-pointer border border-secondary-200"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Pill className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{medicines.length}</span>
                </div>
                <p className="text-sm opacity-80">Medicines</p>
                {lowStockMedicines.length > 0 && (
                  <p className="text-xs mt-1 text-yellow-200">
                    {lowStockMedicines.length} low stock
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Alerts Section */}
        {(upcomingTickets.length > 0 || lowStockMedicines.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold bg-gradient-to-r from-maroon-500 to-primary-600 bg-clip-text text-transparent flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-primary-500 to-gold-500 rounded-full"></span>
              Alerts
            </h2>
            
            {/* Upcoming journey */}
            {upcomingTickets.length > 0 && (
              <Card className="border-l-4 border-l-primary-500 bg-white/80 backdrop-blur">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Upcoming Journey</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {upcomingTickets[0].trainName} on {format(upcomingTickets[0].journeyDate, 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {upcomingTickets[0].boardingStationCode} → {upcomingTickets[0].destinationStationCode}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/trains')}
                      className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-primary-500" />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Low stock medicines */}
            {lowStockMedicines.length > 0 && (
              <Card className="border-l-4 border-l-gold-500 bg-white/80 backdrop-blur">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gradient-to-br from-gold-100 to-yellow-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-gold-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Low Stock Alert</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {lowStockMedicines.length} medicine{lowStockMedicines.length > 1 ? 's' : ''} running low
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lowStockMedicines.slice(0, 3).map(m => (
                          <span key={m.id} className="px-2 py-0.5 bg-gradient-to-r from-gold-100 to-yellow-100 text-gold-800 rounded-full text-xs border border-gold-200">
                            {m.name}
                          </span>
                        ))}
                        {lowStockMedicines.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{lowStockMedicines.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/medicines')}
                      className="p-2 hover:bg-gold-50 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-gold-500" />
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        )}

        {/* Monthly Medicine Cost */}
        {medicines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur border border-gold-200">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-gold-100 to-primary-100 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Estimated Monthly Medicine Cost</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-maroon-500 to-primary-600 bg-clip-text text-transparent">
                      ₹{totalMonthlyCost.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold bg-gradient-to-r from-maroon-500 to-primary-600 bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              hoverable 
              onClick={() => navigate('/trains')}
              className="cursor-pointer bg-white/80 backdrop-blur border border-primary-200"
            >
              <div className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center border border-primary-300">
                  <Train className="w-6 h-6 text-primary-600" />
                </div>
                <p className="font-medium text-gray-900">Check PNR</p>
              </div>
            </Card>
            
            <Card 
              hoverable 
              onClick={() => navigate('/medicines')}
              className="cursor-pointer bg-white/80 backdrop-blur border border-secondary-200"
            >
              <div className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-xl flex items-center justify-center border border-secondary-300">
                  <Pill className="w-6 h-6 text-secondary-600" />
                </div>
                <p className="font-medium text-gray-900">Add Medicine</p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Recent Tickets */}
        {recentTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-maroon-500 to-primary-600 bg-clip-text text-transparent">
                Recent Bookings
              </h2>
              <button 
                onClick={() => navigate('/trains')}
                className="text-sm text-primary-600 font-medium hover:text-primary-700"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {recentTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Card 
                    onClick={() => navigate(`/trains/${ticket.id}`)}
                    className="bg-white/80 backdrop-blur border border-gray-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="p-3 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                        <Train className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {ticket.trainNumber} - {ticket.trainName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {ticket.boardingStationCode} → {ticket.destinationStationCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {format(ticket.journeyDate, 'dd MMM')}
                        </p>
                        <p className="text-xs text-gray-500">{ticket.travelClass}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
