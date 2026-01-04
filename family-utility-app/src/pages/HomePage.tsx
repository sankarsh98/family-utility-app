import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Train, 
  Pill, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui';
import { useTicketStore } from '../store/ticketStore';
import { useMedicineStore } from '../store/medicineStore';
import { format } from 'date-fns';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, getUpcomingTickets, getRecentTickets } = useTicketStore();
  const { medicines, getLowStockMedicines, getEstimatedMonthlyCost, getDaysRemaining } = useMedicineStore();

  const upcomingTickets = getUpcomingTickets().slice(0, 3);
  const recentTickets = getRecentTickets(3);
  const lowStockMedicines = getLowStockMedicines();
  const totalMonthlyCost = getEstimatedMonthlyCost();

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-gray-500">Here's your family overview</p>
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
            className="cursor-pointer"
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
            className="cursor-pointer"
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
          <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
          
          {/* Upcoming journey */}
          {upcomingTickets.length > 0 && (
            <Card className="border-l-4 border-l-primary-500">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-0.5" />
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
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Low stock medicines */}
          {lowStockMedicines.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Low Stock Alert</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {lowStockMedicines.length} medicine{lowStockMedicines.length > 1 ? 's' : ''} running low
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lowStockMedicines.slice(0, 3).map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs">
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
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400" />
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
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Estimated Monthly Medicine Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
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
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card 
            hoverable 
            onClick={() => navigate('/trains')}
            className="cursor-pointer"
          >
            <div className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center">
                <Train className="w-6 h-6 text-primary-600" />
              </div>
              <p className="font-medium text-gray-900">Check PNR</p>
            </div>
          </Card>
          
          <Card 
            hoverable 
            onClick={() => navigate('/medicines')}
            className="cursor-pointer"
          >
            <div className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                <Pill className="w-6 h-6 text-green-600" />
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
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <button 
              onClick={() => navigate('/trains')}
              className="text-sm text-primary-600 font-medium"
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
                <Card onClick={() => navigate(`/trains/${ticket.id}`)}>
                  <div className="p-3 flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
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
  );
};
