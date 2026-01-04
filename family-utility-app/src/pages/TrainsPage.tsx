import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Train, 
  MapPinned,
  Ticket,
  ChevronRight,
  Upload
} from 'lucide-react';
import { Button, SearchInput, EmptyState, Card, Modal, Input, Select, TextArea } from '../components/ui';
import { TicketCard, TicketDetailCard } from '../components/trains/TicketCard';
import { TicketFiltersPanel, QuickFilter } from '../components/trains/TicketFilters';
import { TicketUploader } from '../components/trains/TicketUploader';
import { PNRChecker } from '../components/trains/PNRChecker';
import { TripCard } from '../components/trips/TripComponents';
import { useTicketStore } from '../store/ticketStore';
import { useAuthStore } from '../store/authStore';
import { TrainTicket, Trip, Passenger } from '../types';
import { TRAIN_CLASSES } from '../config/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type TabType = 'tickets' | 'trips' | 'pnr';

export const TrainsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    trips,
    filters,
    fetchTickets,
    fetchTrips,
    addTicket,
    updateTicket,
    deleteTicket,
    addTrip,
    updateTrip,
    deleteTrip,
    setFilters, 
    clearFilters,
    getFilteredTickets,
    getUpcomingTickets,
    getRecentTickets
  } = useTicketStore();

  const { canEdit } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [showUploader, setShowUploader] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'upcoming' | 'recent'>('all');
  const [editingTicket, setEditingTicket] = useState<TrainTicket | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'ticket' | 'trip', id: string } | null>(null);
  const [viewingTicket, setViewingTicket] = useState<TrainTicket | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchTrips();
  }, []);

  const filteredTickets = getFilteredTickets();
  const upcomingTickets = getUpcomingTickets();

  const displayTickets = quickFilter === 'upcoming' 
    ? upcomingTickets 
    : quickFilter === 'recent'
    ? getRecentTickets(10)
    : filteredTickets;

  const handleAddTicket = async (ticket: Omit<TrainTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addTicket(ticket);
    setShowUploader(false);
    setShowManualEntry(false);
  };

  const tabs = [
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'trips', label: 'Trips', icon: MapPinned },
    { id: 'pnr', label: 'PNR Check', icon: Search },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
      {/* Header with Indian styling */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-maroon-500 text-white px-4 py-6 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-indian-pattern opacity-10"></div>
        <div className="relative">
          <h1 className="text-2xl font-bold mb-4">Train Tickets</h1>
          
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white text-primary-600 shadow-lg' 
                    : 'bg-white/20 hover:bg-white/30'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Search and filters */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <SearchInput
                    placeholder="Search tickets..."
                    value={filters.searchQuery || ''}
                    onSearch={(value) => setFilters({ ...filters, searchQuery: value })}
                  />
                </div>
                <TicketFiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClear={clearFilters}
                />
              </div>

              {/* Quick filters */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
                <QuickFilter
                  label="All Tickets"
                  isActive={quickFilter === 'all'}
                  onClick={() => setQuickFilter('all')}
                />
                <QuickFilter
                  label="Upcoming"
                  isActive={quickFilter === 'upcoming'}
                  onClick={() => setQuickFilter('upcoming')}
                />
                <QuickFilter
                  label="Recent"
                  isActive={quickFilter === 'recent'}
                  onClick={() => setQuickFilter('recent')}
                />
              </div>

              {/* Add buttons */}
              {canEdit() && (
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="primary"
                    onClick={() => setShowUploader(true)}
                    icon={<Upload className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Upload Ticket
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowManualEntry(true)}
                    icon={<Plus className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Manual Entry
                  </Button>
                </div>
              )}

              {/* Tickets list */}
              {displayTickets.length === 0 ? (
                <EmptyState
                  icon={<Train className="w-12 h-12" />}
                  title="No tickets found"
                  description={filters.searchQuery ? 'Try adjusting your search' : 'Add your first train ticket'}
                  action={
                    <Button
                      variant="primary"
                      onClick={() => setShowUploader(true)}
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Ticket
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {displayTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TicketCard
                        ticket={ticket}
                        onClick={() => setViewingTicket(ticket)}
                        onEdit={(t) => setEditingTicket(t)}
                        onDelete={(id) => setDeleteConfirm({ type: 'ticket', id })}
                        canEdit={canEdit()}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'trips' && (
            <motion.div
              key="trips"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {canEdit() && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddTrip(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="w-full mb-4"
                >
                  Create Trip
                </Button>
              )}

              {trips.length === 0 ? (
                <EmptyState
                  icon={<MapPinned className="w-12 h-12" />}
                  title="No trips yet"
                  description="Create a trip to organize your tickets and plan your journey"
                />
              ) : (
                <div className="space-y-4">
                  {trips.map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TripCard
                        trip={trip}
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        onEdit={(t) => setEditingTrip(t)}
                        onDelete={(id) => setDeleteConfirm({ type: 'trip', id })}
                        canEdit={canEdit()}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'pnr' && (
            <motion.div
              key="pnr"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="mb-4 bg-white/80 backdrop-blur border border-gold-200">
                <div className="p-4">
                  <h3 className="font-semibold text-maroon-600 mb-4">Check PNR Status</h3>
                  <PNRChecker />
                </div>
              </Card>

              {/* Quick PNR from existing tickets */}
              {upcomingTickets.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-maroon-600 mb-3">Your Upcoming Tickets</h3>
                  <div className="space-y-2">
                    {upcomingTickets.map(ticket => (
                      <Card key={ticket.id} hoverable className="bg-white/80 backdrop-blur border border-gold-200">
                        <div className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-mono font-medium text-primary-600">{ticket.pnr}</p>
                            <p className="text-sm text-gray-600">
                              {ticket.trainNumber} • {format(ticket.journeyDate, 'dd MMM')}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-primary-400" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        title="Upload IRCTC Ticket"
        size="lg"
      >
        <TicketUploader onTicketParsed={handleAddTicket} />
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={!!viewingTicket}
        onClose={() => setViewingTicket(null)}
        title="Ticket Details"
        size="lg"
      >
        {viewingTicket && (
          <TicketDetailCard ticket={viewingTicket} />
        )}
      </Modal>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        title="Add Ticket Manually"
        size="lg"
      >
        <ManualTicketForm 
          onSubmit={handleAddTicket}
          onCancel={() => setShowManualEntry(false)}
        />
      </Modal>

      {/* Add Trip Modal */}
      <Modal
        isOpen={showAddTrip}
        onClose={() => setShowAddTrip(false)}
        title="Create Trip"
      >
        <TripForm
          onSubmit={async (trip) => {
            await addTrip(trip);
            setShowAddTrip(false);
          }}
          onCancel={() => setShowAddTrip(false)}
        />
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal
        isOpen={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        title="Edit Ticket"
        size="lg"
      >
        {editingTicket && (
          <ManualTicketForm
            ticket={editingTicket}
            onSubmit={async (data) => {
              await updateTicket(editingTicket.id, data);
              setEditingTicket(null);
              toast.success('Ticket updated successfully');
            }}
            onCancel={() => setEditingTicket(null)}
          />
        )}
      </Modal>

      {/* Edit Trip Modal */}
      <Modal
        isOpen={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        title="Edit Trip"
      >
        {editingTrip && (
          <TripForm
            trip={editingTrip}
            onSubmit={async (data) => {
              await updateTrip(editingTrip.id, data);
              setEditingTrip(null);
              toast.success('Trip updated successfully');
            }}
            onCancel={() => setEditingTrip(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this {deleteConfirm?.type}? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={async () => {
                if (deleteConfirm?.type === 'ticket') {
                  await deleteTicket(deleteConfirm.id);
                  toast.success('Ticket deleted successfully');
                } else if (deleteConfirm?.type === 'trip') {
                  await deleteTrip(deleteConfirm.id);
                  toast.success('Trip deleted successfully');
                }
                setDeleteConfirm(null);
              }}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

interface ManualTicketFormProps {
  ticket?: TrainTicket;
  onSubmit: (ticket: Omit<TrainTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ManualTicketForm: React.FC<ManualTicketFormProps> = ({ ticket, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    pnr: ticket?.pnr || '',
    trainNumber: ticket?.trainNumber || '',
    trainName: ticket?.trainName || '',
    journeyDate: ticket?.journeyDate ? format(ticket.journeyDate, 'yyyy-MM-dd') : '',
    boardingStation: ticket?.boardingStation || '',
    boardingStationCode: ticket?.boardingStationCode || '',
    destinationStation: ticket?.destinationStation || '',
    destinationStationCode: ticket?.destinationStationCode || '',
    departureTime: ticket?.departureTime || '',
    arrivalTime: ticket?.arrivalTime || '',
    travelClass: ticket?.travelClass || 'SL',
    quota: ticket?.quota || 'GENERAL',
    totalFare: ticket?.totalFare || 0,
  });

  const [passengers, setPassengers] = useState<Passenger[]>(ticket?.passengers || [{
    name: '',
    age: 30,
    gender: 'M',
    seatNumber: '',
    status: 'CNF',
    bookingStatus: 'CNF',
    currentStatus: 'CNF',
  }]);

  const addPassenger = () => {
    setPassengers([...passengers, {
      name: '',
      age: 30,
      gender: 'M',
      seatNumber: '',
      status: 'CNF',
      bookingStatus: 'CNF',
      currentStatus: 'CNF',
    }]);
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!formData.pnr || !formData.trainNumber) return;

    onSubmit({
      ...formData,
      journeyDate: new Date(formData.journeyDate),
      bookingDate: new Date(),
      passengers: passengers.filter(p => p.name),
      status: 'CNF',
      chartStatus: 'NOT_PREPARED',
    });
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* PNR and Train */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="PNR Number *"
            placeholder="10 digit PNR"
            value={formData.pnr}
            onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
          />
          <Input
            label="Train Number *"
            placeholder="e.g., 12345"
            value={formData.trainNumber}
            onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
          />
        </div>
        <Input
          label="Train Name"
          placeholder="e.g., Rajdhani Express"
          value={formData.trainName}
          onChange={(e) => setFormData({ ...formData, trainName: e.target.value })}
        />
      </div>

      {/* Journey details */}
      <div className="space-y-4">
        <Input
          type="date"
          label="Journey Date *"
          value={formData.journeyDate}
          onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Boarding Station"
            placeholder="Station name"
            value={formData.boardingStation}
            onChange={(e) => setFormData({ ...formData, boardingStation: e.target.value })}
          />
          <Input
            label="Code"
            placeholder="e.g., NDLS"
            value={formData.boardingStationCode}
            onChange={(e) => setFormData({ ...formData, boardingStationCode: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Destination Station"
            placeholder="Station name"
            value={formData.destinationStation}
            onChange={(e) => setFormData({ ...formData, destinationStation: e.target.value })}
          />
          <Input
            label="Code"
            placeholder="e.g., MAS"
            value={formData.destinationStationCode}
            onChange={(e) => setFormData({ ...formData, destinationStationCode: e.target.value })}
          />
        </div>

        <Select
          label="Class"
          value={formData.travelClass}
          onChange={(e) => setFormData({ ...formData, travelClass: e.target.value })}
          options={Object.entries(TRAIN_CLASSES).map(([value, label]) => ({ value, label }))}
        />
      </div>

      {/* Passengers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Passengers</label>
          <Button variant="ghost" size="sm" onClick={addPassenger}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        
        {passengers.map((passenger, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Passenger {index + 1}</span>
              {passengers.length > 1 && (
                <button 
                  onClick={() => removePassenger(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <Input
              placeholder="Name"
              value={passenger.name}
              onChange={(e) => updatePassenger(index, 'name', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Age"
                value={passenger.age}
                onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value))}
              />
              <Select
                value={passenger.gender}
                onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                options={[
                  { value: 'M', label: 'Male' },
                  { value: 'F', label: 'Female' },
                  { value: 'O', label: 'Other' },
                ]}
              />
              <Input
                placeholder="Seat"
                value={passenger.seatNumber}
                onChange={(e) => updatePassenger(index, 'seatNumber', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="flex-1">
          Add Ticket
        </Button>
      </div>
    </div>
  );
};

interface TripFormProps {
  trip?: Trip;
  onSubmit: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const TripForm: React.FC<TripFormProps> = ({ trip, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: trip?.name || '',
    destination: trip?.destination || '',
    startDate: trip?.startDate ? format(trip.startDate, 'yyyy-MM-dd') : '',
    endDate: trip?.endDate ? format(trip.endDate, 'yyyy-MM-dd') : '',
    totalBudget: trip?.totalBudget || '',
    notes: trip?.notes || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      name: formData.name,
      destination: formData.destination,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      tickets: trip?.tickets || [],
      documents: trip?.documents || [],
      photos: trip?.photos || [],
      placesToVisit: trip?.placesToVisit || [],
      expenses: trip?.expenses || [],
      totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget.toString()) : undefined,
      notes: formData.notes,
    });
  };

  return (
    <div className="space-y-4">
      {/* Required fields notice */}
      <div className="text-sm text-gray-500 flex items-center gap-1">
        <span className="text-red-500">*</span> Required fields
      </div>
      
      <Input
        label="Trip Name *"
        placeholder="e.g., Goa Vacation 2026"
        value={formData.name}
        onChange={(e) => {
          setFormData({ ...formData, name: e.target.value });
          if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
        }}
        error={errors.name}
      />
      <Input
        label="Destination"
        placeholder="e.g., Goa"
        value={formData.destination}
        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          label="Start Date *"
          value={formData.startDate}
          onChange={(e) => {
            setFormData({ ...formData, startDate: e.target.value });
            if (errors.startDate) setErrors(prev => ({ ...prev, startDate: '' }));
          }}
          error={errors.startDate}
        />
        <Input
          type="date"
          label="End Date *"
          value={formData.endDate}
          onChange={(e) => {
            setFormData({ ...formData, endDate: e.target.value });
            if (errors.endDate) setErrors(prev => ({ ...prev, endDate: '' }));
          }}
          error={errors.endDate}
        />
      </div>
      <Input
        type="number"
        label="Budget (₹)"
        placeholder="Optional"
        value={formData.totalBudget}
        onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
      />
      <TextArea
        label="Notes"
        placeholder="Any notes about the trip..."
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
      />

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="flex-1">
          {trip ? 'Update' : 'Create'} Trip
        </Button>
      </div>
    </div>
  );
};
