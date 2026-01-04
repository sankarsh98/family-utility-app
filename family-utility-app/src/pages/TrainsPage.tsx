import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Train, 
  MapPinned,
  Calendar,
  Ticket,
  ChevronRight,
  Upload
} from 'lucide-react';
import { Button, SearchInput, EmptyState, Card, Modal, Input, Select, TextArea } from '../components/ui';
import { TicketCard } from '../components/trains/TicketCard';
import { TicketFiltersPanel, QuickFilter } from '../components/trains/TicketFilters';
import { TicketUploader } from '../components/trains/TicketUploader';
import { PNRChecker } from '../components/trains/PNRChecker';
import { TripCard } from '../components/trips/TripComponents';
import { useTicketStore } from '../store/ticketStore';
import { TrainTicket, Trip, Passenger } from '../types';
import { TRAIN_CLASSES } from '../config/constants';
import { format } from 'date-fns';

type TabType = 'tickets' | 'trips' | 'pnr';

export const TrainsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    tickets, 
    trips,
    loading, 
    filters,
    fetchTickets,
    fetchTrips,
    addTicket,
    addTrip,
    setFilters, 
    clearFilters,
    getFilteredTickets,
    getUpcomingTickets,
    getRecentTickets
  } = useTicketStore();

  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [showUploader, setShowUploader] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'upcoming' | 'recent'>('all');

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
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-6">
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
                  ? 'bg-white text-primary-600' 
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
                        onClick={() => navigate(`/trains/${ticket.id}`)}
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
              <Button
                variant="primary"
                onClick={() => setShowAddTrip(true)}
                icon={<Plus className="w-4 h-4" />}
                className="w-full mb-4"
              >
                Create Trip
              </Button>

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
              <Card className="mb-4">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Check PNR Status</h3>
                  <PNRChecker />
                </div>
              </Card>

              {/* Quick PNR from existing tickets */}
              {upcomingTickets.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Upcoming Tickets</h3>
                  <div className="space-y-2">
                    {upcomingTickets.map(ticket => (
                      <Card key={ticket.id} hoverable>
                        <div className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-mono font-medium">{ticket.pnr}</p>
                            <p className="text-sm text-gray-500">
                              {ticket.trainNumber} • {format(ticket.journeyDate, 'dd MMM')}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
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
    </div>
  );
};

interface ManualTicketFormProps {
  onSubmit: (ticket: Omit<TrainTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const ManualTicketForm: React.FC<ManualTicketFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    pnr: '',
    trainNumber: '',
    trainName: '',
    journeyDate: '',
    boardingStation: '',
    boardingStationCode: '',
    destinationStation: '',
    destinationStationCode: '',
    departureTime: '',
    arrivalTime: '',
    travelClass: 'SL',
    quota: 'GENERAL',
    totalFare: 0,
  });

  const [passengers, setPassengers] = useState<Passenger[]>([{
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="time"
            label="Departure Time"
            value={formData.departureTime}
            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
          />
          <Input
            type="time"
            label="Arrival Time"
            value={formData.arrivalTime}
            onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Class"
            value={formData.travelClass}
            onChange={(e) => setFormData({ ...formData, travelClass: e.target.value })}
            options={Object.entries(TRAIN_CLASSES).map(([value, label]) => ({ value, label }))}
          />
          <Input
            type="number"
            label="Total Fare (₹)"
            value={formData.totalFare || ''}
            onChange={(e) => setFormData({ ...formData, totalFare: parseFloat(e.target.value) })}
          />
        </div>
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

  const handleSubmit = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return;

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
      <Input
        label="Trip Name *"
        placeholder="e.g., Goa Vacation 2026"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
        />
        <Input
          type="date"
          label="End Date *"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
