import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  Eye,
  Save,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button, Card, Input, Select, Modal, EmptyState } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { USER_ROLES, ROLE_LABELS, ROLE_COLORS } from '../config/constants';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

interface UserEntry {
  email: string;
  role: UserRole;
}

export const UserManagementPage: React.FC = () => {
  const { canManageUsers, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('read_only');
  const [emailError, setEmailError] = useState('');
  
  // Load users from Firestore, fallback to constants
  const loadUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'userRoles'));
      if (snapshot.empty) {
        // Initialize from constants if Firestore is empty
        const userList = Object.entries(USER_ROLES).map(([email, role]) => ({
          email,
          role: role as UserRole,
        }));
        // Seed Firestore with initial users
        for (const user of userList) {
          await setDoc(doc(db, 'userRoles', user.email), { role: user.role });
        }
        setUsers(userList);
      } else {
        const userList = snapshot.docs.map(d => ({
          email: d.id,
          role: d.data().role as UserRole,
        }));
        setUsers(userList);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to constants
      const userList = Object.entries(USER_ROLES).map(([email, role]) => ({
        email,
        role: role as UserRole,
      }));
      setUsers(userList);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleAddUser = async () => {
    setEmailError('');
    
    if (!newEmail.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    if (users.some(u => u.email.toLowerCase() === newEmail.toLowerCase())) {
      setEmailError('This email already exists');
      return;
    }
    
    try {
      const emailLower = newEmail.toLowerCase();
      await setDoc(doc(db, 'userRoles', emailLower), { role: newRole });
      setUsers(prev => [...prev, { email: emailLower, role: newRole }]);
      toast.success(`User ${newEmail} added with ${ROLE_LABELS[newRole]} role`);
      
      setNewEmail('');
      setNewRole('read_only');
      setShowAddUser(false);
    } catch (error) {
      toast.error('Failed to add user');
      console.error(error);
    }
  };
  
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    if (editingUser.email === currentUser?.email && editingUser.role !== 'superadmin') {
      toast.error("You can't demote yourself from Super Admin");
      return;
    }
    
    try {
      await setDoc(doc(db, 'userRoles', editingUser.email), { role: editingUser.role });
      setUsers(prev => prev.map(u => 
        u.email === editingUser.email ? editingUser : u
      ));
      toast.success(`User ${editingUser.email} updated to ${ROLE_LABELS[editingUser.role]}`);
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update user');
      console.error(error);
    }
  };
  
  const handleDeleteUser = async (email: string) => {
    if (email === currentUser?.email) {
      toast.error("You can't delete your own account");
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'userRoles', email));
      setUsers(prev => prev.filter(u => u.email !== email));
      toast.success(`User ${email} removed`);
    } catch (error) {
      toast.error('Failed to remove user');
      console.error(error);
    }
    
    setDeleteConfirm(null);
  };
  
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };
  
  if (!canManageUsers()) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
        <div className="bg-gradient-to-r from-maroon-500 via-maroon-600 to-primary-600 text-white px-4 py-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-indian-pattern opacity-10"></div>
          <div className="relative">
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
        </div>
        <div className="px-4 py-8">
          <Card className="bg-white/80 backdrop-blur border border-gold-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-maroon-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-maroon-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Super Admins can manage users and roles.</p>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-cream-500 via-primary-50 to-secondary-50 bg-indian-pattern">
      {/* Header with Indian styling */}
      <div className="bg-gradient-to-r from-maroon-500 via-maroon-600 to-primary-600 text-white px-4 py-6 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-indian-pattern opacity-10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <h1 className="text-2xl font-bold">User Management</h1>
            </div>
            <button 
              onClick={loadUsers}
              disabled={loading}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-white/80 text-sm">Manage users and their access roles</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Add User Button */}
        <Button
          variant="primary"
          onClick={() => setShowAddUser(true)}
          icon={<Plus className="w-4 h-4" />}
          className="w-full mb-4"
        >
          Add New User
        </Button>
        
        {/* Role Legend */}
        <Card className="bg-white/80 backdrop-blur border border-gold-200 mb-4">
          <div className="p-3">
            <p className="text-sm font-medium text-maroon-600 mb-2">Role Permissions:</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" style={{ color: ROLE_COLORS.superadmin }} />
                <span><strong>Super Admin:</strong> Full access + User management</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" style={{ color: ROLE_COLORS.admin }} />
                <span><strong>Admin:</strong> Add, Edit, Delete data</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" style={{ color: ROLE_COLORS.read_only }} />
                <span><strong>Read Only:</strong> View only</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Users List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No users configured"
            description="Add users to allow them access to the app"
          />
        ) : (
          <div className="space-y-3">
            {users.map((userEntry, index) => (
              <motion.div
                key={userEntry.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-white/90 backdrop-blur border border-gold-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: ROLE_COLORS[userEntry.role] }}
                        >
                          {userEntry.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-maroon-600">
                            {userEntry.email}
                            {userEntry.email === currentUser?.email && (
                              <span className="ml-2 text-xs text-primary-500">(You)</span>
                            )}
                          </p>
                          <div 
                            className="flex items-center gap-1 text-sm"
                            style={{ color: ROLE_COLORS[userEntry.role] }}
                          >
                            {getRoleIcon(userEntry.role)}
                            <span>{ROLE_LABELS[userEntry.role]}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingUser(userEntry)}
                          className="p-2 hover:bg-gold-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        {userEntry.email !== currentUser?.email && (
                          <button 
                            onClick={() => setDeleteConfirm(userEntry.email)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddUser}
        onClose={() => {
          setShowAddUser(false);
          setNewEmail('');
          setNewRole('read_only');
          setEmailError('');
        }}
        title="Add New User"
      >
        <div className="space-y-4 p-4">
          <Input
            label="Email Address *"
            type="email"
            placeholder="user@example.com"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setEmailError('');
            }}
            error={emailError}
          />
          
          <Select
            label="Role *"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            options={[
              { value: 'read_only', label: 'Read Only - View data only' },
              { value: 'admin', label: 'Admin - Full data access' },
              { value: 'superadmin', label: 'Super Admin - Full access + User management' },
            ]}
          />
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddUser(false);
                setNewEmail('');
                setNewRole('read_only');
                setEmailError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddUser}
              icon={<Plus className="w-4 h-4" />}
              className="flex-1"
            >
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User Role"
      >
        {editingUser && (
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-maroon-600 font-medium">{editingUser.email}</p>
            </div>
            
            <Select
              label="Role *"
              value={editingUser.role}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
              options={[
                { value: 'read_only', label: 'Read Only - View data only' },
                { value: 'admin', label: 'Admin - Full data access' },
                { value: 'superadmin', label: 'Super Admin - Full access + User management' },
              ]}
            />
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateUser}
                icon={<Save className="w-4 h-4" />}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="p-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to remove <strong>{deleteConfirm}</strong>? 
            They will no longer be able to access the app.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && handleDeleteUser(deleteConfirm)}
              icon={<Trash2 className="w-4 h-4" />}
              className="flex-1"
            >
              Remove User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
