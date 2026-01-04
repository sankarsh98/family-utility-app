import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Pill, 
  Users, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Button, SearchInput, EmptyState, Card, Modal, Input } from '../components/ui';
import { MedicineCard, MedicineForm, FamilyMemberCard } from '../components/medicines/MedicineComponents';
import { useMedicineStore } from '../store/medicineStore';
import { useAuthStore } from '../store/authStore';
import { Medicine, FamilyMember } from '../types';
import { MEMBER_COLORS } from '../config/constants';
import toast from 'react-hot-toast';

type TabType = 'medicines' | 'family' | 'stats';

export const MedicinesPage: React.FC = () => {
  const {
    medicines,
    familyMembers,
    filters,
    fetchMedicines,
    fetchFamilyMembers,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    addFamilyMember,
    updateFamilyMember,
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
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'medicine' | 'member', id: string } | null>(null);

  const { canEdit } = useAuthStore();

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
    <div className="min-h-screen pb-20 bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
      {/* Header with Indian styling */}
      <div className="bg-gradient-to-r from-secondary-500 via-secondary-600 to-teal-600 text-white px-4 py-6 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-indian-pattern opacity-10"></div>
        <div className="relative">
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
                  ? 'bg-white text-secondary-600 shadow-lg' 
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
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gold-50 to-yellow-50/80 backdrop-blur border border-gold-300 rounded-xl shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-gold-600" />
                      <span className="text-sm text-gold-800 font-medium">
                        {lowStockMedicines.length} medicine{lowStockMedicines.length > 1 ? 's' : ''} running low
                      </span>
                    </div>
                  )}
                  {expiredMedicines.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-50 to-maroon-50/80 backdrop-blur border border-maroon-300 rounded-xl shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-maroon-600" />
                      <span className="text-sm text-maroon-700 font-medium">
                        {expiredMedicines.length} medicine{expiredMedicines.length > 1 ? 's' : ''} expired
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Add button */}
              {canEdit() && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddMedicine(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="w-full mb-4"
                >
                  Add Medicine
                </Button>
              )}

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
                        onEdit={(med) => setEditingMedicine(med)}
                        onDelete={(id) => setDeleteConfirm({ type: 'medicine', id })}
                        canEdit={canEdit()}
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
              {canEdit() && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddMember(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="w-full mb-4"
                >
                  Add Family Member
                </Button>
              )}

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
                        onEdit={canEdit() ? () => setEditingFamilyMember(member) : undefined}
                        onDelete={canEdit() ? () => setDeleteConfirm({ type: 'member', id: member.id }) : undefined}
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

      {/* Edit Medicine Modal */}
      <Modal
        isOpen={!!editingMedicine}
        onClose={() => setEditingMedicine(null)}
        title="Edit Medicine"
        size="lg"
      >
        {editingMedicine && (
          <MedicineForm
            medicine={editingMedicine}
            familyMembers={familyMembers}
            onSubmit={async (data) => {
              await updateMedicine(editingMedicine.id, data);
              setEditingMedicine(null);
              toast.success('Medicine updated successfully');
            }}
            onCancel={() => setEditingMedicine(null)}
          />
        )}
      </Modal>

      {/* Edit Family Member Modal */}
      <Modal
        isOpen={!!editingFamilyMember}
        onClose={() => setEditingFamilyMember(null)}
        title="Edit Family Member"
      >
        {editingFamilyMember && (
          <FamilyMemberForm
            member={editingFamilyMember}
            usedColors={familyMembers.filter(m => m.id !== editingFamilyMember.id).map(m => m.color)}
            onSubmit={async (data) => {
              await updateFamilyMember(editingFamilyMember.id, data);
              setEditingFamilyMember(null);
              toast.success('Family member updated successfully');
            }}
            onCancel={() => setEditingFamilyMember(null)}
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
            Are you sure you want to delete this {deleteConfirm?.type === 'medicine' ? 'medicine' : 'family member'}? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={async () => {
                if (deleteConfirm?.type === 'medicine') {
                  await deleteMedicine(deleteConfirm.id);
                  toast.success('Medicine deleted successfully');
                } else if (deleteConfirm?.type === 'member') {
                  await deleteFamilyMember(deleteConfirm.id);
                  toast.success('Family member deleted successfully');
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
