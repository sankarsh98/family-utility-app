import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  Package,
  Plus,
  Minus,
  Camera,
  ExternalLink,
  User,
  Calendar,
  IndianRupee,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Medicine, FamilyMember } from '../../types';
import { Card, Button, Badge, ProgressBar, Modal, Input, Select, TextArea } from '../ui';
import { MEDICINE_TIMINGS } from '../../config/constants';

interface MedicineCardProps {
  medicine: Medicine;
  familyMembers: FamilyMember[];
  onTakeMedicine?: (medicineId: string, memberId: string, quantity: number) => void;
  onClick?: () => void;
  daysRemaining: number;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ 
  medicine, 
  familyMembers,
  onTakeMedicine,
  onClick,
  daysRemaining 
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLowStock = daysRemaining <= 7;
  const isExpired = medicine.expiryDate && medicine.expiryDate < new Date();
  const assignedMembers = familyMembers.filter(m => medicine.assignedTo.includes(m.id));

  const getTimingLabel = (timing: string) => {
    return MEDICINE_TIMINGS.find(t => t.value === timing)?.label || timing;
  };

  return (
    <Card className={`${isExpired ? 'border-2 border-red-300' : isLowStock ? 'border-2 border-yellow-300' : ''}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3" onClick={onClick}>
          {medicine.images.length > 0 ? (
            <img 
              src={medicine.images[0]} 
              alt={medicine.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center">
              <Pill className="w-8 h-8 text-green-600" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                {medicine.strength && (
                  <p className="text-sm text-gray-500">{medicine.strength}</p>
                )}
              </div>
              <div className="flex gap-1">
                {isExpired && <Badge variant="danger">Expired</Badge>}
                {isLowStock && !isExpired && <Badge variant="warning">Low Stock</Badge>}
              </div>
            </div>

            {/* Assigned members */}
            <div className="flex flex-wrap gap-1 mt-2">
              {assignedMembers.map(member => (
                <span
                  key={member.id}
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stock progress */}
        <div className="mt-4">
          <ProgressBar
            value={medicine.currentQuantity}
            max={medicine.totalQuantity}
            label={`${medicine.currentQuantity} / ${medicine.totalQuantity} ${medicine.form === 'tablet' || medicine.form === 'capsule' ? 'tablets' : 'ml'}`}
            color={isExpired ? 'danger' : isLowStock ? 'warning' : 'success'}
          />
          <p className="text-xs text-gray-500 mt-1">
            {daysRemaining === Infinity ? 'Not being taken daily' : `~${daysRemaining} days remaining`}
          </p>
        </div>

        {/* Timing pills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {medicine.timing.map(timing => (
            <span
              key={timing}
              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
            >
              {getTimingLabel(timing)}
            </span>
          ))}
        </div>

        {/* Expand/Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Less details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              More details
            </>
          )}
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                {/* Dosage */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Dosage</span>
                  <span className="font-medium">
                    {medicine.quantityPerDose} {medicine.form}(s) x {medicine.dosagePerDay}/day
                  </span>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Cost per pack</span>
                  <span className="font-medium">₹{medicine.costPerPack}</span>
                </div>

                {/* Cost per unit */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Cost per {medicine.form}</span>
                  <span className="font-medium">
                    ₹{(medicine.costPerPack / medicine.totalQuantity).toFixed(2)}
                  </span>
                </div>

                {/* Expiry */}
                {medicine.expiryDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expiry</span>
                    <span className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                      {format(medicine.expiryDate, 'dd MMM yyyy')}
                    </span>
                  </div>
                )}

                {/* Prescribed by */}
                {medicine.prescribedBy && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Prescribed by</span>
                    <span className="font-medium">{medicine.prescribedBy}</span>
                  </div>
                )}

                {/* Google link */}
                {medicine.googleInfoUrl && (
                  <a
                    href={medicine.googleInfoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    More info on Google
                  </a>
                )}

                {/* Notes */}
                {medicine.notes && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">{medicine.notes}</p>
                  </div>
                )}

                {/* Take medicine action */}
                {onTakeMedicine && assignedMembers.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Mark as taken:</p>
                    <div className="flex flex-wrap gap-2">
                      {assignedMembers.map(member => (
                        <Button
                          key={member.id}
                          size="sm"
                          variant="outline"
                          onClick={() => onTakeMedicine(medicine.id, member.id, medicine.quantityPerDose)}
                          icon={<Minus className="w-3 h-3" />}
                        >
                          {member.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

interface MedicineFormProps {
  medicine?: Medicine;
  familyMembers: FamilyMember[];
  onSubmit: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({
  medicine,
  familyMembers,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Medicine>>(medicine || {
    name: '',
    form: 'tablet',
    images: [],
    assignedTo: [],
    dosagePerDay: 1,
    quantityPerDose: 1,
    timing: [],
    totalQuantity: 10,
    currentQuantity: 10,
    costPerPack: 0,
  });

  const [selectedTimings, setSelectedTimings] = useState<string[]>(medicine?.timing || []);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(medicine?.assignedTo || []);

  const handleSubmit = () => {
    if (!formData.name) return;

    onSubmit({
      name: formData.name!,
      genericName: formData.genericName,
      manufacturer: formData.manufacturer,
      strength: formData.strength,
      form: formData.form as Medicine['form'],
      images: formData.images || [],
      assignedTo: selectedMembers,
      dosagePerDay: formData.dosagePerDay || 1,
      quantityPerDose: formData.quantityPerDose || 1,
      timing: selectedTimings,
      totalQuantity: formData.totalQuantity || 10,
      currentQuantity: formData.currentQuantity || formData.totalQuantity || 10,
      stripCount: formData.stripCount,
      tabletsPerStrip: formData.tabletsPerStrip,
      costPerPack: formData.costPerPack || 0,
      prescribedBy: formData.prescribedBy,
      prescriptionDate: formData.prescriptionDate,
      expiryDate: formData.expiryDate,
      googleInfoUrl: formData.googleInfoUrl || `https://www.google.com/search?q=${encodeURIComponent(formData.name + ' medicine')}`,
      notes: formData.notes,
      lastRefillDate: formData.lastRefillDate,
    });
  };

  const toggleTiming = (timing: string) => {
    setSelectedTimings(prev => 
      prev.includes(timing) 
        ? prev.filter(t => t !== timing)
        : [...prev, timing]
    );
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(m => m !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Basic Information</h4>
        
        <Input
          label="Medicine Name *"
          placeholder="e.g., Paracetamol"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Generic Name"
            placeholder="e.g., Acetaminophen"
            value={formData.genericName || ''}
            onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
          />
          <Input
            label="Strength"
            placeholder="e.g., 500mg"
            value={formData.strength || ''}
            onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Form"
            value={formData.form || 'tablet'}
            onChange={(e) => setFormData({ ...formData, form: e.target.value as any })}
            options={[
              { value: 'tablet', label: 'Tablet' },
              { value: 'capsule', label: 'Capsule' },
              { value: 'syrup', label: 'Syrup' },
              { value: 'injection', label: 'Injection' },
              { value: 'cream', label: 'Cream' },
              { value: 'drops', label: 'Drops' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            label="Manufacturer"
            placeholder="Company name"
            value={formData.manufacturer || ''}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />
        </div>
      </div>

      {/* Assigned To */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Assigned To</h4>
        <div className="flex flex-wrap gap-2">
          {familyMembers.map(member => (
            <button
              key={member.id}
              onClick={() => toggleMember(member.id)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedMembers.includes(member.id)
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              style={selectedMembers.includes(member.id) ? { backgroundColor: member.color } : {}}
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dosage */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Dosage Information</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Doses per day"
            value={formData.dosagePerDay || 1}
            onChange={(e) => setFormData({ ...formData, dosagePerDay: parseInt(e.target.value) })}
            min={1}
          />
          <Input
            type="number"
            label="Quantity per dose"
            value={formData.quantityPerDose || 1}
            onChange={(e) => setFormData({ ...formData, quantityPerDose: parseFloat(e.target.value) })}
            min={0.5}
            step={0.5}
          />
        </div>

        {/* Timing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">When to take</label>
          <div className="flex flex-wrap gap-2">
            {MEDICINE_TIMINGS.map(timing => (
              <button
                key={timing.value}
                onClick={() => toggleTiming(timing.value)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedTimings.includes(timing.value)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {timing.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Stock Information</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Total Quantity"
            value={formData.totalQuantity || 10}
            onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) })}
            min={1}
          />
          <Input
            type="number"
            label="Current Quantity"
            value={formData.currentQuantity || formData.totalQuantity || 10}
            onChange={(e) => setFormData({ ...formData, currentQuantity: parseInt(e.target.value) })}
            min={0}
          />
        </div>

        {(formData.form === 'tablet' || formData.form === 'capsule') && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Number of Strips"
              value={formData.stripCount || ''}
              onChange={(e) => setFormData({ ...formData, stripCount: parseInt(e.target.value) })}
              min={1}
            />
            <Input
              type="number"
              label="Tablets per Strip"
              value={formData.tabletsPerStrip || ''}
              onChange={(e) => setFormData({ ...formData, tabletsPerStrip: parseInt(e.target.value) })}
              min={1}
            />
          </div>
        )}

        <Input
          type="number"
          label="Cost per Pack (₹)"
          value={formData.costPerPack || ''}
          onChange={(e) => setFormData({ ...formData, costPerPack: parseFloat(e.target.value) })}
          min={0}
        />
      </div>

      {/* Additional Info */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Additional Information</h4>
        
        <Input
          label="Prescribed By"
          placeholder="Doctor's name"
          value={formData.prescribedBy || ''}
          onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
        />

        <Input
          type="date"
          label="Expiry Date"
          value={formData.expiryDate ? format(formData.expiryDate, 'yyyy-MM-dd') : ''}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : undefined })}
        />

        <TextArea
          label="Notes"
          placeholder="Any additional notes..."
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="flex-1">
          {medicine ? 'Update' : 'Add'} Medicine
        </Button>
      </div>
    </div>
  );
};

interface FamilyMemberCardProps {
  member: FamilyMember;
  medicineCount: number;
  monthlyCost: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  medicineCount,
  monthlyCost,
  onEdit,
  onDelete,
}) => {
  return (
    <Card hoverable>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: member.color }}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.relation}</p>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">{medicineCount}</p>
            <p className="text-xs text-gray-500">Medicines</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">₹{monthlyCost.toFixed(0)}</p>
            <p className="text-xs text-gray-500">Monthly Cost</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
