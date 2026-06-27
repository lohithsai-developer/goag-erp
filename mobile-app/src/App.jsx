import { useState, useEffect, createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SalesManagerUI from './SalesManagerUI';
import ProductionManagerUI from './ProductionManagerUI';
import AfterSalesManagerUI from './AfterSalesManagerUI';
import QualityManagerUI from './QualityManagerUI';
import AccountantUI from './AccountantUI';
import AdminDashboard from './AdminDashboard';
import EmployeePortal from './EmployeePortal';

// ==================== APP CONTEXT ====================
const AppContext = createContext();

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [droneModels, setDroneModels] = useState([]);
  const [addons, setAddons] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [qualityChecks, setQualityChecks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Storage event listener for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && (e.key.startsWith('erp_') || e.key === 'employees' || e.key === 'drone_models' || e.key === 'addon_models' || e.key === 'quality_drones')) {
        loadAllData();
        setLastUpdate(Date.now());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Broadcast channel for same-tab sync
  useEffect(() => {
    const channel = new BroadcastChannel('erp_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'data_updated') {
        loadAllData();
        setLastUpdate(Date.now());
      }
    };
    return () => channel.close();
  }, []);

  const broadcastUpdate = () => {
    try {
      const channel = new BroadcastChannel('erp_sync');
      channel.postMessage({ type: 'data_updated', timestamp: Date.now() });
      channel.close();
    } catch (e) {
      // BroadcastChannel not supported, ignore
    }
  };

  const loadAllData = () => {
    // Load users
    const storedUsers = localStorage.getItem('erp_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultUsers = [
        { id: 1, email: 'admin@goag.com', password: 'admin123', name: 'Admin User', role: 'admin', hasAccess: true, department: 'Management', createdAt: new Date().toISOString() },
        { id: 2, email: 'sales@goag.com', password: 'sales123', name: 'Sales Manager', role: 'sales', hasAccess: true, department: 'Sales', createdAt: new Date().toISOString() },
        { id: 3, email: 'production@goag.com', password: 'prod123', name: 'Production Manager', role: 'production', hasAccess: true, department: 'Production', createdAt: new Date().toISOString() },
        { id: 4, email: 'service@goag.com', password: 'service123', name: 'Service Manager', role: 'aftersales', hasAccess: true, department: 'Service', createdAt: new Date().toISOString() },
        { id: 5, email: 'qc@goag.com', password: 'qc123', name: 'Quality Manager', role: 'quality', hasAccess: true, department: 'Quality', createdAt: new Date().toISOString() },
        { id: 6, email: 'accounts@goag.com', password: 'acc123', name: 'Accountant', role: 'accountant', hasAccess: true, department: 'Finance', createdAt: new Date().toISOString() },
        { id: 7, email: 'employee@goag.com', password: '123456', name: 'Employee User', role: 'employee', hasAccess: true, department: 'General', createdAt: new Date().toISOString() },
      ];
      setUsers(defaultUsers);
      localStorage.setItem('erp_users', JSON.stringify(defaultUsers));
    }

    // Load drone models
    const storedDrones = localStorage.getItem('drone_models');
    if (storedDrones) {
      setDroneModels(JSON.parse(storedDrones));
    } else {
      const defaultDrones = [
        { id: 1, name: 'AGRIFLOX® CROPS FERTIGINATE™', price: 321300, taxRate: 5 },
        { id: 2, name: 'GOAG AgriSpray X1', price: 250000, taxRate: 18 },
        { id: 3, name: 'Precision Sprayer Pro', price: 450000, taxRate: 18 },
      ];
      setDroneModels(defaultDrones);
      localStorage.setItem('drone_models', JSON.stringify(defaultDrones));
    }

    // Load addons
    const storedAddons = localStorage.getItem('addon_models');
    if (storedAddons) {
      setAddons(JSON.parse(storedAddons));
    } else {
      const defaultAddons = [
        { id: 'extraBattery', label: 'Extra Battery Set', price: 36500, category: 'Battery' },
        { id: 'propellerSet', label: 'Propeller Set (4 pcs)', price: 8500, category: 'Parts' },
        { id: 'carryingCase', label: 'Carrying Case', price: 12500, category: 'Accessories' },
        { id: 'extendedWarranty', label: 'Extended Warranty (2yr)', price: 25000, category: 'Service' },
        { id: 'spareParts', label: 'Spare Parts Kit', price: 15000, category: 'Parts' },
        { id: 'fastCharger', label: 'Fast Charger', price: 3500, category: 'Accessories' },
      ];
      setAddons(defaultAddons);
      localStorage.setItem('addon_models', JSON.stringify(defaultAddons));
    }

    // Load employees
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      const defaultEmployees = [
        { id: 1, name: 'Ramesh Kumar', role: 'Assembly Technician', is_available: true, avatar: '👨‍🔧', tasks_completed: 0, total_tasks: 0, monthly_assigned: 0, monthly_completed: 0 },
        { id: 2, name: 'Suresh Patel', role: 'Quality Inspector', is_available: true, avatar: '🔍', tasks_completed: 0, total_tasks: 0, monthly_assigned: 0, monthly_completed: 0 },
        { id: 3, name: 'Mahesh Singh', role: 'Testing Engineer', is_available: true, avatar: '🧪', tasks_completed: 0, total_tasks: 0, monthly_assigned: 0, monthly_completed: 0 },
        { id: 4, name: 'Dinesh Yadav', role: 'Packaging Staff', is_available: true, avatar: '📦', tasks_completed: 0, total_tasks: 0, monthly_assigned: 0, monthly_completed: 0 },
        { id: 5, name: 'Prakash Reddy', role: 'Senior Technician', is_available: true, avatar: '🔧', tasks_completed: 0, total_tasks: 0, monthly_assigned: 0, monthly_completed: 0 },
      ];
      setEmployees(defaultEmployees);
      localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }

    // Load customers
    const storedCustomers = localStorage.getItem('sales_customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    } else {
      setCustomers([]);
    }

    // Load saved customers
    const storedSavedCustomers = localStorage.getItem('saved_customers');
    if (storedSavedCustomers) {
      setSavedCustomers(JSON.parse(storedSavedCustomers));
    } else {
      setSavedCustomers([]);
    }

    // Load orders
    const storedOrders = localStorage.getItem('production_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    else setOrders([]);

    // Load quotations
    const storedQuotations = localStorage.getItem('sales_quotations');
    if (storedQuotations) setQuotations(JSON.parse(storedQuotations));
    else setQuotations([]);

    // Load tasks
    const storedTasks = localStorage.getItem('production_tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    else setTasks([]);

    // Load service requests
    const storedServices = localStorage.getItem('service_requests');
    if (storedServices) setServiceRequests(JSON.parse(storedServices));
    else setServiceRequests([]);

    // Load quality checks
    const storedQuality = localStorage.getItem('quality_checks');
    if (storedQuality) setQualityChecks(JSON.parse(storedQuality));
    else setQualityChecks([]);

    // Load inventory
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) setInventory(JSON.parse(storedInventory));
    else setInventory([]);

    // Load attendance
    const storedAttendance = localStorage.getItem('employee_attendance');
    if (storedAttendance) setAttendanceRecords(JSON.parse(storedAttendance));
    else setAttendanceRecords([]);

    // Load leave requests
    const storedLeaves = localStorage.getItem('employee_leaves');
    if (storedLeaves) setLeaveRequests(JSON.parse(storedLeaves));
    else setLeaveRequests([]);

    // Load system logs
    const storedLogs = localStorage.getItem('system_activity_logs');
    if (storedLogs) setSystemLogs(JSON.parse(storedLogs));
    else setSystemLogs([]);

    // Load announcements
    const storedAnnouncements = localStorage.getItem('system_announcements');
    if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));
    else setAnnouncements([]);
  };

  // ============ UPDATE FUNCTIONS WITH BROADCAST ============
  const updateAndBroadcast = (key, data, setter) => {
    localStorage.setItem(key, JSON.stringify(data));
    setter(data);
    broadcastUpdate();
  };

  // User functions
  const saveUsers = (data) => {
    updateAndBroadcast('erp_users', data, setUsers);
  };

  const addUser = (userData) => {
    const newUser = { ...userData, id: Date.now(), hasAccess: true, createdAt: new Date().toISOString() };
    const updated = [...users, newUser];
    saveUsers(updated);
    return newUser;
  };

  const removeUser = (userId) => {
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
  };

  const updateUser = (userId, data) => {
    const updated = users.map(u => u.id === userId ? { ...u, ...data } : u);
    saveUsers(updated);
  };

  const toggleUserAccess = (userId) => {
    const updated = users.map(u => 
      u.id === userId ? { ...u, hasAccess: !u.hasAccess } : u
    );
    saveUsers(updated);
  };

  // Drone functions
  const saveDrones = (data) => {
    updateAndBroadcast('drone_models', data, setDroneModels);
  };

  // Addon functions
  const saveAddons = (data) => {
    updateAndBroadcast('addon_models', data, setAddons);
  };

  // Employee functions
  const saveEmployees = (data) => {
    updateAndBroadcast('employees', data, setEmployees);
  };

  // Customer functions
  const saveCustomers = (data) => {
    updateAndBroadcast('sales_customers', data, setCustomers);
  };

  // Saved Customer functions
  const saveSavedCustomers = (data) => {
    updateAndBroadcast('saved_customers', data, setSavedCustomers);
  };

  // Order functions
  const saveOrders = (data) => {
    updateAndBroadcast('production_orders', data, setOrders);
  };

  // Quotation functions
  const saveQuotations = (data) => {
    updateAndBroadcast('sales_quotations', data, setQuotations);
  };

  // Task functions
  const saveTasks = (data) => {
    updateAndBroadcast('production_tasks', data, setTasks);
  };

  // Service request functions
  const saveServiceRequests = (data) => {
    updateAndBroadcast('service_requests', data, setServiceRequests);
  };

  // Quality check functions
  const saveQualityChecks = (data) => {
    updateAndBroadcast('quality_checks', data, setQualityChecks);
  };

  // Inventory functions
  const saveInventory = (data) => {
    updateAndBroadcast('inventory', data, setInventory);
  };

  // Attendance functions
  const saveAttendance = (data) => {
    updateAndBroadcast('employee_attendance', data, setAttendanceRecords);
  };

  // Leave request functions
  const saveLeaveRequests = (data) => {
    updateAndBroadcast('employee_leaves', data, setLeaveRequests);
  };

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.hasAccess === false) {
        return { success: false, error: 'Your account has been suspended. Please contact admin.' };
      }
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => { setCurrentUser(null); };

  const value = {
    users,
    currentUser,
    login,
    logout,
    addUser,
    removeUser,
    updateUser,
    toggleUserAccess,
    saveUsers,
    orders, saveOrders,
    quotations, saveQuotations,
    customers, saveCustomers,
    savedCustomers, saveSavedCustomers,
    droneModels, saveDrones,
    addons, saveAddons,
    tasks, saveTasks,
    serviceRequests, saveServiceRequests,
    qualityChecks, saveQualityChecks,
    employees, saveEmployees,
    attendanceRecords, saveAttendance,
    leaveRequests, saveLeaveRequests,
    inventory, saveInventory,
    systemLogs,
    announcements,
    lastUpdate,
    broadcastUpdate,
    loadAllData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

// ==================== MAIN APP ====================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load users from localStorage
    const storedUsers = localStorage.getItem('erp_users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      console.log('✅ Users loaded:', parsedUsers.length, 'users');
      setUsers(parsedUsers);
    } else {
      // Seed default users with all roles
      const defaultUsers = [
        { id: 1, email: 'admin@goag.com', password: 'admin123', name: 'Admin User', role: 'admin', hasAccess: true },
        { id: 2, email: 'sales@goag.com', password: 'sales123', name: 'Sales Manager', role: 'sales', hasAccess: true },
        { id: 3, email: 'production@goag.com', password: 'prod123', name: 'Production Manager', role: 'production', hasAccess: true },
        { id: 4, email: 'service@goag.com', password: 'service123', name: 'Service Manager', role: 'aftersales', hasAccess: true },
        { id: 5, email: 'qc@goag.com', password: 'qc123', name: 'Quality Manager', role: 'quality', hasAccess: true },
        { id: 6, email: 'accounts@goag.com', password: 'acc123', name: 'Accountant', role: 'accountant', hasAccess: true },
        { id: 7, email: 'employee@goag.com', password: '123456', name: 'Employee User', role: 'employee', hasAccess: true },
      ];
      localStorage.setItem('erp_users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }

    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get fresh users from localStorage to ensure latest data
    const storedUsers = localStorage.getItem('erp_users');
    const freshUsers = storedUsers ? JSON.parse(storedUsers) : [];
    
    console.log('🔍 Login Attempt:');
    console.log('📧 Email:', loginData.email);
    console.log('🔑 Password:', loginData.password);
    console.log('👥 Users in localStorage:', freshUsers.length);
    
    const foundUser = freshUsers.find(u => u.email === loginData.email && u.password === loginData.password);
    
    console.log('✅ Found user:', foundUser ? foundUser.name : 'None');
    
    if (foundUser) {
      // Check if user has access
      if (foundUser.hasAccess === false) {
        toast.error('Your account has been suspended. Please contact admin.');
        setLoading(false);
        return;
      }
      
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      };
      localStorage.setItem('loggedInUser', JSON.stringify(userData));
      setUser(userData);
      setUsers(freshUsers); // Update state
      toast.success(`Welcome ${foundUser.name}!`);
    } else {
      toast.error('Invalid email or password');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Render login page if not logged in
  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          {/* ===== NO BACKGROUND IMAGE - Just clean white card ===== */}
          
          <div style={styles.cardContent}>
            <div style={styles.logoContainer}>
              {/* GOAG LOGO */}
              <img 
                src="https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_99,h_99,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png" 
                alt="GOAG DRONES Logo" 
                style={styles.logoImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h1 style={styles.logoText}>GOAG DRONES</h1>
              <p style={styles.logoSubtext}>Enterprise Resource Planning System</p>
            </div>

            <div style={styles.welcomeSection}>
              <h2 style={styles.welcomeTitle}>Welcome Back</h2>
              <p style={styles.welcomeSubtitle}>Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    style={{ ...styles.input, paddingRight: '50px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    onMouseEnter={(e) => e.target.style.opacity = '1'}
                    onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                  >
                    {showPassword ? '🛸' : '🚁'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.loginButton}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* DEMO CREDENTIALS REMOVED - Clean login page */}

            <div style={styles.footerText}>
              <p>🔐 Secure Enterprise Access • GOAG DRONES ERP</p>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'sales':
        return <SalesManagerUI user={user} onLogout={handleLogout} />;
      case 'production':
        return <ProductionManagerUI user={user} onLogout={handleLogout} />;
      case 'aftersales':
        return <AfterSalesManagerUI user={user} onLogout={handleLogout} />;
      case 'quality':
        return <QualityManagerUI user={user} onLogout={handleLogout} />;
      case 'accountant':
        return <AccountantUI user={user} onLogout={handleLogout} />;
      case 'employee':
        return <EmployeePortal user={user} onLogout={handleLogout} />;
      default:
        return <ProductionManagerUI user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <AppProvider>
      {renderDashboard()}
      <Toaster position="top-right" />
    </AppProvider>
  );
}

// ==================== STYLES ====================
const styles = {
  loginContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #064E3B 0%, #065F46 40%, #047857 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', 'Poppins', 'Arial', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  
  loginCard: {
    maxWidth: '480px',
    width: '100%',
    background: 'white',
    borderRadius: '28px',
    padding: '44px 40px',
    boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 1
  },
  
  // ===== CONTENT - NO BACKGROUND IMAGE =====
  cardContent: {
    position: 'relative',
    zIndex: 1
  },
  
  logoContainer: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  
  logoImage: {
    width: '140px',
    height: '140px',
    objectFit: 'contain',
    marginBottom: '8px',
    borderRadius: '16px',
    filter: 'drop-shadow(0 8px 24px rgba(6, 79, 59, 0.2))',
    transition: 'transform 0.3s ease',
    background: 'transparent'
  },
  
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#065F46',
    margin: '0',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  },
  
  logoSubtext: {
    fontSize: '11px',
    color: '#6B7280',
    margin: '4px 0 0',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontWeight: '500'
  },
  
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  
  welcomeTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1F2937',
    margin: '0',
    letterSpacing: '-0.5px'
  },
  
  welcomeSubtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '6px 0 0'
  },
  
  form: {
    marginBottom: '0'
  },
  
  inputGroup: {
    marginBottom: '18px'
  },
  
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  },
  
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: 'white',
    fontFamily: 'inherit'
  },
  
  eyeButton: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '22px',
    padding: '4px',
    opacity: 0.6,
    transition: 'opacity 0.2s'
  },
  
  loginButton: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #065F46, #047857)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '6px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
    letterSpacing: '0.5px'
  },
  
  footerText: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB',
    textAlign: 'center',
    fontSize: '12px',
    color: '#9CA3AF',
    letterSpacing: '0.3px'
  }
};

export default App;
