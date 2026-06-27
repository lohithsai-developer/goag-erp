import { useState, useEffect } from 'react';
import {
  Users, UserPlus, Edit2, Trash2, X,
  Package, Drone, Plus, Search,
  UserCheck, RefreshCw,
  Home, LogOut, Briefcase, Calendar,
  ShoppingBag, Wrench,
  BarChart3,
  ExternalLink, KeyRound,
  CalendarDays, Check,
  FileText,
  ClipboardList,
  ShieldCheck,
  LogIn,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI, droneAPI, orderAPI, quotationAPI, taskAPI, serviceRequestAPI } from "@/services";
import SalesManagerUI from './SalesManagerUI';
import ProductionManagerUI from './ProductionManagerUI';
import AfterSalesManagerUI from './AfterSalesManagerUI';
import QualityManagerUI from './QualityManagerUI';
import AccountantUI from './AccountantUI';
import EmployeePortal from './EmployeePortal';

const LOGO = "https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_99,h_99,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png";

// ================ ROLE LABELS ================
const ROLE_LABELS = {
  admin: 'Administrator',
  sales: 'Sales Manager',
  production: 'Production Manager',
  aftersales: 'After Sales Manager',
  quality: 'Quality Manager',
  accountant: 'Accountant',
  employee: 'Employee'
};

const ROLE_COLORS = {
  admin: '#EF4444',
  sales: '#3B82F6',
  production: '#F59E0B',
  aftersales: '#10B981',
  quality: '#8B5CF6',
  accountant: '#EC4899',
  employee: '#6B7280'
};

// ================ ROLE TO COMPONENT MAPPER ================
const getRoleComponent = (role, user, onLogout) => {
  switch (role) {
    case 'admin':
      return <AdminDashboard user={user} onLogout={onLogout} />;
    case 'sales':
      return <SalesManagerUI user={user} onLogout={onLogout} />;
    case 'production':
      return <ProductionManagerUI user={user} onLogout={onLogout} />;
    case 'aftersales':
      return <AfterSalesManagerUI user={user} onLogout={onLogout} />;
    case 'quality':
      return <QualityManagerUI user={user} onLogout={onLogout} />;
    case 'accountant':
      return <AccountantUI user={user} onLogout={onLogout} />;
    case 'employee':
      return <EmployeePortal user={user} onLogout={onLogout} />;
    default:
      return <ProductionManagerUI user={user} onLogout={onLogout} />;
  }
};

// ================ GET AUTH TOKEN ================
const getAuthToken = () => {
  let token = localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jwt');

  if (!token) {
    console.warn('⚠️ No token found');
    return null;
  }
  return token;
};

export default function AdminDashboard({ user: adminUser, onLogout }) {
  // ============ STATE ============
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [droneModels, setDroneModels] = useState([]);
  const [addons, setAddons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [qualityChecks, setQualityChecks] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState([]);

  // ============ USER ACCESS / IMPERSONATION ============
  const [impersonatedUser, setImpersonatedUser] = useState(null);
  const [showImpersonateConfirm, setShowImpersonateConfirm] = useState(null);

  // User management
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Drone management
  const [showAddDrone, setShowAddDrone] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);
  const [newDrone, setNewDrone] = useState({ name: '', price: 0, taxRate: 18 });

  // Add-on management
  const [showAddAddon, setShowAddAddon] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [newAddon, setNewAddon] = useState({ label: '', price: 0, category: 'Accessories' });

  // Edit modals for other modules
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);
  const [editingServiceRequest, setEditingServiceRequest] = useState(null);
  const [editingQualityCheck, setEditingQualityCheck] = useState(null);

  // ============ AUTO LOGIN ============
  const autoLogin = async () => {
    try {
      console.log('🔐 Attempting auto-login...');
      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@goag.com',
          password: 'admin123'
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('✅ Auto-login successful');
        loadAllData();
      } else {
        console.error('❌ Auto-login failed:', data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Auto-login error:', error.message);
      setLoading(false);
    }
  };

  // ============ LOAD ALL DATA FROM FIREBASE ============
  const loadAllData = async () => {
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // ✅ Load users with token
      const usersRes = await userAPI.getAll(token);
      console.log('📡 Users response:', usersRes);

      if (usersRes.success && usersRes.data && usersRes.data.length > 0) {
        setUsers(usersRes.data);
      } else {
        // If no users, set default admin
        const defaultUsers = [
          { id: 'admin@goag.com', email: 'admin@goag.com', name: 'Admin User', role: 'admin', hasAccess: true, department: 'Management' },
        ];
        setUsers(defaultUsers);
      }

      // Load other data...
      const dronesRes = await droneAPI.getAll(token);
      if (dronesRes.success) {
        setDroneModels(dronesRes.data);
      }

      // ... rest of your load code

    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Failed to load data');
    }

    setLoading(false);
  };

  // ============ LEAVE MANAGEMENT ============
  const loadLeaveRequests = () => {
    setLeaveRequests([]);
  };

  const handleApproveLeave = (leaveId) => {
    toast.success('✅ Leave request approved');
  };

  const handleRejectLeave = (leaveId) => {
    toast.success('❌ Leave request rejected');
  };

  // ============ USER CRUD ============
  const handleAddUser = async (e) => {
    e.preventDefault();
    // ... validation code ...

    try {
      const response = await userAPI.create(userData, token);
      console.log('📡 Create response:', response);

      if (response.success) {
        toast.success(`User ${newUser.name} created successfully`);
        setShowAddUser(false);
        setNewUser({ name: '', email: '', password: '', role: 'employee', department: '' });

        // ✅ Force refresh the user list
        await loadAllData();

        // ✅ Update the users state directly if needed
        if (response.data) {
          setUsers(prev => [...prev, response.data]);
        }
      } else {
        const errorMsg = response.errors
          ? response.errors.map(e => e.message).join(', ')
          : response.message;
        toast.error(errorMsg || 'Failed to create user');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to create user');
    }
  };

  const handleEditUser = (userData) => {
    setEditingUser(userData);
    setNewUser({
      name: userData.name,
      email: userData.email,
      password: '',
      role: userData.role,
      department: userData.department || ''
    });
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      // ✅ Only send fields the backend accepts
      const updateData = {
        name: newUser.name.trim(),
        role: newUser.role.toLowerCase().trim(),
        department: newUser.department || ''
      };

      if (newUser.password) {
        updateData.password = newUser.password;
      }

      const response = await userAPI.update(editingUser.email, updateData, token);

      if (response.success) {
        toast.success('User updated successfully');
        setEditingUser(null);
        setNewUser({ name: '', email: '', password: '', role: 'employee', department: '' });
        loadAllData();
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = getAuthToken();
    if (!token) return;

    if (userId === 'admin@goag.com') {
      toast.error('Cannot delete the main admin user');
      return;
    }

    try {
      const response = await userAPI.delete(userId, token);
      if (response.success) {
        toast.success('User deleted successfully');
        setShowDeleteConfirm(null);
        loadAllData();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const toggleUserAccess = async (userId) => {
    const token = getAuthToken();
    if (!token) return;

    if (userId === 'admin@goag.com') {
      toast.error('Cannot modify admin access');
      return;
    }

    try {
      const response = await userAPI.toggleAccess(userId, token);
      if (response.success) {
        toast.success(`User access ${response.message}`);
        loadAllData();
      } else {
        toast.error(response.message || 'Failed to toggle access');
      }
    } catch (error) {
      toast.error('Failed to toggle access');
    }
  };

  // ============ IMPERSONATE / ACCESS USER ============
  const handleAccessUser = (targetUser) => {
    if (targetUser.email === adminUser?.email) {
      toast.error('You are already logged in as admin');
      return;
    }
    if (targetUser.hasAccess === false) {
      toast.error('This user account is suspended. Enable access first.');
      return;
    }
    setShowImpersonateConfirm(targetUser);
  };

  const confirmImpersonate = () => {
    const targetUser = showImpersonateConfirm;
    if (!targetUser) return;

    setImpersonatedUser(targetUser);
    setShowImpersonateConfirm(null);

    toast.success(`Now viewing as ${targetUser.name} (${targetUser.role})`);
  };

  const stopImpersonating = () => {
    setImpersonatedUser(null);
    toast.success('Returned to Admin Dashboard');
  };

  // ============ DRONE CRUD ============
  const handleAddDrone = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    if (!newDrone.name || newDrone.price <= 0) {
      toast.error('Please enter valid drone name and price');
      return;
    }

    try {
      const response = await droneAPI.create({
        ...newDrone,
        id: Date.now()
      }, token);
      if (response.success) {
        toast.success(`Drone model ${newDrone.name} added`);
        setShowAddDrone(false);
        setNewDrone({ name: '', price: 0, taxRate: 18 });
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to add drone');
    }
  };

  const handleEditDrone = (drone) => {
    setEditingDrone(drone);
    setNewDrone({ name: drone.name, price: drone.price, taxRate: drone.taxRate || 18 });
  };

  const handleSaveEditDrone = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    if (!newDrone.name || newDrone.price <= 0) {
      toast.error('Please enter valid drone name and price');
      return;
    }

    try {
      const response = await droneAPI.update(editingDrone.id, newDrone, token);
      if (response.success) {
        toast.success('Drone model updated');
        setEditingDrone(null);
        setNewDrone({ name: '', price: 0, taxRate: 18 });
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to update drone');
    }
  };

  const handleDeleteDrone = async (droneId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await droneAPI.delete(droneId, token);
      if (response.success) {
        toast.success('Drone model deleted');
        setShowDeleteConfirm(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to delete drone');
    }
  };

  // ============ ADDON CRUD ============
  const handleAddAddon = async (e) => {
    e.preventDefault();
    if (!newAddon.label || newAddon.price <= 0) {
      toast.error('Please enter valid add-on name and price');
      return;
    }

    const newAddonObj = { ...newAddon, id: Date.now().toString() };
    setAddons([...addons, newAddonObj]);
    toast.success(`Add-on ${newAddon.label} added`);
    setShowAddAddon(false);
    setNewAddon({ label: '', price: 0, category: 'Accessories' });
  };

  const handleEditAddon = (addon) => {
    setEditingAddon(addon);
    setNewAddon({ label: addon.label, price: addon.price, category: addon.category || 'Accessories' });
  };

  const handleSaveEditAddon = (e) => {
    e.preventDefault();
    if (!newAddon.label || newAddon.price <= 0) {
      toast.error('Please enter valid add-on name and price');
      return;
    }
    const updated = addons.map(a =>
      a.id === editingAddon.id
        ? { ...a, label: newAddon.label, price: newAddon.price, category: newAddon.category }
        : a
    );
    setAddons(updated);
    toast.success('Add-on updated');
    setEditingAddon(null);
    setNewAddon({ label: '', price: 0, category: 'Accessories' });
  };

  const handleDeleteAddon = (addonId) => {
    const updated = addons.filter(a => a.id !== addonId);
    setAddons(updated);
    toast.success('Add-on deleted');
    setShowDeleteConfirm(null);
  };

  // ============ ORDER CRUD ============
  const handleEditOrder = (order) => {
    setEditingOrder(order);
  };

  const handleSaveEditOrder = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await orderAPI.update(editingOrder.id, editingOrder, token);
      if (response.success) {
        toast.success('Order updated successfully');
        setEditingOrder(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await orderAPI.delete(orderId, token);
      if (response.success) {
        toast.success('Order deleted');
        setShowDeleteConfirm(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await orderAPI.updateStatus(orderId, newStatus, token);
      if (response.success) {
        toast.success(`Order status updated to ${newStatus}`);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // ============ QUOTATION CRUD ============
  const handleEditQuotation = (quotation) => {
    setEditingQuotation(quotation);
  };

  const handleSaveEditQuotation = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await quotationAPI.update(editingQuotation.id, editingQuotation, token);
      if (response.success) {
        toast.success('Quotation updated successfully');
        setEditingQuotation(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to update quotation');
    }
  };

  const handleDeleteQuotation = async (quotationId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await quotationAPI.delete(quotationId, token);
      if (response.success) {
        toast.success('Quotation deleted');
        setShowDeleteConfirm(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  };

  // ============ TASK CRUD ============
  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleSaveEditTask = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await taskAPI.update(editingTask.id, editingTask, token);
      if (response.success) {
        toast.success('Task updated successfully');
        setEditingTask(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await taskAPI.delete(taskId, token);
      if (response.success) {
        toast.success('Task deleted');
        setShowDeleteConfirm(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // ============ EMPLOYEE CRUD ============
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
  };

  const handleSaveEditEmployee = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await userAPI.update(editingEmployee.email, editingEmployee, token);
      if (response.success) {
        toast.success('Employee updated successfully');
        setEditingEmployee(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await userAPI.delete(employeeId, token);
      if (response.success) {
        toast.success('Employee deleted');
        setShowDeleteConfirm(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  // ============ SERVICE REQUEST CRUD ============
  const handleEditService = (service) => {
    setEditingServiceRequest(service);
  };

  const handleSaveEditService = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await serviceRequestAPI.update(editingServiceRequest.id, editingServiceRequest, token);
      if (response.success) {
        toast.success('Service request updated successfully');
        setEditingServiceRequest(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to update service request');
    }
  };

  const handleDeleteService = async (serviceId) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await serviceRequestAPI.delete(serviceId, token);
      if (response.success) {
        toast.success('Service request deleted');
        setShowDeleteConfirm(null);
        loadAllData();
      }
    } catch (error) {
      toast.error('Failed to delete service request');
    }
  };

  // ============ UTILITY ============
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getRoleColor = (role) => ROLE_COLORS[role] || '#6B7280';
  const getRoleLabel = (role) => ROLE_LABELS[role] || role;

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDING': { bg: '#FEF3C7', color: '#D97706', label: 'Pending' },
      'IN_PROGRESS': { bg: '#DBEAFE', color: '#2563EB', label: 'In Progress' },
      'QUALITY_CHECK': { bg: '#EDE9FE', color: '#7C3AED', label: 'Quality Check' },
      'COMPLETED': { bg: '#D1FAE5', color: '#059669', label: 'Completed' },
      'DELIVERED': { bg: '#D1FAE5', color: '#059669', label: 'Delivered' },
      'ASSIGNED': { bg: '#E0E7FF', color: '#4338CA', label: 'Assigned' },
      'CANCELLED': { bg: '#FEE2E2', color: '#DC2626', label: 'Cancelled' },
      'approved': { bg: '#D1FAE5', color: '#059669', label: 'Approved' },
      'rejected': { bg: '#FEE2E2', color: '#DC2626', label: 'Rejected' },
      'converted': { bg: '#EDE9FE', color: '#7C3AED', label: 'Converted' },
    };
    return styles[status] || { bg: '#F3F4F6', color: '#6B7280', label: status };
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    totalDrones: droneModels.length,
    totalAddons: addons.length,
    activeUsers: users.filter(u => u.hasAccess !== false).length,
    totalOrders: orders.length,
    totalQuotations: quotations.length,
    totalTasks: tasks.length,
    totalEmployees: employees.length,
    totalInventory: inventory.length,
    totalServices: serviceRequests.length,
    totalQuality: qualityChecks.length,
  };

  useEffect(() => {
    // Check if token exists, if not auto-login
    const token = getAuthToken();
    if (!token) {
      autoLogin();
    } else {
      loadAllData();
    }
    loadLeaveRequests();
  }, []);

  // ============ RENDER ============

  // If impersonating a user, render their dashboard
  if (impersonatedUser) {
    return (
      <div>
        <div style={{
          background: '#F59E0B', color: '#92400E', padding: '8px 16px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', fontSize: '13px',
          fontWeight: '500', position: 'sticky', top: 0, zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Fingerprint size={18} />
            <span>🔐 You are viewing as <strong>{impersonatedUser.name}</strong> ({getRoleLabel(impersonatedUser.role)})</span>
            <span style={{ fontSize: '11px', opacity: 0.7, background: 'rgba(0,0,0,0.1)', padding: '2px 10px', borderRadius: '12px' }}>Admin Access Mode</span>
          </div>
          <button onClick={stopImpersonating} style={{
            background: '#92400E', color: 'white', border: 'none', padding: '4px 14px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <LogOut size={14} /> Return to Admin
          </button>
        </div>
        {getRoleComponent(impersonatedUser.role, impersonatedUser, () => {
          stopImpersonating();
        })}
      </div>
    );
  }

  // Loading Screen
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F0F4F0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
          <div style={{ color: '#6B7280' }}>Loading Admin Dashboard...</div>
        </div>
      </div>
    );
  }

  // ============ ADMIN DASHBOARD ============
  return (
    <div style={{ background: '#F0F4F0', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ========== HEADER ========== */}
      <header style={{
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
        color: 'white', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={LOGO} alt="GOAG" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', padding: '4px' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>GOAG SERVICES</h1>
            <p style={{ margin: '2px 0 0', fontSize: '10px', opacity: 0.8 }}>Administration Control Panel</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={loadAllData} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', padding: '6px 12px',
            borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{adminUser?.name || 'Admin'}</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>{adminUser?.email || 'admin@goag.com'}</div>
          </div>
          <button onClick={onLogout} style={{
            background: '#DC2626', border: 'none', padding: '6px 16px', borderRadius: '8px',
            color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
          }}>Logout</button>
        </div>
      </header>

      {/* ========== NAV ========== */}
      <nav style={{
        background: 'white', padding: '0 8px', display: 'flex', gap: '2px',
        borderBottom: '1px solid #E5E7EB', overflowX: 'auto', alignItems: 'center'
      }}>
        <button onClick={() => setActiveTab('overview')} style={{
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
          color: activeTab === 'overview' ? '#065F46' : '#6B7280',
          borderBottom: activeTab === 'overview' ? '3px solid #065F46' : '3px solid transparent',
          fontWeight: activeTab === 'overview' ? '600' : '400',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
        }}>
          <BarChart3 size={16} /> Overview
        </button>
        <button onClick={() => setActiveTab('users')} style={{
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
          color: activeTab === 'users' ? '#065F46' : '#6B7280',
          borderBottom: activeTab === 'users' ? '3px solid #065F46' : '3px solid transparent',
          fontWeight: activeTab === 'users' ? '600' : '400',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
        }}>
          <Users size={16} /> Users
        </button>
        <button onClick={() => setActiveTab('drones')} style={{
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
          color: activeTab === 'drones' ? '#065F46' : '#6B7280',
          borderBottom: activeTab === 'drones' ? '3px solid #065F46' : '3px solid transparent',
          fontWeight: activeTab === 'drones' ? '600' : '400',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
        }}>
          <Drone size={16} /> Drones
        </button>
        <button onClick={() => setActiveTab('addons')} style={{
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
          color: activeTab === 'addons' ? '#065F46' : '#6B7280',
          borderBottom: activeTab === 'addons' ? '3px solid #065F46' : '3px solid transparent',
          fontWeight: activeTab === 'addons' ? '600' : '400',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
        }}>
          <Package size={16} /> Add-ons
        </button>
        <button onClick={() => setActiveTab('leaves')} style={{
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
          color: activeTab === 'leaves' ? '#065F46' : '#6B7280',
          borderBottom: activeTab === 'leaves' ? '3px solid #065F46' : '3px solid transparent',
          fontWeight: activeTab === 'leaves' ? '600' : '400',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
        }}>
          <CalendarDays size={16} /> Leaves
        </button>
      </nav>

      <main style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 16px 0' }}>System Overview</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: <Users size={20} />, color: '#065F46' },
                { label: 'Active Users', value: stats.activeUsers, icon: <UserCheck size={20} />, color: '#10B981' },
                { label: 'Drone Models', value: stats.totalDrones, icon: <Drone size={20} />, color: '#3B82F6' },
                { label: 'Add-ons', value: stats.totalAddons, icon: <Package size={20} />, color: '#F59E0B' },
                { label: 'Orders', value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: '#8B5CF6' },
                { label: 'Quotations', value: stats.totalQuotations, icon: <FileText size={20} />, color: '#EC4899' },
                { label: 'Tasks', value: stats.totalTasks, icon: <ClipboardList size={20} />, color: '#F97316' },
                { label: 'Employees', value: stats.totalEmployees, icon: <Briefcase size={20} />, color: '#14B8A6' },
                { label: 'Inventory', value: stats.totalInventory, icon: <Package size={20} />, color: '#6366F1' },
                { label: 'Services', value: stats.totalServices, icon: <Wrench size={20} />, color: '#EF4444' },
                { label: 'Quality Checks', value: stats.totalQuality, icon: <ShieldCheck size={20} />, color: '#8B5CF6' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'white', borderRadius: '12px', padding: '14px',
                  border: `1px solid ${stat.color}30`, textAlign: 'center'
                }}>
                  <div style={{ color: stat.color, display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                    {stat.icon}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => { setActiveTab('users'); setShowAddUser(true); }} style={{ background: '#065F46', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserPlus size={14} /> Add User
                </button>
                <button onClick={() => { setActiveTab('drones'); setShowAddDrone(true); }} style={{ background: '#3B82F6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Drone
                </button>
                <button onClick={() => { setActiveTab('addons'); setShowAddAddon(true); }} style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Add-on
                </button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Recent Activity Logs</h3>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>{systemLogs.length} entries</span>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {systemLogs.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF' }}>No activity logs yet</div>
                ) : (
                  systemLogs.slice(0, 10).map(log => (
                    <div key={log.id} style={{ padding: '8px 12px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <div>
                        <span style={{ fontWeight: '500' }}>{log.action}</span>
                        <span style={{ color: '#6B7280', marginLeft: '8px' }}>{log.details}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{formatDate(log.timestamp)}</span>
                        <span style={{ fontSize: '10px', background: '#F3F4F6', padding: '2px 8px', borderRadius: '12px' }}>{log.user}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== USERS TAB ========== */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#065F46" /> User Management
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280' }}>({filteredUsers.length} users)</span>
              </h2>
              <button onClick={() => { setEditingUser(null); setNewUser({ name: '', email: '', password: '', role: 'employee', department: '' }); setShowAddUser(true); }} style={{
                background: '#065F46', color: 'white', border: 'none', padding: '8px 16px',
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: '600'
              }}>
                <UserPlus size={16} /> Add User
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '160px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{
                  width: '100%', padding: '7px 10px 7px 32px', border: '1px solid #E5E7EB',
                  borderRadius: '8px', fontSize: '13px', outline: 'none'
                }} />
              </div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{
                padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: '8px',
                fontSize: '13px', background: 'white'
              }}>
                <option value="all">All Roles</option>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button onClick={loadAllData} style={{
                padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: '8px',
                background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <RefreshCw size={14} />
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Department</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>No users found</td></tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id || u.email} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: getRoleColor(u.role) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: getRoleColor(u.role), fontWeight: '700', fontSize: '11px' }}>
                                {u.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span style={{ fontWeight: '500' }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#4B5563' }}>{u.email}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ background: getRoleColor(u.role) + '20', color: getRoleColor(u.role), padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                              {getRoleLabel(u.role)}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#6B7280' }}>{u.department || '—'}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', background: u.hasAccess !== false ? '#D1FAE5' : '#FEE2E2', color: u.hasAccess !== false ? '#059669' : '#DC2626' }}>
                              {u.hasAccess !== false ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button onClick={() => handleAccessUser(u)} disabled={u.email === adminUser?.email} style={{
                                background: u.email === adminUser?.email ? '#9CA3AF' : '#065F46',
                                border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white',
                                cursor: u.email === adminUser?.email ? 'not-allowed' : 'pointer',
                                fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px'
                              }} title={u.email === adminUser?.email ? 'You are already logged in as this user' : 'Access this user\'s dashboard'}>
                                <ExternalLink size={10} /> Access
                              </button>
                              <button onClick={() => handleEditUser(u)} style={{ background: '#3B82F6', border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                                <Edit2 size={12} />
                              </button>
                              {u.email !== 'admin@goag.com' && (
                                <>
                                  <button onClick={() => toggleUserAccess(u.email)} style={{ background: u.hasAccess !== false ? '#F59E0B' : '#10B981', border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                                    <UserCheck size={12} />
                                  </button>
                                  <button onClick={() => setShowDeleteConfirm({ type: 'user', id: u.email, name: u.name })} style={{ background: '#DC2626', border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: '#E0F2FE', borderRadius: '12px', padding: '12px 16px', marginTop: '12px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#0369A1' }}>
              <KeyRound size={16} />
              <span><strong>Admin Access:</strong> Click the <strong>"Access"</strong> button next to any user to view their dashboard. Click <strong>"Return to Admin"</strong> to come back.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginTop: '16px' }}>
              {Object.entries(ROLE_LABELS).map(([role, label]) => {
                const count = users.filter(u => u.role === role).length;
                return (
                  <div key={role} style={{ background: 'white', borderRadius: '10px', padding: '10px', border: `1px solid ${getRoleColor(role)}30` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#6B7280' }}>{label}</span>
                      <span style={{ fontWeight: '700', color: getRoleColor(role) }}>{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== DRONES TAB ========== */}
        {activeTab === 'drones' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Drone size={20} color="#065F46" /> Drone Models
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280' }}>({droneModels.length} models)</span>
              </h2>
              <button onClick={() => { setEditingDrone(null); setNewDrone({ name: '', price: 0, taxRate: 18 }); setShowAddDrone(true); }} style={{
                background: '#065F46', color: 'white', border: 'none', padding: '8px 16px',
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: '600'
              }}>
                <Plus size={16} /> Add Drone
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>#</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Model Name</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Price</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Tax Rate</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {droneModels.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>No drone models available</td></tr>
                    ) : (
                      droneModels.map((d, idx) => (
                        <tr key={d.id || idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 14px', color: '#6B7280' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 14px', fontWeight: '500' }}>{d.name}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600', color: '#065F46' }}>{formatCurrency(d.price)}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{ background: '#F3F4F6', padding: '2px 10px', borderRadius: '12px', fontSize: '10px' }}>{d.taxRate || 18}%</span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button onClick={() => handleEditDrone(d)} style={{ background: '#3B82F6', border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => setShowDeleteConfirm({ type: 'drone', id: d.id, name: d.name })} style={{ background: '#DC2626', border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== ADD-ONS TAB ========== */}
        {activeTab === 'addons' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} color="#065F46" /> Quick Add-ons
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280' }}>({addons.length} add-ons)</span>
              </h2>
              <button onClick={() => { setEditingAddon(null); setNewAddon({ label: '', price: 0, category: 'Accessories' }); setShowAddAddon(true); }} style={{
                background: '#065F46', color: 'white', border: 'none', padding: '8px 16px',
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: '600'
              }}>
                <Plus size={16} /> Add Add-on
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {addons.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#9CA3AF', gridColumn: '1 / -1' }}>No add-ons available</div>
              ) : (
                addons.map(a => (
                  <div key={a.id} style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{a.label}</span>
                          <span style={{ background: '#F3F4F6', padding: '1px 8px', borderRadius: '10px', fontSize: '9px', color: '#6B7280' }}>{a.category || 'Accessories'}</span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#065F46' }}>{formatCurrency(a.price)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleEditAddon(a)} style={{ background: '#3B82F6', border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => setShowDeleteConfirm({ type: 'addon', id: a.id, name: a.label })} style={{ background: '#DC2626', border: 'none', padding: '4px 8px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== LEAVES TAB ========== */}
        {activeTab === 'leaves' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={20} color="#065F46" /> Leave Management
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280' }}>({leaveRequests.length} requests)</span>
              </h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={leaveFilter} onChange={(e) => setLeaveFilter(e.target.value)} style={{
                  padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '13px', background: 'white'
                }}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={loadLeaveRequests} style={{
                  padding: '7px 12px', border: '1px solid #E5E7EB', borderRadius: '8px',
                  background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Employee</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Dates</th>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Reason</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>No leave requests found</td></tr>
                    ) : (
                      leaveRequests.filter(l => leaveFilter === 'all' || l.status === leaveFilter).map(leave => {
                        const statusColors = {
                          pending: { bg: '#FEF3C7', color: '#D97706', text: 'Pending' },
                          approved: { bg: '#D1FAE5', color: '#059669', text: 'Approved' },
                          rejected: { bg: '#FEE2E2', color: '#DC2626', text: 'Rejected' }
                        };
                        const status = statusColors[leave.status] || statusColors.pending;
                        const canApprove = leave.status === 'pending';

                        return (
                          <tr key={leave.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '500' }}>{leave.employeeName}</td>
                            <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{leave.type}</td>
                            <td style={{ padding: '10px 14px', fontSize: '11px' }}>
                              {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </td>
                            <td style={{ padding: '10px 14px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {leave.reason}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <span style={{ background: status.bg, color: status.color, padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600' }}>
                                {status.text}
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              {canApprove ? (
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button onClick={() => handleApproveLeave(leave.id)} style={{
                                    background: '#10B981', border: 'none', padding: '4px 10px',
                                    borderRadius: '4px', color: 'white', cursor: 'pointer',
                                    fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px'
                                  }}>
                                    <Check size={12} /> Approve
                                  </button>
                                  <button onClick={() => handleRejectLeave(leave.id)} style={{
                                    background: '#DC2626', border: 'none', padding: '4px 10px',
                                    borderRadius: '4px', color: 'white', cursor: 'pointer',
                                    fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px'
                                  }}>
                                    <X size={12} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '10px', color: '#6B7280' }}>
                                  {leave.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginTop: '16px' }}>
              <div style={{ background: 'white', borderRadius: '10px', padding: '10px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>Total</span>
                  <span style={{ fontWeight: '700', color: '#065F46' }}>{leaveRequests.length}</span>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '10px', border: '1px solid #FEF3C7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>Pending</span>
                  <span style={{ fontWeight: '700', color: '#D97706' }}>{leaveRequests.filter(l => l.status === 'pending').length}</span>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '10px', border: '1px solid #D1FAE5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>Approved</span>
                  <span style={{ fontWeight: '700', color: '#059669' }}>{leaveRequests.filter(l => l.status === 'approved').length}</span>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: '10px', padding: '10px', border: '1px solid #FEE2E2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>Rejected</span>
                  <span style={{ fontWeight: '700', color: '#DC2626' }}>{leaveRequests.filter(l => l.status === 'rejected').length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========== MODALS ========== */}

      {/* Add/Edit User Modal */}
      {(showAddUser || editingUser) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => { setShowAddUser(false); setEditingUser(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <form onSubmit={editingUser ? handleSaveEditUser : handleAddUser}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Full Name *</label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" required style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Email *</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@goag.com" required style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Password {editingUser && '(leave blank to keep)'}</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder={editingUser ? 'Leave blank to keep' : 'Enter password'} required={!editingUser} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Role *</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}>
                  <option value="admin">Administrator</option>
                  <option value="sales">Sales Manager</option>
                  <option value="production">Production Manager</option>
                  <option value="aftersales">After Sales Manager</option>
                  <option value="quality">Quality Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Department</label>
                <input type="text" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} placeholder="e.g., Sales, Production" style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 2, padding: '10px', background: '#065F46', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button type="button" onClick={() => { setShowAddUser(false); setEditingUser(null); }} style={{ flex: 1, padding: '10px', background: '#F3F4F6', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Drone Modal */}
      {(showAddDrone || editingDrone) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{editingDrone ? 'Edit Drone Model' : 'Add Drone Model'}</h3>
              <button onClick={() => { setShowAddDrone(false); setEditingDrone(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <form onSubmit={editingDrone ? handleSaveEditDrone : handleAddDrone}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Model Name *</label>
                <input type="text" value={newDrone.name} onChange={(e) => setNewDrone({ ...newDrone, name: e.target.value })} placeholder="e.g., AgriSpray X1" required style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Price (₹) *</label>
                <input type="number" value={newDrone.price} onChange={(e) => setNewDrone({ ...newDrone, price: parseFloat(e.target.value) || 0 })} placeholder="250000" required min="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Tax Rate (%)</label>
                <select value={newDrone.taxRate} onChange={(e) => setNewDrone({ ...newDrone, taxRate: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}>
                  {[0, 5, 12, 18, 28].map(rate => <option key={rate} value={rate}>{rate}%</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 2, padding: '10px', background: '#065F46', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingDrone ? 'Update Drone' : 'Add Drone'}
                </button>
                <button type="button" onClick={() => { setShowAddDrone(false); setEditingDrone(null); }} style={{ flex: 1, padding: '10px', background: '#F3F4F6', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Addon Modal */}
      {(showAddAddon || editingAddon) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{editingAddon ? 'Edit Add-on' : 'Add Add-on'}</h3>
              <button onClick={() => { setShowAddAddon(false); setEditingAddon(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <form onSubmit={editingAddon ? handleSaveEditAddon : handleAddAddon}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Add-on Name *</label>
                <input type="text" value={newAddon.label} onChange={(e) => setNewAddon({ ...newAddon, label: e.target.value })} placeholder="e.g., Extra Battery Set" required style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Price (₹) *</label>
                <input type="number" value={newAddon.price} onChange={(e) => setNewAddon({ ...newAddon, price: parseFloat(e.target.value) || 0 })} placeholder="36500" required min="0" style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>Category</label>
                <select value={newAddon.category} onChange={(e) => setNewAddon({ ...newAddon, category: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px' }}>
                  <option value="Battery">Battery</option>
                  <option value="Parts">Parts</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Service">Service</option>
                  <option value="Software">Software</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 2, padding: '10px', background: '#065F46', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingAddon ? 'Update Add-on' : 'Add Add-on'}
                </button>
                <button type="button" onClick={() => { setShowAddAddon(false); setEditingAddon(null); }} style={{ flex: 1, padding: '10px', background: '#F3F4F6', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Access User Confirmation Modal */}
      {showImpersonateConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '700' }}>Access User Account</h3>
            <p style={{ margin: '0 0 8px', color: '#6B7280', fontSize: '13px' }}>You are about to access <strong>{showImpersonateConfirm.name}</strong>'s account.</p>
            <p style={{ margin: '0 0 20px', color: '#9CA3AF', fontSize: '12px' }}>Role: <strong style={{ color: getRoleColor(showImpersonateConfirm.role) }}>{getRoleLabel(showImpersonateConfirm.role)}</strong> · Status: {showImpersonateConfirm.hasAccess !== false ? '🟢 Active' : '🔴 Suspended'}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={confirmImpersonate} style={{ flex: 2, padding: '10px', background: '#065F46', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <LogIn size={16} /> Access Account
              </button>
              <button onClick={() => setShowImpersonateConfirm(null)} style={{ flex: 1, padding: '10px', background: '#F3F4F6', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '700' }}>Confirm Deletion</h3>
            <p style={{ margin: '0 0 20px', color: '#6B7280', fontSize: '13px' }}>Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => {
                const { type, id } = showDeleteConfirm;
                if (type === 'user') handleDeleteUser(id);
                else if (type === 'drone') handleDeleteDrone(id);
                else if (type === 'addon') handleDeleteAddon(id);
                else if (type === 'order') handleDeleteOrder(id);
                else if (type === 'quotation') handleDeleteQuotation(id);
                else if (type === 'task') handleDeleteTask(id);
                else if (type === 'employee') handleDeleteEmployee(id);
                else if (type === 'inventory') handleDeleteInventory(id);
                else if (type === 'service') handleDeleteService(id);
                else if (type === 'quality') handleDeleteQuality(id);
              }} style={{ flex: 1, padding: '10px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                <Trash2 size={16} style={{ display: 'inline', marginRight: '6px' }} /> Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ flex: 1, padding: '10px', background: '#F3F4F6', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}