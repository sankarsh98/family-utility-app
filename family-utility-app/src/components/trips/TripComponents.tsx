import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  MapPin, 
  Calendar, 
  FileText, 
  Image, 
  DollarSign,
  ChevronRight,
  Plus,
  Upload,
  Trash2,
  Check,
  Navigation,
  Clock,
  Star
} from 'lucide-react';
import { Trip, PlaceToVisit, Expense, TripDocument, TripPhoto } from '../../types';
import { Card, Button, Input, Select, TextArea, Modal, Badge } from '../ui';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
  const isUpcoming = new Date(trip.startDate) > new Date();
  const totalExpenses = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card onClick={onClick} hoverable>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{trip.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>{trip.destination}</span>
            </div>
          </div>
          <Badge variant={isUpcoming ? 'info' : 'default'}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </Badge>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span>
            {format(trip.startDate, 'dd MMM')} - {format(trip.endDate, 'dd MMM yyyy')}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-semibold text-primary-600">{trip.tickets.length}</p>
            <p className="text-xs text-gray-500">Tickets</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-secondary-600">{trip.placesToVisit.length}</p>
            <p className="text-xs text-gray-500">Places</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-amber-600">₹{totalExpenses}</p>
            <p className="text-xs text-gray-500">Spent</p>
          </div>
        </div>

        {/* Photos preview */}
        {trip.photos.length > 0 && (
          <div className="flex gap-1 mt-3 -mx-1">
            {trip.photos.slice(0, 4).map((photo, index) => (
              <div 
                key={photo.id}
                className="relative flex-1 aspect-square rounded-lg overflow-hidden"
              >
                <img 
                  src={photo.url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                {index === 3 && trip.photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{trip.photos.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

interface PlacesToVisitListProps {
  places: PlaceToVisit[];
  onUpdate: (places: PlaceToVisit[]) => void;
  editable?: boolean;
}

export const PlacesToVisitList: React.FC<PlacesToVisitListProps> = ({ 
  places, 
  onUpdate,
  editable = true 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlace, setNewPlace] = useState<Partial<PlaceToVisit>>({
    priority: 'medium',
    visited: false,
  });

  const handleAdd = () => {
    if (!newPlace.name) return;
    
    const place: PlaceToVisit = {
      id: Date.now().toString(),
      name: newPlace.name,
      description: newPlace.description,
      address: newPlace.address,
      googleMapsUrl: newPlace.googleMapsUrl,
      estimatedTime: newPlace.estimatedTime,
      visited: false,
      priority: newPlace.priority || 'medium',
      notes: newPlace.notes,
    };
    
    onUpdate([...places, place]);
    setNewPlace({ priority: 'medium', visited: false });
    setShowAddModal(false);
  };

  const toggleVisited = (id: string) => {
    onUpdate(places.map(p => 
      p.id === id ? { ...p, visited: !p.visited } : p
    ));
  };

  const deletePlace = (id: string) => {
    onUpdate(places.filter(p => p.id !== id));
  };

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Places to Visit</h3>
        {editable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add
          </Button>
        )}
      </div>

      {places.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No places added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {places.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                p-3 bg-white rounded-xl shadow-sm border-l-4
                ${priorityColors[place.priority]}
                ${place.visited ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleVisited(place.id)}
                  className={`
                    mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    transition-all
                    ${place.visited 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-green-500'
                    }
                  `}
                >
                  {place.visited && <Check className="w-3 h-3 text-white" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${place.visited ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {place.name}
                  </p>
                  {place.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{place.description}</p>
                  )}
                  {place.estimatedTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{place.estimatedTime}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {place.googleMapsUrl && (
                    <a
                      href={place.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Navigation className="w-4 h-4 text-primary-600" />
                    </a>
                  )}
                  {editable && (
                    <button
                      onClick={() => deletePlace(place.id)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add place modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Place to Visit"
      >
        <div className="space-y-4">
          <Input
            label="Place Name"
            placeholder="e.g., Eiffel Tower"
            value={newPlace.name || ''}
            onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
          />
          <TextArea
            label="Description"
            placeholder="Brief description..."
            value={newPlace.description || ''}
            onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
            rows={2}
          />
          <Input
            label="Address"
            placeholder="Full address"
            value={newPlace.address || ''}
            onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
          />
          <Input
            label="Google Maps URL"
            placeholder="https://maps.google.com/..."
            value={newPlace.googleMapsUrl || ''}
            onChange={(e) => setNewPlace({ ...newPlace, googleMapsUrl: e.target.value })}
          />
          <Input
            label="Estimated Time"
            placeholder="e.g., 2-3 hours"
            value={newPlace.estimatedTime || ''}
            onChange={(e) => setNewPlace({ ...newPlace, estimatedTime: e.target.value })}
          />
          <Select
            label="Priority"
            value={newPlace.priority || 'medium'}
            onChange={(e) => setNewPlace({ ...newPlace, priority: e.target.value as any })}
            options={[
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' },
            ]}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdd} className="flex-1">
              Add Place
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface ExpenseTrackerProps {
  expenses: Expense[];
  onUpdate: (expenses: Expense[]) => void;
  budget?: number;
  editable?: boolean;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ 
  expenses, 
  onUpdate,
  budget,
  editable = true 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'food',
    date: new Date(),
  });

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget ? budget - totalSpent : null;

  const handleAdd = () => {
    if (!newExpense.description || !newExpense.amount) return;
    
    const expense: Expense = {
      id: Date.now().toString(),
      category: newExpense.category as Expense['category'],
      description: newExpense.description,
      amount: newExpense.amount,
      paidBy: newExpense.paidBy || 'Self',
      date: newExpense.date || new Date(),
    };
    
    onUpdate([...expenses, expense]);
    setNewExpense({ category: 'food', date: new Date() });
    setShowAddModal(false);
  };

  const deleteExpense = (id: string) => {
    onUpdate(expenses.filter(e => e.id !== id));
  };

  const categoryIcons = {
    food: '🍽️',
    transport: '🚗',
    accommodation: '🏨',
    shopping: '🛍️',
    entertainment: '🎭',
    other: '📦',
  };

  const categoryColors = {
    food: 'bg-orange-100 text-orange-800',
    transport: 'bg-blue-100 text-blue-800',
    accommodation: 'bg-purple-100 text-purple-800',
    shopping: 'bg-pink-100 text-pink-800',
    entertainment: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card gradient="primary">
        <div className="p-4 text-white">
          <p className="text-sm opacity-80">Total Spent</p>
          <p className="text-3xl font-bold">₹{totalSpent.toLocaleString()}</p>
          {budget && (
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="opacity-80">Budget</span>
                <span>₹{budget.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${totalSpent > budget ? 'bg-red-400' : 'bg-white'}`}
                  style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
                />
              </div>
              {remaining !== null && (
                <p className={`text-sm mt-1 ${remaining < 0 ? 'text-red-300' : 'opacity-80'}`}>
                  {remaining >= 0 ? `₹${remaining.toLocaleString()} remaining` : `₹${Math.abs(remaining).toLocaleString()} over budget`}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Add button */}
      {editable && (
        <Button
          variant="outline"
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
          className="w-full"
        >
          Add Expense
        </Button>
      )}

      {/* Expenses list */}
      <div className="space-y-2">
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm"
          >
            <span className="text-2xl">{categoryIcons[expense.category]}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{expense.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`px-1.5 py-0.5 rounded ${categoryColors[expense.category]}`}>
                  {expense.category}
                </span>
                <span>{format(expense.date, 'dd MMM')}</span>
                <span>• {expense.paidBy}</span>
              </div>
            </div>
            <p className="font-semibold text-gray-900">₹{expense.amount}</p>
            {editable && (
              <button
                onClick={() => deleteExpense(expense.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add expense modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Expense"
      >
        <div className="space-y-4">
          <Input
            label="Description"
            placeholder="e.g., Lunch at restaurant"
            value={newExpense.description || ''}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
          <Input
            type="number"
            label="Amount (₹)"
            placeholder="0"
            value={newExpense.amount || ''}
            onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
          />
          <Select
            label="Category"
            value={newExpense.category || 'food'}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
            options={[
              { value: 'food', label: '🍽️ Food' },
              { value: 'transport', label: '🚗 Transport' },
              { value: 'accommodation', label: '🏨 Accommodation' },
              { value: 'shopping', label: '🛍️ Shopping' },
              { value: 'entertainment', label: '🎭 Entertainment' },
              { value: 'other', label: '📦 Other' },
            ]}
          />
          <Input
            label="Paid By"
            placeholder="Name"
            value={newExpense.paidBy || ''}
            onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
          />
          <Input
            type="date"
            label="Date"
            value={newExpense.date ? format(newExpense.date, 'yyyy-MM-dd') : ''}
            onChange={(e) => setNewExpense({ ...newExpense, date: new Date(e.target.value) })}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdd} className="flex-1">
              Add Expense
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
