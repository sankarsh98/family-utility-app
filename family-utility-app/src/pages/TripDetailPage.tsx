import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Train,
  IndianRupee,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { Button, Card, Modal, EmptyState, Badge, Input, TextArea } from '../components/ui';
import { PlacesToVisitList, ExpenseTracker } from '../components/trips/TripComponents';
import { useTicketStore } from '../store/ticketStore';
import { useAuthStore } from '../store/authStore';
import { Trip } from '../types';
import toast from 'react-hot-toast';

// Inline Trip Edit Form
const TripEditForm: React.FC<{
  trip: Trip;
  onSubmit: (updates: Partial<Trip>) => void;
  onCancel: () => void;
}> = ({ trip, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: trip.name,
    destination: trip.destination,
    description: trip.description || '',
    startDate: format(trip.startDate, 'yyyy-MM-dd'),
    endDate: format(trip.endDate, 'yyyy-MM-dd'),
    totalBudget: trip.totalBudget || '',
    notes: trip.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Trip name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    onSubmit({
      name: formData.name,
      destination: formData.destination,
      description: formData.description,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget.toString()) : undefined,
      notes: formData.notes,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <Input
        label="Trip Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />
      <Input
        label="Destination"
        value={formData.destination}
        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
      />
      <TextArea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          label="Start Date *"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          error={errors.startDate}
        />
        <Input
          type="date"
          label="End Date *"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          error={errors.endDate}
        />
      </div>
      <Input
        type="number"
        label="Budget (₹)"
        value={formData.totalBudget}
        onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
      />
      <TextArea
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
      />
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} className="flex-1">Update Trip</Button>
      </div>
    </div>
  );
};

export const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { trips, tickets, updateTrip, deleteTrip, fetchTrips, fetchTickets } = useTicketStore();
  const { canEdit } = useAuthStore();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignTicket, setShowAssignTicket] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTrips(), fetchTickets()]);
      setLoading(false);
    };
    loadData();
  }, []);
  
  useEffect(() => {
    if (tripId && trips.length > 0) {
      const foundTrip = trips.find(t => t.id === tripId);
      if (foundTrip) {
        setTrip(foundTrip);
      } else {
        toast.error('Trip not found');
        navigate('/trains');
      }
    }
  }, [tripId, trips]);
  
  const tripTickets = trip 
    ? tickets.filter(t => trip.tickets.includes(t.id))
    : [];
  
  // Available tickets (not already assigned to this trip)
  const availableTickets = trip 
    ? tickets.filter(t => !trip.tickets.includes(t.id))
    : [];
  
  const totalExpenses = trip?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;
  const visitedPlaces = trip?.placesToVisit.filter(p => p.visited).length || 0;
  
  const handleAssignTicket = async (ticketId: string) => {
    if (!trip) return;
    const newTickets = [...trip.tickets, ticketId];
    await updateTrip(trip.id, { tickets: newTickets });
    toast.success('Ticket assigned to trip');
    setShowAssignTicket(false);
  };
  
  const handleUnassignTicket = async (ticketId: string) => {
    if (!trip) return;
    const newTickets = trip.tickets.filter(id => id !== ticketId);
    await updateTrip(trip.id, { tickets: newTickets });
    toast.success('Ticket removed from trip');
  };
  
  const handleUpdateTrip = async (updates: Partial<Trip>) => {
    if (!trip) return;
    try {
      await updateTrip(trip.id, updates);
      toast.success('Trip updated');
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update trip');
    }
  };
  
  const handleDeleteTrip = async () => {
    if (!trip) return;
    try {
      await deleteTrip(trip.id);
      toast.success('Trip deleted');
      navigate('/trains');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };
  
  const handleUpdatePlaces = async (places: Trip['placesToVisit']) => {
    if (!trip) return;
    await updateTrip(trip.id, { placesToVisit: places });
  };
  
  const handleUpdateExpenses = async (expenses: Trip['expenses']) => {
    if (!trip) return;
    await updateTrip(trip.id, { expenses });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
        <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-maroon-500 text-white px-4 py-6">
          <button onClick={() => navigate('/trains')} className="flex items-center gap-2 text-white/80 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trains</span>
          </button>
          <h1 className="text-2xl font-bold">Trip Not Found</h1>
        </div>
        <div className="p-4">
          <EmptyState
            icon={<MapPin className="w-12 h-12" />}
            title="Trip not found"
            description="This trip may have been deleted or doesn't exist"
            action={
              <Button variant="primary" onClick={() => navigate('/trains')}>
                Go to Trains
              </Button>
            }
          />
        </div>
      </div>
    );
  }
  
  const isUpcoming = new Date(trip.startDate) > new Date();
  
  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-maroon-500 text-white px-4 py-6 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-indian-pattern opacity-10"></div>
        <div className="relative">
          <button 
            onClick={() => navigate('/trains')} 
            className="flex items-center gap-2 text-white/80 mb-4 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Trains</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">{trip.name}</h1>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-4 h-4" />
                <span>{trip.destination}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isUpcoming ? 'info' : 'default'}>
                {isUpcoming ? 'Upcoming' : 'Past'}
              </Badge>
              {canEdit() && (
                <>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Dates */}
          <div className="flex items-center gap-2 mt-3 text-white/90">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {format(trip.startDate, 'dd MMM yyyy')} - {format(trip.endDate, 'dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/80 backdrop-blur border border-gold-200 p-3 text-center">
            <Train className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-maroon-600">{tripTickets.length}</p>
            <p className="text-xs text-gray-600">Tickets</p>
          </Card>
          <Card className="bg-white/80 backdrop-blur border border-gold-200 p-3 text-center">
            <MapPin className="w-5 h-5 text-secondary-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-maroon-600">
              {visitedPlaces}/{trip.placesToVisit.length}
            </p>
            <p className="text-xs text-gray-600">Places</p>
          </Card>
          <Card className="bg-white/80 backdrop-blur border border-gold-200 p-3 text-center">
            <IndianRupee className="w-5 h-5 text-gold-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-maroon-600">₹{totalExpenses.toFixed(0)}</p>
            <p className="text-xs text-gray-600">Expenses</p>
          </Card>
        </div>
        
        {/* Description */}
        {trip.description && (
          <Card className="bg-white/80 backdrop-blur border border-gold-200">
            <div className="p-4">
              <h3 className="font-semibold text-maroon-600 mb-2">Description</h3>
              <p className="text-gray-700">{trip.description}</p>
            </div>
          </Card>
        )}
        
        {/* Linked Tickets */}
        <Card className="bg-white/80 backdrop-blur border border-gold-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-maroon-600">Train Tickets</h3>
              {canEdit() && availableTickets.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssignTicket(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Assign
                </Button>
              )}
            </div>
            
            {tripTickets.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Train className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No tickets linked to this trip</p>
                {canEdit() && availableTickets.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssignTicket(true)}
                    className="mt-2"
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Assign Ticket
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {tripTickets.map(ticket => (
                  <div 
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-cream-100 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-maroon-600">
                        {ticket.trainNumber} - {ticket.trainName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ticket.boardingStationCode} → {ticket.destinationStationCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {format(ticket.journeyDate, 'dd MMM')}
                        </p>
                        <Badge 
                          variant={
                            ticket.status === 'CNF' ? 'success' :
                            ticket.status === 'WL' ? 'warning' :
                            ticket.status === 'RAC' ? 'info' : 'danger'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      {canEdit() && (
                        <button
                          onClick={() => handleUnassignTicket(ticket.id)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remove from trip"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
        
        {/* Places to Visit */}
        <Card className="bg-white/80 backdrop-blur border border-gold-200">
          <div className="p-4">
            <PlacesToVisitList
              places={trip.placesToVisit}
              onUpdate={handleUpdatePlaces}
              editable={canEdit()}
            />
          </div>
        </Card>
        
        {/* Expenses */}
        <Card className="bg-white/80 backdrop-blur border border-gold-200">
          <div className="p-4">
            <h3 className="font-semibold text-maroon-600 mb-3">Expenses</h3>
            <ExpenseTracker
              expenses={trip.expenses}
              onUpdate={handleUpdateExpenses}
              editable={canEdit()}
            />
          </div>
        </Card>
        
        {/* Notes */}
        {trip.notes && (
          <Card className="bg-white/80 backdrop-blur border border-gold-200">
            <div className="p-4">
              <h3 className="font-semibold text-maroon-600 mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{trip.notes}</p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Trip"
        size="lg"
      >
        <TripEditForm
          trip={trip}
          onSubmit={handleUpdateTrip}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
      
      {/* Delete Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Trip"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete <strong>{trip.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteTrip}
              icon={<Trash2 className="w-4 h-4" />}
              className="flex-1"
            >
              Delete Trip
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Assign Ticket Modal */}
      <Modal
        isOpen={showAssignTicket}
        onClose={() => setShowAssignTicket(false)}
        title="Assign Ticket to Trip"
        size="lg"
      >
        <div className="space-y-3">
          {availableTickets.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Train className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No available tickets to assign</p>
              <p className="text-sm mt-1">Add tickets first from the Tickets tab</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">Select a ticket to assign to this trip:</p>
              {availableTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => handleAssignTicket(ticket.id)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-primary-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-maroon-600">
                      {ticket.trainNumber} - {ticket.trainName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {ticket.boardingStationCode} → {ticket.destinationStationCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {format(ticket.journeyDate, 'dd MMM yyyy')}
                    </p>
                    <Badge 
                      variant={
                        ticket.status === 'CNF' ? 'success' :
                        ticket.status === 'WL' ? 'warning' :
                        ticket.status === 'RAC' ? 'info' : 'danger'
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </>
          )}
          <div className="pt-3">
            <Button variant="outline" onClick={() => setShowAssignTicket(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
