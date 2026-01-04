import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pill, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Search
} from 'lucide-react';
import { Button, SearchInput, EmptyState, Card, Modal, Input, Select } from '../components/ui';
import { MedicineCard, MedicineForm, FamilyMemberCard } from '../components/medicines/MedicineComponents';
import { useMedicineStore } from '../store/medicineStore';
import { Medicine, FamilyMember } from '../types';
import { MEMBER_COLORS } from '../config/constants';

type TabType = 'medicines' | 'family' | 'stats';

export const MedicinesPage: React.FC = () => {
  const {
    medicines,
    familyMembers,
    loading,
    filters,
    fetchMedicines,
    fetchFamilyMembers,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    addFamilyMember,
    deleteFamilyMember,
    logMedicineTaken,
    setFilters,
    getFilteredMedicines,
    getMedicinesByMember,
    getLowStockMedicines,
    getExpiredMedicines,
    getEstimatedMonthlyCost,
    getDaysRemaining,
  } = useMedicineStore();

  const [activeTab, setActiveTab] = useState<TabType>('medicines');
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicines();
    fetchFamilyMembers();
  }, []);

  const filteredMedicines = getFilteredMedicines();
  const lowStockMedicines = getLowStockMedicines();
  const expiredMedicines = getExpiredMedicines();
  const totalMonthlyCost = getEstimatedMonthlyCost();

  const displayMedicines = selectedMember 
    ? getMedicinesByMember(selectedMember)
    : filteredMedicines;

  const tabs = [
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Medicine Organizer</h1>
        
        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
                ${activeTab === tab.id 
                  ? 'bg-white text-green-600' 
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
          {activeTab === 'medicines' && (
            <motion.div
              key="medicines"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Search */}
              <div className="mb-4">
                <SearchInput
                  placeholder="Search medicines..."
                  value={filters.searchQuery || ''}
                  onSearch={(value) => setFilters({ ...filters, searchQuery: value })}
                />
              </div>

              {/* Filter by member */}
              {familyMembers.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                      ${!selectedMember 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white text-gray-600 border border-gray-200'
                      }
                    `}
                  >
                    All
                  </button>
                  {familyMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member.id)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all
                        ${selectedMember === member.id
                          ? 'text-white shadow-lg'
                          : 'bg-white text-gray-600 border border-gray-200'
                        }
                      `}
                      style={selectedMember === member.id ? { backgroundColor: member.color } : {}}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Alerts */}
              {(lowStockMedicines.length > 0 || expiredMedicines.length > 0) && (
                <div className="space-y-2 mb-4">
                  {lowStockMedicines.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        {lowStockMedicines.length} medicine{lowStockMedicines.length > 1 ? 's' : ''} running low
                      </span>
                    </div>
                  )}
                  {expiredMedicines.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-800">
                        {expiredMedicines.length} medicine{expiredMedicines.length > 1 ? 's' : ''} expired
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Add button */}
              <Button
                variant="primary"
                onClick={() => setShowAddMedicine(true)}
                icon={<Plus className="w-4 h-4" />}
                className="w-full mb-4"
              >
                Add Medicine
              </Button>

              {/* Medicines list */}
              {displayMedicines.length === 0 ? (
                <EmptyState
                  icon={<Pill className="w-12 h-12" />}
                  title="No medicines found"
                  description={filters.searchQuery ? 'Try adjusting your search' : 'Add your first medicine'}
                />
              ) : (
                <div className="space-y-3">
                  {displayMedicines.map((medicine, index) => (
                    <motion.div
                      key={medicine.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MedicineCard
                        medicine={medicine}
                        familyMembers={familyMembers}
                        daysRemaining={getDaysRemaining(medicine)}
                        onTakeMedicine={logMedicineTaken}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'family' && (
            <motion.div
              key="family"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Button
                variant="primary"
                onClick={() => setShowAddMember(true)}
                icon={<Plus className="w-4 h-4" />}
                className="w-full mb-4"
              >
                Add Family Member
              </Button>

              {familyMembers.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-12 h-12" />}
                  title="No family members"
                  description="Add family members to assign medicines"
                />
              ) : (
                <div className="space-y-3">
                  {familyMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <FamilyMemberCard
                        member={member}
                        medicineCount={getMedicinesByMember(member.id).length}
                        monthlyCost={getEstimatedMonthlyCost(member.id)}
                        onDelete={() => deleteFamilyMember(member.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Overview */}
              <Card gradient="medicine">
                <div className="p-4 text-white">
                  <p className="text-sm opacity-80">Estimated Monthly Cost</p>
                  <p className="text-4xl font-bold">₹{totalMonthlyCost.toFixed(0)}</p>
                  <p className="text-sm opacity-80 mt-2">
                    For {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} • {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Card>

              {/* Per member breakdown */}
              <h3 className="font-semibold text-gray-900">Cost by Family Member</h3>
              <div className="space-y-2">
                {familyMembers.map(member => {
                  const memberCost = getEstimatedMonthlyCost(member.id);
                  const memberMedicines = getMedicinesByMember(member.id);
                  
                  return (
                    <Card key={member.id}>
                      <div className="p-3 flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">
                            {memberMedicines.length} medicine{memberMedicines.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{memberCost.toFixed(0)}</p>
                          <p className="text-xs text-gray-500">/month</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{medicines.length}</p>
                    <p className="text-sm text-gray-500">Total Medicines</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-600">{lowStockMedicines.length}</p>
                    <p className="text-sm text-gray-500">Low Stock</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{expiredMedicines.length}</p>
                    <p className="text-sm text-gray-500">Expired</p>
                  </div>
                </Card>
                <Card>
                  <div className="p-4 text-center">
                    <p className="text-3xl font-bold text-blue-600">{familyMembers.length}</p>
                    <p className="text-sm text-gray-500">Family Members</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Medicine Modal */}
      <Modal
        isOpen={showAddMedicine}
        onClose={() => setShowAddMedicine(false)}
        title="Add Medicine"
        size="lg"
      >
        <MedicineForm
          familyMembers={familyMembers}
          onSubmit={async (data) => {
            await addMedicine(data);
            setShowAddMedicine(false);
          }}
          onCancel={() => setShowAddMedicine(false)}
        />
      </Modal>

      {/* Add Family Member Modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Family Member"
      >
        <FamilyMemberForm
          usedColors={familyMembers.map(m => m.color)}
          onSubmit={async (data) => {
            await addFamilyMember(data);
            setShowAddMember(false);
          }}
          onCancel={() => setShowAddMember(false)}
        />
      </Modal>
    </div>
  );
};

interface FamilyMemberFormProps {
  member?: FamilyMember;
  usedColors: string[];
  onSubmit: (data: Omit<FamilyMember, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const FamilyMemberForm: React.FC<FamilyMemberFormProps> = ({
  member,
  usedColors,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    relation: member?.relation || '',
    age: member?.age || '',
    color: member?.color || MEMBER_COLORS.find(c => !usedColors.includes(c)) || MEMBER_COLORS[0],
  });

  const handleSubmit = () => {
    if (!formData.name) return;

    onSubmit({
      name: formData.name,
      relation: formData.relation,
      age: formData.age ? parseInt(formData.age.toString()) : undefined,
      color: formData.color,
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Name *"
        placeholder="e.g., Dad"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="Relation"
        placeholder="e.g., Father"
        value={formData.relation}
        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
      />
      <Input
        type="number"
        label="Age"
        placeholder="Optional"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
      />
      
      {/* Color picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {MEMBER_COLORS.map(color => (
            <button
              key={color}
              onClick={() => setFormData({ ...formData, color })}
              className={`
                w-8 h-8 rounded-full transition-all
                ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}
                ${usedColors.includes(color) && color !== formData.color ? 'opacity-30' : ''}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="flex-1">
          {member ? 'Update' : 'Add'} Member
        </Button>
      </div>
    </div>
  );
};
