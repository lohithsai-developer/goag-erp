import { useState, useEffect } from 'react';
import { 
  Package, Users, ClipboardList, CheckCircle, Clock, AlertCircle, 
  Plus, Eye, Search, UserPlus, Calendar, TrendingUp, TrendingDown,
  Wrench, UserCheck, ChevronRight, BarChart3, Filter, X, Edit2, Save,
  ChevronDown, ChevronUp, Timer, Truck, Home, Briefcase, Star, Award,
  Settings, Activity, BarChart, User, Phone, Mail, MapPin, Calendar as CalendarIcon,
  UserCircle, Pencil, Info, ShoppingBag, History, Play, Square, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const LOGO = "https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_99,h_99,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png";

// Order stage labels for tracking
const ORDER_STAGES = ['CREATED', 'ASSIGNED', 'TASK_COMPLETED', 'QUALITY_CHECK', 'READY_FOR_DELIVERY', 'DELIVERED'];
const ORDER_STAGE_LABELS = {
  'CREATED': 'Created',
  'ASSIGNED': 'Assigned',
  'TASK_COMPLETED': 'Task Completed',
  'QUALITY_CHECK': 'Quality Check',
  'READY_FOR_DELIVERY': 'Ready for Delivery',
  'DELIVERED': 'Delivered'
};

export default function ProductionManagerUI({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newTask, setNewTask] = useState({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assignedTo: [] });
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  const [showActivityLog, setShowActivityLog] = useState(false);
  
  // Reports State
  const [reportView, setReportView] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Task Details Modal State
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  
  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskData, setEditTaskData] = useState({ 
    taskName: '', 
    description: '', 
    deadline: '', 
    deadlineTime: '17:00', 
    assigned_to: [] 
  });
  
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderData, setEditOrderData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    droneModel: '',
    issueType: '',
    description: '',
    priority: 'NORMAL'
  });
  const [viewingOrderTracking, setViewingOrderTracking] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'Production Manager',
    designation: 'Production Manager',
    phone: user?.phone || '+91 9876543210',
    email: user?.email || 'production@goag.com',
    photo: user?.photo || null
  });
  const [editProfileData, setEditProfileData] = useState({ ...profileData });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    loadData();
    loadActivityLog();
    const savedProfile = localStorage.getItem('production_manager_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData(parsed);
      setEditProfileData(parsed);
    }
  }, []);

  // Auto-sync employee availability based on active tasks
  useEffect(() => {
    if (employees.length === 0) return;
    let changed = false;
    const updatedEmployees = employees.map(emp => {
      const isBusy = tasks.some(task => 
        task.assigned_to?.includes(emp.id) && 
        task.status !== 'COMPLETED' && 
        !task.cancelled
      );
      const shouldBeAvailable = !isBusy;
      if (emp.is_available !== shouldBeAvailable) {
        changed = true;
        return { ...emp, is_available: shouldBeAvailable };
      }
      return emp;
    });
    if (changed) {
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    }
  }, [tasks]);

  const loadData = () => {
    const storedOrders = localStorage.getItem('production_orders');
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch (e) {
        console.error('Error parsing orders:', e);
        setOrders([]);
      }
    } else {
      const sampleOrders = [
        { 
          id: 1, 
          order_number: 'PO-001', 
          customerName: 'Rajesh Farms', 
          customerPhone: '9876543210', 
          customerEmail: 'rajesh@farms.com', 
          customerAddress: '123 Farm Road, Pune',
          status: 'ASSIGNED', 
          priority: 'HIGH', 
          totalAmount: 337365, 
          deliveryDate: '2026-06-08', 
          products: [{ name: 'AGRIFLOX Drone', qty: 1, price: 337365 }], 
          createdAt: '2026-06-01T10:00:00Z', 
          issueType: 'Motor Failure', 
          description: 'One motor not working, drone tilting',
          customerCode: 'RF-001',
          orderStage: 'ASSIGNED',
          orderHistory: [
            { stage: 'CREATED', date: '2026-06-01T10:00:00Z', message: 'Order created' },
            { stage: 'ASSIGNED', date: '2026-06-02T11:00:00Z', message: 'Task assigned to Ramesh Kumar' }
          ]
        },
        { 
          id: 2, 
          order_number: 'PO-002', 
          customerName: 'GreenField Agro', 
          customerPhone: '9876543211', 
          customerEmail: 'greenfield@email.com', 
          customerAddress: '456 Green Road, Nagpur',
          status: 'IN_PROGRESS', 
          priority: 'NORMAL', 
          totalAmount: 250000, 
          deliveryDate: '2026-06-15', 
          products: [{ name: 'AgriSpray X1', qty: 1, price: 250000 }], 
          createdAt: '2026-06-01T14:30:00Z', 
          issueType: 'Battery Issue', 
          description: 'Battery not holding charge',
          customerCode: 'GF-001',
          orderStage: 'ASSIGNED',
          orderHistory: [
            { stage: 'CREATED', date: '2026-06-01T14:30:00Z', message: 'Order created' },
            { stage: 'ASSIGNED', date: '2026-06-02T09:00:00Z', message: 'Task assigned to Mahesh Singh' }
          ]
        },
        { 
          id: 3, 
          order_number: 'PO-003', 
          customerName: 'Kisan Agro', 
          customerPhone: '9876543213', 
          customerEmail: 'kisan@agro.com', 
          customerAddress: '456 Farm Road, Pune',
          status: 'IN_PROGRESS', 
          priority: 'URGENT', 
          totalAmount: 321300, 
          deliveryDate: '2026-06-08', 
          products: [{ name: 'AGRIFLOX Drone', qty: 1, price: 321300 }], 
          createdAt: '2026-06-03T09:15:00Z', 
          issueType: 'Camera Issue', 
          description: 'Camera not capturing images',
          customerCode: 'KA-003',
          orderStage: 'ASSIGNED',
          orderHistory: [
            { stage: 'CREATED', date: '2026-06-03T09:15:00Z', message: 'Order created' },
            { stage: 'ASSIGNED', date: '2026-06-03T11:00:00Z', message: 'Task assigned to Ramesh Kumar, Suresh Patel' }
          ]
        },
        { 
          id: 4, 
          order_number: 'PO-004', 
          customerName: 'Smart Farming', 
          customerPhone: '9876543212', 
          customerEmail: 'info@smartfarming.com', 
          customerAddress: '789 Tech Park, Hyderabad',
          status: 'QUALITY_CHECK', 
          priority: 'URGENT', 
          totalAmount: 450000, 
          deliveryDate: '2026-05-25', 
          products: [{ name: 'Precision Sprayer Pro', qty: 1, price: 450000 }], 
          createdAt: '2026-05-20T09:00:00Z', 
          issueType: 'GPS Signal Loss', 
          description: 'Drone losing GPS signal frequently',
          customerCode: 'SF-004',
          orderStage: 'QUALITY_CHECK',
          orderHistory: [
            { stage: 'CREATED', date: '2026-05-20T09:00:00Z', message: 'Order created' },
            { stage: 'ASSIGNED', date: '2026-05-20T10:00:00Z', message: 'Task assigned to Dinesh Yadav' },
            { stage: 'TASK_COMPLETED', date: '2026-05-22T17:00:00Z', message: 'Task "Fix GPS Issue" completed' },
            { stage: 'QUALITY_CHECK', date: '2026-05-23T09:00:00Z', message: 'Quality Check started' }
          ]
        }
      ];
      setOrders(sampleOrders);
      localStorage.setItem('production_orders', JSON.stringify(sampleOrders));
    }

    const storedTasks = localStorage.getItem('production_tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (e) {
        console.error('Error parsing tasks:', e);
        setTasks([]);
      }
    } else {
      const sampleTasks = [
        {
          id: 1,
          production_order_id: 1,
          order_number: 'PO-001',
          customer_name: 'Rajesh Farms',
          task_name: 'Diagnose Motor Issue',
          description: 'Check all motors and identify which one is causing the tilting issue',
          deadline: '2026-06-05T17:00:00',
          deadline_date: '2026-06-05',
          deadline_time: '17:00',
          status: 'ASSIGNED',
          assigned_to: [1],
          assigned_to_names: ['Ramesh Kumar'],
          created_at: '2026-06-02T11:00:00Z',
          cancelled: false,
          cancelled_reason: null
        },
        {
          id: 2,
          production_order_id: 3,
          order_number: 'PO-003',
          customer_name: 'Kisan Agro',
          task_name: 'Fix Camera Issue',
          description: 'Camera not capturing images - diagnose and fix',
          deadline: '2026-06-07T17:00:00',
          deadline_date: '2026-06-07',
          deadline_time: '17:00',
          status: 'ASSIGNED',
          assigned_to: [1, 2],
          assigned_to_names: ['Ramesh Kumar', 'Suresh Patel'],
          created_at: '2026-06-03T11:00:00Z',
          cancelled: false,
          cancelled_reason: null
        }
      ];
      setTasks(sampleTasks);
      localStorage.setItem('production_tasks', JSON.stringify(sampleTasks));
    }

    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      try {
        setEmployees(JSON.parse(storedEmployees));
      } catch (e) {
        console.error('Error parsing employees:', e);
        setEmployees([]);
      }
    } else {
      const sampleEmployees = [
        { id: 1, name: 'Ramesh Kumar', role: 'Service Technician', is_available: true, avatar: '🔧', tasks_completed: 0, total_tasks: 0 },
        { id: 2, name: 'Suresh Patel', role: 'Senior Technician', is_available: true, avatar: '⚙️', tasks_completed: 0, total_tasks: 0 },
        { id: 3, name: 'Mahesh Singh', role: 'Diagnostic Expert', is_available: true, avatar: '📱', tasks_completed: 0, total_tasks: 0 },
        { id: 4, name: 'Dinesh Yadav', role: 'Service Engineer', is_available: true, avatar: '🔨', tasks_completed: 0, total_tasks: 0 },
        { id: 5, name: 'Prakash Reddy', role: 'Support Specialist', is_available: true, avatar: '💬', tasks_completed: 0, total_tasks: 0 }
      ];
      setEmployees(sampleEmployees);
      localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    }
  };

  const loadActivityLog = () => {
    const stored = localStorage.getItem('production_activity_log');
    if (stored) {
      try {
        setActivityLog(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing activity log:', e);
        setActivityLog([]);
      }
    }
  };

  const addToActivityLog = (action, details) => {
    const newLog = { 
      id: Date.now(), 
      action, 
      details, 
      user: user?.name || 'Production Manager', 
      timestamp: new Date().toISOString() 
    };
    const updatedLog = [newLog, ...activityLog].slice(0, 100);
    setActivityLog(updatedLog);
    localStorage.setItem('production_activity_log', JSON.stringify(updatedLog));
  };

  const saveProfile = () => {
    localStorage.setItem('production_manager_profile', JSON.stringify(editProfileData));
    setProfileData(editProfileData);
    setIsEditingProfile(false);
    toast.success('Profile updated successfully!');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData({ ...editProfileData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveTasks = (newTasks) => {
    localStorage.setItem('production_tasks', JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const saveOrders = (newOrders) => {
    localStorage.setItem('production_orders', JSON.stringify(newOrders));
    setOrders(newOrders);
  };

  const saveEmployees = (newEmployees) => {
    localStorage.setItem('employees', JSON.stringify(newEmployees));
    setEmployees(newEmployees);
  };

  const getOrderStageStyle = (stage) => {
    const styles = {
      'CREATED': { bg: '#E0E7FF', color: '#4338CA' },
      'ASSIGNED': { bg: '#DBEAFE', color: '#2563EB' },
      'TASK_COMPLETED': { bg: '#D1FAE5', color: '#059669' },
      'QUALITY_CHECK': { bg: '#FEF3C7', color: '#D97706' },
      'READY_FOR_DELIVERY': { bg: '#EDE9FE', color: '#7C3AED' },
      'DELIVERED': { bg: '#10B981', color: 'white' }
    };
    return styles[stage] || styles['CREATED'];
  };

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': { bg: '#FEF3C7', color: '#D97706', icon: '⏳', label: 'Pending' },
      'ASSIGNED': { bg: '#E0E7FF', color: '#4338CA', icon: '👥', label: 'Assigned' },
      'IN_PROGRESS': { bg: '#DBEAFE', color: '#2563EB', icon: '🔧', label: 'In Progress' },
      'QUALITY_CHECK': { bg: '#EDE9FE', color: '#7C3AED', icon: '🔍', label: 'Quality Check' },
      'COMPLETED': { bg: '#D1FAE5', color: '#059669', icon: '✅', label: 'Completed' },
      'READY': { bg: '#D1FAE5', color: '#059669', icon: '✅', label: 'Ready' },
      'DELIVERED': { bg: '#10B981', color: 'white', icon: '🚚', label: 'Delivered' }
    };
    return styles[status] || styles.PENDING;
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      'URGENT': { bg: '#FEE2E2', color: '#DC2626', icon: '⚠️', label: 'Urgent' },
      'HIGH': { bg: '#FEF3C7', color: '#D97706', icon: '🔥', label: 'High' },
      'NORMAL': { bg: '#DBEAFE', color: '#2563EB', icon: '📋', label: 'Normal' },
      'LOW': { bg: '#D1FAE5', color: '#059669', icon: '✅', label: 'Low' }
    };
    return styles[priority] || styles.NORMAL;
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not set';
    const d = new Date(dateTime);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const getAvailableEmployees = () => employees.filter(emp => emp.is_available === true);
  const getOrderTasks = (orderId) => tasks.filter(t => t.production_order_id === orderId && !t.cancelled);

  const hasAssignedTasks = (orderId) => {
    const orderTasks = getOrderTasks(orderId);
    return orderTasks.some(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');
  };

  // Report helper functions
  const getMonthlyData = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const monthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });
    
    const employeeData = employees.map(emp => {
      const empTasks = tasks.filter(t => 
        t.assigned_to?.includes(emp.id) && 
        !t.cancelled &&
        t.status === 'COMPLETED'
      );
      const monthTasks = empTasks.filter(t => {
        const d = new Date(t.completed_at || t.created_at);
        return d.getFullYear() === year && d.getMonth() === month - 1;
      });
      return {
        name: emp.name,
        avatar: emp.avatar || '👤',
        completed: monthTasks.length,
        total: empTasks.length
      };
    }).filter(e => e.completed > 0 || e.total > 0).sort((a, b) => b.completed - a.completed);

    return {
      total: monthOrders.length,
      completed: monthOrders.filter(o => o.status === 'COMPLETED').length,
      inProgress: monthOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length,
      pending: monthOrders.filter(o => o.status === 'PENDING').length,
      employeeData: employeeData
    };
  };

  const getYearlyData = (year) => {
    const yearOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d.getFullYear() === year;
    });
    
    const monthlyData = Array(12).fill(0).map((_, i) => {
      const monthOrders = yearOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === i;
      });
      return {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        total: monthOrders.length,
        completed: monthOrders.filter(o => o.status === 'COMPLETED').length,
        inProgress: monthOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length
      };
    });

    const employeeData = employees.map(emp => {
      const empTasks = tasks.filter(t => 
        t.assigned_to?.includes(emp.id) && 
        !t.cancelled &&
        t.status === 'COMPLETED'
      );
      const yearTasks = empTasks.filter(t => {
        const d = new Date(t.completed_at || t.created_at);
        return d.getFullYear() === year;
      });
      return {
        name: emp.name,
        avatar: emp.avatar || '👤',
        completed: yearTasks.length
      };
    }).filter(e => e.completed > 0).sort((a, b) => b.completed - a.completed);

    return {
      total: yearOrders.length,
      completed: yearOrders.filter(o => o.status === 'COMPLETED').length,
      inProgress: yearOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length,
      pending: yearOrders.filter(o => o.status === 'PENDING').length,
      monthlyData: monthlyData,
      employeeData: employeeData
    };
  };

  const getCustomData = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    
    const filteredOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= fromDate && d <= toDate;
    });
    
    const employeeData = employees.map(emp => {
      const empTasks = tasks.filter(t => 
        t.assigned_to?.includes(emp.id) && 
        !t.cancelled &&
        t.status === 'COMPLETED'
      );
      const rangeTasks = empTasks.filter(t => {
        const d = new Date(t.completed_at || t.created_at);
        return d >= fromDate && d <= toDate;
      });
      return {
        name: emp.name,
        avatar: emp.avatar || '👤',
        completed: rangeTasks.length
      };
    }).filter(e => e.completed > 0).sort((a, b) => b.completed - a.completed);

    return {
      total: filteredOrders.length,
      completed: filteredOrders.filter(o => o.status === 'COMPLETED').length,
      inProgress: filteredOrders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length,
      pending: filteredOrders.filter(o => o.status === 'PENDING').length,
      employeeData: employeeData,
      orders: filteredOrders
    };
  };

  const generateOrderNumber = () => {
    const existingNumbers = orders.map(o => {
      const num = parseInt(o.order_number.split('-')[1]);
      return num;
    });
    const maxNum = Math.max(0, ...existingNumbers);
    const nextNum = maxNum + 1;
    return `PO-${String(nextNum).padStart(3, '0')}`;
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    if (!editOrderData.customerName.trim()) { toast.error('Customer name is required'); return; }
    if (!editOrderData.customerPhone.trim()) { toast.error('Phone number is required'); return; }
    if (!editOrderData.droneModel.trim()) { toast.error('Drone model is required'); return; }

    const newOrder = {
      id: Date.now(),
      order_number: generateOrderNumber(),
      customerName: editOrderData.customerName,
      customerPhone: editOrderData.customerPhone,
      customerEmail: editOrderData.customerEmail || '',
      customerAddress: editOrderData.customerAddress || '',
      status: 'PENDING',
      priority: editOrderData.priority || 'NORMAL',
      totalAmount: 0,
      deliveryDate: new Date().toISOString().split('T')[0],
      products: [{ name: editOrderData.droneModel, qty: 1, price: 0 }],
      createdAt: new Date().toISOString(),
      issueType: editOrderData.issueType || 'General',
      description: editOrderData.description || '',
      customerCode: editOrderData.customerName.substring(0, 3).toUpperCase() + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
      orderStage: 'CREATED',
      orderHistory: [
        { stage: 'CREATED', date: new Date().toISOString(), message: 'Order created' }
      ]
    };

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    addToActivityLog('ORDER_CREATED', `Order ${newOrder.order_number} created for ${newOrder.customerName}`);
    toast.success(`Order ${newOrder.order_number} created successfully`);
    setEditingOrder(null);
    setEditOrderData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      droneModel: '',
      issueType: '',
      description: '',
      priority: 'NORMAL'
    });
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setEditOrderData({
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerEmail: order.customerEmail || '',
      customerAddress: order.customerAddress || '',
      droneModel: order.products?.[0]?.name || '',
      issueType: order.issueType || '',
      description: order.description || '',
      priority: order.priority || 'NORMAL'
    });
  };

  const handleSaveEditedOrder = (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (!editOrderData.customerName.trim()) { toast.error('Customer name is required'); return; }
    if (!editOrderData.customerPhone.trim()) { toast.error('Phone number is required'); return; }
    if (!editOrderData.droneModel.trim()) { toast.error('Drone model is required'); return; }

    const updatedOrders = orders.map(order =>
      order.id === editingOrder.id ? {
        ...order,
        customerName: editOrderData.customerName,
        customerPhone: editOrderData.customerPhone,
        customerEmail: editOrderData.customerEmail,
        customerAddress: editOrderData.customerAddress,
        issueType: editOrderData.issueType,
        description: editOrderData.description,
        priority: editOrderData.priority,
        products: [{ 
          name: editOrderData.droneModel, 
          qty: order.products?.[0]?.qty || 1, 
          price: order.totalAmount || 0 
        }]
      } : order
    );
    saveOrders(updatedOrders);
    
    if (selectedOrder && selectedOrder.id === editingOrder.id) {
      setSelectedOrder(updatedOrders.find(o => o.id === editingOrder.id));
    }
    
    addToActivityLog('ORDER_UPDATED', `Order ${editingOrder.order_number} updated`);
    toast.success('Order updated successfully');
    setEditingOrder(null);
    setEditOrderData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      droneModel: '',
      issueType: '',
      description: '',
      priority: 'NORMAL'
    });
  };

  const handleCreateAndAssignTask = (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error('Please select an order first');
      return;
    }
    
    if (!newTask.taskName.trim()) {
      toast.error('Task name is required');
      return;
    }
    
    if (newTask.assignedTo.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    
    const deadlineDateTime = newTask.deadline ? `${newTask.deadline}T${newTask.deadlineTime}:00` : null;
    const selectedEmployees = employees.filter(e => newTask.assignedTo.includes(e.id));
    
    const newTaskObj = {
      id: Date.now(),
      production_order_id: selectedOrder.id,
      order_number: selectedOrder.order_number,
      customer_name: selectedOrder.customerName,
      task_name: newTask.taskName,
      description: newTask.description,
      deadline: deadlineDateTime,
      deadline_date: newTask.deadline,
      deadline_time: newTask.deadlineTime,
      status: 'ASSIGNED',
      assigned_to: newTask.assignedTo,
      assigned_to_names: selectedEmployees.map(e => e.name),
      created_at: new Date().toISOString(),
      cancelled: false,
      cancelled_reason: null
    };
    
    const updatedTasks = [newTaskObj, ...tasks];
    saveTasks(updatedTasks);
    
    const updatedEmployees = employees.map(emp =>
      newTask.assignedTo.includes(emp.id) ? 
        { ...emp, is_available: false, total_tasks: (emp.total_tasks || 0) + 1 } : 
        emp
    );
    saveEmployees(updatedEmployees);
    
    const updatedOrders = orders.map(o =>
      o.id === selectedOrder.id ? {
        ...o,
        status: 'ASSIGNED',
        orderStage: 'ASSIGNED',
        orderHistory: [
          ...(o.orderHistory || []),
          { 
            stage: 'ASSIGNED', 
            date: new Date().toISOString(), 
            message: `Task "${newTask.taskName}" assigned to ${selectedEmployees.map(e => e.name).join(', ')}` 
          }
        ]
      } : o
    );
    saveOrders(updatedOrders);
    
    const updatedOrder = updatedOrders.find(o => o.id === selectedOrder.id);
    if (updatedOrder) {
      setSelectedOrder(updatedOrder);
    }
    
    addToActivityLog('TASK_CREATED', `Task "${newTask.taskName}" created and assigned to ${selectedEmployees.map(e => e.name).join(', ')}`);
    toast.success(`Task "${newTask.taskName}" assigned to ${selectedEmployees.map(e => e.name).join(', ')}`);
    setShowTaskForm(false);
    setNewTask({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assignedTo: [] });
  };

  const updateTaskStatus = (taskId, status) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, status: status, completed_at: status === 'COMPLETED' ? new Date().toISOString() : null } : t
    );
    saveTasks(updatedTasks);
    
    if (status === 'COMPLETED' && task.assigned_to?.length > 0) {
      const updatedEmployees = employees.map(emp =>
        task.assigned_to.includes(emp.id) ? 
          { 
            ...emp, 
            is_available: true,
            tasks_completed: (emp.tasks_completed || 0) + 1
          } : 
          emp
      );
      saveEmployees(updatedEmployees);
      addToActivityLog('TASK_COMPLETED', `Task "${task.task_name}" completed by ${task.assigned_to_names?.join(', ')}`);
      
      const order = orders.find(o => o.id === task.production_order_id);
      if (order) {
        const orderTasks = getOrderTasks(order.id);
        const allCompleted = orderTasks.every(t => t.status === 'COMPLETED');
        if (allCompleted && orderTasks.length > 0) {
          const updatedOrders = orders.map(o =>
            o.id === order.id ? {
              ...o,
              status: 'QUALITY_CHECK',
              orderStage: 'QUALITY_CHECK',
              orderHistory: [
                ...(o.orderHistory || []),
                { stage: 'TASK_COMPLETED', date: new Date().toISOString(), message: `All tasks completed for order ${o.order_number}` },
                { stage: 'QUALITY_CHECK', date: new Date().toISOString(), message: 'Quality Check started' }
              ]
            } : o
          );
          saveOrders(updatedOrders);
          toast.success(`All tasks completed! Order ${order.order_number} moved to Quality Check.`);
        }
      }
    }
    
    toast.success(`Task ${status}`);
  };

  const handleEditTask = (task) => {
    setShowTaskDetailsModal(false);
    setSelectedTaskForDetails(null);
    
    setEditingTask(task);
    setEditTaskData({
      taskName: task.task_name,
      description: task.description || '',
      deadline: task.deadline_date || '',
      deadlineTime: task.deadline_time || '17:00',
      assigned_to: task.assigned_to || []
    });
  };

  const handleSaveEditedTask = (e) => {
    e.preventDefault();
    if (!editingTask) return;
    
    const deadlineDateTime = editTaskData.deadline ? `${editTaskData.deadline}T${editTaskData.deadlineTime}:00` : null;
    const selectedEmployees = employees.filter(e => editTaskData.assigned_to.includes(e.id));
    const oldAssignedIds = editingTask.assigned_to || [];
    
    const updatedTasks = tasks.map(task =>
      task.id === editingTask.id ? {
        ...task,
        task_name: editTaskData.taskName,
        description: editTaskData.description,
        deadline: deadlineDateTime,
        deadline_date: editTaskData.deadline,
        deadline_time: editTaskData.deadlineTime,
        assigned_to: editTaskData.assigned_to,
        assigned_to_names: selectedEmployees.map(e => e.name)
      } : task
    );
    saveTasks(updatedTasks);
    
    const updatedEmployees = employees.map(emp => {
      const wasAssigned = oldAssignedIds.includes(emp.id);
      const isNowAssigned = editTaskData.assigned_to.includes(emp.id);
      if (wasAssigned && !isNowAssigned) {
        return { ...emp, is_available: true };
      } else if (!wasAssigned && isNowAssigned) {
        return { ...emp, is_available: false };
      }
      return emp;
    });
    saveEmployees(updatedEmployees);
    
    toast.success('Task updated successfully');
    setEditingTask(null);
    setEditTaskData({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assigned_to: [] });
  };

  const handleCancelTask = () => {
    if (!selectedTask) return;
    if (!cancelReason.trim()) { toast.error('Please provide a reason for cancellation'); return; }
    
    const updatedTasks = tasks.map(task => 
      task.id === selectedTask.id ? { 
        ...task, 
        status: 'CANCELLED', 
        cancelled: true, 
        cancelled_reason: cancelReason, 
        cancelled_at: new Date().toISOString() 
      } : task
    );
    saveTasks(updatedTasks);
    
    if (selectedTask.assigned_to && selectedTask.assigned_to.length > 0) {
      const updatedEmployees = employees.map(emp =>
        selectedTask.assigned_to.includes(emp.id) ? { ...emp, is_available: true } : emp
      );
      saveEmployees(updatedEmployees);
    }
    
    addToActivityLog('TASK_CANCELLED', `Task "${selectedTask.task_name}" cancelled. Reason: ${cancelReason}`);
    toast.success(`Task cancelled`);
    setShowCancelConfirm(null);
    setSelectedTask(null);
    setCancelReason('');
  };

  const updateOrderStage = (orderId, newStage) => {
    const stageLabels = {
      'QUALITY_CHECK': 'Quality Check started',
      'READY_FOR_DELIVERY': 'Ready for delivery',
      'DELIVERED': 'Delivered successfully'
    };
    
    const updatedOrders = orders.map(order =>
      order.id === orderId ? {
        ...order,
        orderStage: newStage,
        status: newStage === 'DELIVERED' ? 'COMPLETED' : order.status,
        delivered_at: newStage === 'DELIVERED' ? new Date().toISOString() : order.delivered_at,
        orderHistory: [
          ...(order.orderHistory || []),
          {
            stage: newStage,
            date: new Date().toISOString(),
            message: newStage === 'DELIVERED' 
              ? `✅ Product delivered to ${order.customerName} on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` 
              : stageLabels[newStage] || `Stage updated to ${ORDER_STAGE_LABELS[newStage]}`
          }
        ]
      } : order
    );
    saveOrders(updatedOrders);
    toast.success(`Order stage updated to ${ORDER_STAGE_LABELS[newStage]}`);
    
    if (viewingOrderTracking && viewingOrderTracking.id === orderId) {
      const updatedOrder = updatedOrders.find(o => o.id === orderId);
      setViewingOrderTracking(updatedOrder);
    }
  };

  const resetEmployees = () => {
    const resetEmployeesList = employees.map(emp => ({
      ...emp,
      is_available: true
    }));
    saveEmployees(resetEmployeesList);
    toast.success('✅ All employees are now available!');
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    assigned: orders.filter(o => o.status === 'ASSIGNED').length,
    inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
    qualityCheck: orders.filter(o => o.status === 'QUALITY_CHECK').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
    availableEmployees: getAvailableEmployees().length,
    totalEmployees: employees.length,
    pendingTasks: tasks.filter(t => t.status !== 'COMPLETED' && !t.cancelled).length
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const searchedOrders = filteredOrders.filter(o => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    
    return (
      o.order_number?.toLowerCase().includes(searchLower) ||
      o.customerName?.toLowerCase().includes(searchLower) ||
      o.customerPhone?.includes(searchTerm.trim()) ||
      (o.customerEmail || '').toLowerCase().includes(searchLower) ||
      (o.customerCode || '').toLowerCase().includes(searchLower) ||
      (o.products?.[0]?.name || '').toLowerCase().includes(searchLower) ||
      (o.issueType || '').toLowerCase().includes(searchLower) ||
      (o.description || '').toLowerCase().includes(searchLower) ||
      (o.customerAddress || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ 
      background: '#FFFFFF', 
      minHeight: '100vh', 
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: 'relative'
    }}>
      {/* Translucent Background Logo */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        opacity: 0.05,
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <img src={LOGO} alt="GOAG" style={{ width: '200px', height: '200px', objectFit: 'contain' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)', 
          color: 'white', 
          padding: '16px 24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={LOGO} alt="GOAG" style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', padding: '4px', objectFit: 'contain' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>GOAG DRONES ERP</h1>
                <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.85 }}>Production Control Center</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div 
                style={{ textAlign: 'right', cursor: 'pointer' }} 
                onClick={() => setShowProfileModal(true)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {profileData.photo ? (
                    <img src={profileData.photo} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                  ) : (
                    <UserCircle size={32} style={{ opacity: 0.8 }} />
                  )}
                  {profileData.fullName}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{profileData.designation || 'Production Manager'}</div>
              </div>
              <button onClick={onLogout} style={{ background: '#DC2626', border: 'none', padding: '6px 20px', borderRadius: '30px', color: 'white', fontWeight: '500', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ 
          display: 'flex', 
          background: '#FFFFFF', 
          padding: '0 24px', 
          gap: '4px', 
          borderBottom: '1px solid #E5E7EB', 
          flexWrap: 'wrap', 
          overflowX: 'auto' 
        }}>
          <button 
            onClick={() => { setActiveTab('dashboard'); }} 
            style={{ 
              padding: '12px 20px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'dashboard' ? '#065F46' : '#6B7280', 
              borderBottom: activeTab === 'dashboard' ? '2px solid #065F46' : 'none', 
              cursor: 'pointer', 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <BarChart3 size={16} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); }} 
            style={{ 
              padding: '12px 20px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'orders' ? '#065F46' : '#6B7280', 
              borderBottom: activeTab === 'orders' ? '2px solid #065F46' : 'none', 
              cursor: 'pointer', 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <Package size={16} /> Orders
            <span style={{ 
              background: activeTab === 'orders' ? '#065F46' : '#E5E7EB', 
              color: activeTab === 'orders' ? 'white' : '#6B7280', 
              padding: '1px 8px', 
              borderRadius: '12px', 
              fontSize: '10px' 
            }}>
              {orders.filter(o => o.status !== 'COMPLETED').length}
            </span>
          </button>
          <button 
            onClick={() => { setActiveTab('employees'); }} 
            style={{ 
              padding: '12px 20px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'employees' ? '#065F46' : '#6B7280', 
              borderBottom: activeTab === 'employees' ? '2px solid #065F46' : 'none', 
              cursor: 'pointer', 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <Users size={16} /> Team
          </button>
          <button 
            onClick={() => { setActiveTab('reports'); }} 
            style={{ 
              padding: '12px 20px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'reports' ? '#065F46' : '#6B7280', 
              borderBottom: activeTab === 'reports' ? '2px solid #065F46' : 'none', 
              cursor: 'pointer', 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <BarChart size={16} /> Reports & Analytics
          </button>
          <button 
            onClick={() => { setActiveTab('completed'); }} 
            style={{ 
              padding: '12px 20px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'completed' ? '#065F46' : '#6B7280', 
              borderBottom: activeTab === 'completed' ? '2px solid #065F46' : 'none', 
              cursor: 'pointer', 
              fontWeight: '500', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <CheckCircle size={16} /> Completed Orders
          </button>
        </div>

        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
{/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', textAlign: 'center', borderTop: '4px solid #F59E0B', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F59E0B' }}>{stats.pending}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Pending</div>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', textAlign: 'center', borderTop: '4px solid #6366F1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366F1' }}>{stats.assigned}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Assigned</div>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', textAlign: 'center', borderTop: '4px solid #3B82F6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B82F6' }}>{stats.inProgress}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>In Progress</div>
                </div>
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '20px', textAlign: 'center', borderTop: '4px solid #10B981', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>{stats.completed}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Completed</div>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Recent Orders</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Order ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Customer</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Model</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Issue</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6B7280' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => {
                        const statusStyle = getStatusStyle(order.status);
                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }} onClick={() => { setSelectedOrder(order); setActiveTab('orders'); }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{order.order_number}</td>
                            <td style={{ padding: '12px' }}>{order.customerName}</td>
                            <td style={{ padding: '12px' }}>{order.products?.[0]?.name || 'N/A'}</td>
                            <td style={{ padding: '12px' }}>{order.issueType || 'N/A'}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>
                                {statusStyle.icon} {statusStyle.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setFilterStatus('ALL')} 
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '30px', 
                      border: 'none', 
                      background: filterStatus === 'ALL' ? '#065F46' : '#F1F5F9', 
                      color: filterStatus === 'ALL' ? 'white' : '#475569', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    All ({orders.length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('PENDING')} 
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '30px', 
                      border: 'none', 
                      background: filterStatus === 'PENDING' ? '#F59E0B' : '#F1F5F9', 
                      color: filterStatus === 'PENDING' ? 'white' : '#475569', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Pending ({orders.filter(o => o.status === 'PENDING').length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('ASSIGNED')} 
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '30px', 
                      border: 'none', 
                      background: filterStatus === 'ASSIGNED' ? '#6366F1' : '#F1F5F9', 
                      color: filterStatus === 'ASSIGNED' ? 'white' : '#475569', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Assigned ({orders.filter(o => o.status === 'ASSIGNED').length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('IN_PROGRESS')} 
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '30px', 
                      border: 'none', 
                      background: filterStatus === 'IN_PROGRESS' ? '#3B82F6' : '#F1F5F9', 
                      color: filterStatus === 'IN_PROGRESS' ? 'white' : '#475569', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    In Progress ({orders.filter(o => o.status === 'IN_PROGRESS').length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('QUALITY_CHECK')} 
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '30px', 
                      border: 'none', 
                      background: filterStatus === 'QUALITY_CHECK' ? '#8B5CF6' : '#F1F5F9', 
                      color: filterStatus === 'QUALITY_CHECK' ? 'white' : '#475569', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Quality Check ({orders.filter(o => o.status === 'QUALITY_CHECK').length})
                  </button>
                  <button 
                    onClick={() => setFilterStatus('COMPLETED')} 
                    style={{ 
                      padding: '6px 16px', 
                      borderRadius: '30px', 
                      border: 'none', 
                      background: filterStatus === 'COMPLETED' ? '#10B981' : '#F1F5F9', 
                      color: filterStatus === 'COMPLETED' ? 'white' : '#475569', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Completed ({orders.filter(o => o.status === 'COMPLETED').length})
                  </button>
                </div>
                
                <div style={{ flex: 1, position: 'relative', maxWidth: '340px', marginLeft: 'auto' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input 
                    type="text" 
                    placeholder="🔍 Search by Name, Phone, Order ID, Model or Issue..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px 8px 34px', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '30px', 
                      fontSize: '12px',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#065F46'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9CA3AF',
                        padding: '4px'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {searchedOrders.length > 0 ? (
                  searchedOrders.map(order => {
                    const statusStyle = getStatusStyle(order.status);
                    const orderTasks = getOrderTasks(order.id);
                    const isDelivered = order.status === 'COMPLETED';
                    
                    const hasAssigned = hasAssignedTasks(order.id);
                    
                    return (
                      <div key={order.id} style={{ 
                        background: '#FFFFFF', 
                        borderRadius: '16px', 
                        border: `1px solid ${isDelivered ? '#10B981' : statusStyle.bg ? statusStyle.bg : '#E5E7EB'}`, 
                        padding: '16px',
                        boxShadow: isDelivered ? '0 4px 12px rgba(16, 185, 129, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1F2937' }}>{order.order_number}</span>
                              
                              {/* ONLY ONE BADGE - Status Badge */}
                              <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '30px', fontSize: '10px' }}>
                                {statusStyle.icon} {statusStyle.label}
                              </span>
                              
                              {/* Past Due badge REMOVED */}
                            </div>
                            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
                              {order.customerName} | {order.customerPhone}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>
                              Created: {formatDate(order.createdAt)}
                            </div>
                            {isDelivered && order.delivered_at && (
                              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>
                                Delivered: {formatDate(order.delivered_at)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
                          <div><strong>Product:</strong> {order.products?.[0]?.name || 'N/A'} (Qty: {order.products?.[0]?.qty || 1})</div>
                          <div><strong>Issue:</strong> {order.issueType || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{order.description}</div>
                        </div>

                        {/* Production Progress Bar REMOVED */}

                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {hasAssigned ? (
                            <button 
                              onClick={() => {
                                const assignedTask = getOrderTasks(order.id).find(t => 
                                  t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'
                                );
                                if (assignedTask) {
                                  setSelectedTaskForDetails(assignedTask);
                                  setShowTaskDetailsModal(true);
                                }
                              }} 
                              style={{ 
                                background: '#10B981', 
                                border: 'none', 
                                color: 'white', 
                                padding: '6px 16px', 
                                borderRadius: '30px', 
                                cursor: 'pointer', 
                                fontSize: '11px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px' 
                              }}
                            >
                              <CheckCircle size={12} /> Task Assigned
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setSelectedOrder(order); setShowTaskForm(true); }} 
                              style={{ 
                                background: '#065F46', 
                                border: 'none', 
                                color: 'white', 
                                padding: '6px 16px', 
                                borderRadius: '30px', 
                                cursor: 'pointer', 
                                fontSize: '11px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px' 
                              }}
                            >
                              <Plus size={12} /> Assign Task
                            </button>
                          )}

                          <button 
                            onClick={() => setViewingOrderTracking(order)} 
                            style={{ 
                              background: '#8B5CF6', 
                              border: 'none', 
                              color: 'white', 
                              padding: '6px 16px', 
                              borderRadius: '30px', 
                              cursor: 'pointer', 
                              fontSize: '11px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px' 
                            }}
                          >
                            <Truck size={12} /> Track Order
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', background: '#FFFFFF', borderRadius: '16px', color: '#9CA3AF' }}>
                    <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>No orders found</p>
                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TEAM TAB */}
          {activeTab === 'employees' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#064E3B' }}>👥 Production Team</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#D1FAE5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#065F46', fontWeight: '600' }}>
                    Available: {getAvailableEmployees().length}
                  </span>
                  <span style={{ background: '#FEE2E2', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#991B1B', fontWeight: '600' }}>
                    Busy: {stats.totalEmployees - getAvailableEmployees().length}
                  </span>
                  <button 
                    onClick={resetEmployees} 
                    style={{ 
                      background: '#EEF2FF', 
                      border: '1px solid #C7D2FE', 
                      color: '#3730A3', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      cursor: 'pointer', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={12} /> Reset All
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {employees.map(emp => {
                  const empTasks = tasks.filter(t => t.assigned_to?.includes(emp.id) && !t.cancelled);
                  const activeEmpTasks = empTasks.filter(t => t.status !== 'COMPLETED');
                  const isAvailable = activeEmpTasks.length === 0;
                  
                  return (
                    <div key={emp.id} style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '16px', 
                      padding: '16px', 
                      border: isAvailable ? '2px solid #10B981' : '2px solid #EF4444',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ 
                          fontSize: '32px', 
                          background: '#F8FAFC', 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          border: '1px solid #E5E7EB' 
                        }}>
                          {emp.avatar || '👤'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1F2937' }}>{emp.name}</h4>
                          {/* Designation/role REMOVED */}
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ 
                              background: isAvailable ? '#10B981' : '#EF4444', 
                              color: 'white', 
                              padding: '2px 12px', 
                              borderRadius: '30px', 
                              fontSize: '10px' 
                            }}>
                              {isAvailable ? 'Available' : 'Busy'}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#065F46' }}>{emp.tasks_completed || 0}</div>
                          <div style={{ fontSize: '10px', color: '#6B7280' }}>Tasks Done</div>
                        </div>
                      </div>

                      {activeEmpTasks.length > 0 && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: '10px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Current Assignments
                          </div>
                          {activeEmpTasks.map(t => (
                            <div key={t.id} style={{ fontSize: '12px', color: '#1F2937', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                              <span>• {t.task_name}</span>
                              <span style={{ fontSize: '10px', color: '#6B7280' }}>{t.order_number}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REPORTS & ANALYTICS TAB */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#064E3B' }}>
                  📊 Reports & Analytics
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                  Overview of production performance, order statistics, and team efficiency
                </p>
              </div>

              {/* Report Type Tabs */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '24px', 
                flexWrap: 'wrap',
                background: '#FFFFFF',
                padding: '8px',
                borderRadius: '16px',
                border: '1px solid #E5E7EB'
              }}>
                <button 
                  onClick={() => setReportView('monthly')} 
                  style={{
                    padding: '10px 24px',
                    borderRadius: '30px',
                    border: 'none',
                    background: reportView === 'monthly' ? '#065F46' : '#F1F5F9',
                    color: reportView === 'monthly' ? 'white' : '#475569',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  📅 Monthly
                </button>
                <button 
                  onClick={() => setReportView('yearly')} 
                  style={{
                    padding: '10px 24px',
                    borderRadius: '30px',
                    border: 'none',
                    background: reportView === 'yearly' ? '#065F46' : '#F1F5F9',
                    color: reportView === 'yearly' ? 'white' : '#475569',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  📈 Yearly
                </button>
                <button 
                  onClick={() => setReportView('custom')} 
                  style={{
                    padding: '10px 24px',
                    borderRadius: '30px',
                    border: 'none',
                    background: reportView === 'custom' ? '#065F46' : '#F1F5F9',
                    color: reportView === 'custom' ? 'white' : '#475569',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  📅 Custom Range
                </button>
              </div>

              {/* MONTHLY REPORT */}
              {reportView === 'monthly' && (
                <div>
                  <div style={{ 
                    marginBottom: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    background: '#FFFFFF',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Select Month:</label>
                    <input 
                      type="month" 
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)} 
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        border: '1px solid #E5E7EB', 
                        fontSize: '13px',
                        background: '#F9FAFB',
                        fontWeight: '500'
                      }}
                    />
                  </div>

                  {(() => {
                    const monthData = getMonthlyData(selectedMonth);
                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Total Orders</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{monthData.total}</div>
                            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '6px' }}>{selectedMonth}</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Completed</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>{monthData.completed}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>{monthData.total > 0 ? Math.round((monthData.completed / monthData.total) * 100) : 0}% Rate</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>In Progress</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>{monthData.inProgress}</div>
                            <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '6px' }}>Active Orders</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Pending</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>{monthData.pending}</div>
                            <div style={{ fontSize: '12px', color: '#D97706', marginTop: '6px' }}>Awaiting Action</div>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📊 Orders Completed by Employees - {selectedMonth}</h3>
                          </div>
                          <div style={{ padding: '16px 20px' }}>
                            {monthData.employeeData.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                                <p>No completed tasks by employees for this month</p>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {monthData.employeeData.map((emp, index) => {
                                  const maxValue = Math.max(...monthData.employeeData.map(e => e.completed), 1);
                                  const percentage = (emp.completed / maxValue) * 100;
                                  const colors = ['#065F46', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];
                                  const color = colors[index % colors.length];
                                  return (
                                    <div key={emp.name}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span>{emp.avatar} {emp.name}</span>
                                        <span style={{ fontWeight: '600', color: color }}>{emp.completed} tasks</span>
                                      </div>
                                      <div style={{ background: '#E5E7EB', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                          width: `${Math.max(percentage, 5)}%`, 
                                          background: color, 
                                          height: '10px', 
                                          borderRadius: '8px',
                                          transition: 'width 0.5s ease'
                                        }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* YEARLY REPORT */}
              {reportView === 'yearly' && (
                <div>
                  <div style={{ 
                    marginBottom: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    background: '#FFFFFF',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Select Year:</label>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(Number(e.target.value))} 
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        border: '1px solid #E5E7EB', 
                        fontSize: '13px',
                        background: '#F9FAFB',
                        fontWeight: '500'
                      }}
                    >
                      {[2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const yearData = getYearlyData(selectedYear);
                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Total Orders</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{yearData.total}</div>
                            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '6px' }}>{selectedYear}</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Completed</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>{yearData.completed}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>{yearData.total > 0 ? Math.round((yearData.completed / yearData.total) * 100) : 0}% Rate</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>In Progress</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>{yearData.inProgress}</div>
                            <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '6px' }}>Active Orders</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Pending</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>{yearData.pending}</div>
                            <div style={{ fontSize: '12px', color: '#D97706', marginTop: '6px' }}>Awaiting Action</div>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📊 Monthly Breakdown - {selectedYear}</h3>
                          </div>
                          <div style={{ overflowX: 'auto', padding: '16px 20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Month</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Total</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Completed</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>In Progress</th>
                                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#6B7280', fontSize: '11px', fontWeight: '600' }}>Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                {yearData.monthlyData.map((m, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: '600' }}>{m.month}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{m.total}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                      <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                                        {m.completed}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{m.inProgress}</td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                      <span style={{ 
                                        background: m.total > 0 && m.completed/m.total >= 0.7 ? '#D1FAE5' : '#FEF3C7',
                                        color: m.total > 0 && m.completed/m.total >= 0.7 ? '#065F46' : '#D97706',
                                        padding: '2px 10px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                      }}>
                                        {m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0}%
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>👥 Yearly Employee Performance - {selectedYear}</h3>
                          </div>
                          <div style={{ padding: '16px 20px' }}>
                            {yearData.employeeData.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                                <p>No completed tasks by employees for this year</p>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {yearData.employeeData.map((emp, index) => {
                                  const maxValue = Math.max(...yearData.employeeData.map(e => e.completed), 1);
                                  const percentage = (emp.completed / maxValue) * 100;
                                  const colors = ['#065F46', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];
                                  const color = colors[index % colors.length];
                                  return (
                                    <div key={emp.name}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span>{emp.avatar} {emp.name}</span>
                                        <span style={{ fontWeight: '600', color: color }}>{emp.completed} tasks</span>
                                      </div>
                                      <div style={{ background: '#E5E7EB', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.max(percentage, 5)}%`, background: color, height: '8px', borderRadius: '8px', transition: 'width 0.5s ease' }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* CUSTOM RANGE REPORT */}
              {reportView === 'custom' && (
                <div>
                  <div style={{ 
                    marginBottom: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    flexWrap: 'wrap',
                    background: '#FFFFFF',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>From:</label>
                      <input 
                        type="date" 
                        value={customFrom} 
                        onChange={(e) => setCustomFrom(e.target.value)} 
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #E5E7EB', 
                          fontSize: '13px',
                          background: '#F9FAFB'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>To:</label>
                      <input 
                        type="date" 
                        value={customTo} 
                        onChange={(e) => setCustomTo(e.target.value)} 
                        style={{ 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #E5E7EB', 
                          fontSize: '13px',
                          background: '#F9FAFB'
                        }}
                      />
                    </div>
                  </div>

                  {(() => {
                    const customData = getCustomData(customFrom, customTo);
                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Total Orders</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{customData.total}</div>
                            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '6px' }}>{formatDate(customFrom)} - {formatDate(customTo)}</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Completed</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#10B981' }}>{customData.completed}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>{customData.total > 0 ? Math.round((customData.completed / customData.total) * 100) : 0}% Rate</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>In Progress</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3B82F6' }}>{customData.inProgress}</div>
                            <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '6px' }}>Active Orders</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Pending</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>{customData.pending}</div>
                            <div style={{ fontSize: '12px', color: '#D97706', marginTop: '6px' }}>Awaiting Action</div>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>👥 Employee Performance - Custom Range</h3>
                          </div>
                          <div style={{ padding: '16px 20px' }}>
                            {customData.employeeData.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                                <p>No completed tasks by employees in this date range</p>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {customData.employeeData.map((emp, index) => {
                                  const maxValue = Math.max(...customData.employeeData.map(e => e.completed), 1);
                                  const percentage = (emp.completed / maxValue) * 100;
                                  const colors = ['#065F46', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];
                                  const color = colors[index % colors.length];
                                  return (
                                    <div key={emp.name}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                                        <span>{emp.avatar} {emp.name}</span>
                                        <span style={{ fontWeight: '600', color: color }}>{emp.completed} tasks</span>
                                      </div>
                                      <div style={{ background: '#E5E7EB', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.max(percentage, 5)}%`, background: color, height: '8px', borderRadius: '8px', transition: 'width 0.5s ease' }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

{/* COMPLETED ORDERS TAB - FIXED */}
          {activeTab === 'completed' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#064E3B' }}>✅ Completed & Delivered Orders</h2>
                <span style={{ background: '#D1FAE5', color: '#059669', padding: '4px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  {orders.filter(o => o.status === 'COMPLETED').length} Delivered
                </span>
              </div>

              {orders.filter(o => o.status === 'COMPLETED').length === 0 ? (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
                  <Truck size={48} style={{ margin: '0 auto 16px', color: '#D1FAE5' }} />
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#374151' }}>No Completed Orders</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>Orders that have been completed and delivered will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {orders.filter(o => o.status === 'COMPLETED').map(order => {
                    // Get priority style safely - use fallback if needed
                    let priorityStyle = { bg: '#DBEAFE', color: '#2563EB', icon: '📋', label: 'Normal' };
                    try {
                      if (typeof getPriorityStyle === 'function') {
                        priorityStyle = getPriorityStyle(order.priority);
                      }
                    } catch (e) {
                      // Fallback if function doesn't exist
                    }
                    
                    const orderTasks = getOrderTasks(order.id);
                    const completedTasks = orderTasks.filter(t => t.status === 'COMPLETED').length;
                    
                    return (
                      <div key={order.id} style={{ 
                        background: '#FFFFFF', 
                        borderRadius: '16px', 
                        border: '2px solid #10B981', 
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{order.order_number}</span>
                              <span style={{ background: '#D1FAE5', color: '#059669', padding: '4px 12px', borderRadius: '30px', fontSize: '10px', fontWeight: '600' }}>
                                ✅ Delivered
                              </span>
                              <span style={{ background: priorityStyle.bg, color: priorityStyle.color, padding: '4px 12px', borderRadius: '30px', fontSize: '10px' }}>
                                {priorityStyle.icon} {priorityStyle.label}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
                              {order.customerName} | {order.customerPhone}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                              🚚 Delivered: {formatDate(order.delivered_at || order.createdAt)}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                              Created: {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
                          <div><strong>Product:</strong> {order.products?.[0]?.name || 'N/A'}</div>
                          <div><strong>Issue:</strong> {order.issueType || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{order.description}</div>
                        </div>

                        <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={16} color="#065F46" />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#065F46' }}>
                              Product successfully delivered to {order.customerName}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px', marginLeft: '24px' }}>
                            All tasks completed: {completedTasks}/{orderTasks.length}
                          </div>
                        </div>

                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setViewingOrderTracking(order)} 
                            style={{ background: '#8B5CF6', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} /> View Order History
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====== TASK DETAILS MODAL ====== */}
      {showTaskDetailsModal && selectedTaskForDetails && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 500, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '20px', 
            width: '100%', 
            maxWidth: '480px', 
            maxHeight: '85vh', 
            overflow: 'auto', 
            padding: '28px',
            animation: 'slideUp 0.3s ease'
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Task Details</h3>
              <button onClick={() => { setShowTaskDetailsModal(false); setSelectedTaskForDetails(null); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Task Information</div>
              <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#065F46' }}>{selectedTaskForDetails.task_name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Service ID: {selectedTaskForDetails.order_number}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Description</div>
              <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#374151', border: '1px solid #E5E7EB', minHeight: '40px' }}>
                {selectedTaskForDetails.description || 'No description provided'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Deadline</div>
              <div style={{ background: '#F9FAFB', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', color: '#374151', border: '1px solid #E5E7EB' }}>
                {selectedTaskForDetails.deadline ? formatDateTime(selectedTaskForDetails.deadline) : 'Not set'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Status</div>
              <div>
                <span style={{ background: getStatusStyle(selectedTaskForDetails.status).bg, color: getStatusStyle(selectedTaskForDetails.status).color, padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {getStatusStyle(selectedTaskForDetails.status).icon} {getStatusStyle(selectedTaskForDetails.status).label}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Assigned To</div>
              <div style={{ background: '#F9FAFB', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', color: '#374151', border: '1px solid #E5E7EB' }}>
                {selectedTaskForDetails.assigned_to_names?.join(', ') || 'Not assigned'}
              </div>
            </div>

            {/* Action Buttons - Start Task REMOVED */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '16px', flexWrap: 'wrap' }}>
              {/* Complete Task Button - shows when task is IN_PROGRESS */}
              {selectedTaskForDetails.status === 'IN_PROGRESS' && (
                <button onClick={() => { updateTaskStatus(selectedTaskForDetails.id, 'COMPLETED'); setShowTaskDetailsModal(false); setSelectedTaskForDetails(null); }} style={{ flex: 1, minWidth: '100px', background: '#10B981', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> Complete Task
                </button>
              )}

              {/* Edit Task Button */}
              <button onClick={() => handleEditTask(selectedTaskForDetails)} style={{ flex: 1, minWidth: '100px', background: '#3B82F6', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit2 size={16} /> Edit Task
              </button>

              {/* Cancel Task Button - shows when task is not completed */}
              {selectedTaskForDetails.status !== 'COMPLETED' && (
                <button onClick={() => { setSelectedTask(selectedTaskForDetails); setShowCancelConfirm(true); setShowTaskDetailsModal(false); }} style={{ flex: 1, minWidth: '100px', background: '#EF4444', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <X size={16} /> Cancel
                </button>
              )}

              {/* Close Button - show when task is COMPLETED */}
              {selectedTaskForDetails.status === 'COMPLETED' && (
                <button onClick={() => { setShowTaskDetailsModal(false); setSelectedTaskForDetails(null); }} style={{ flex: 1, minWidth: '100px', background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#475569', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== EDIT TASK MODAL ====== */}
      {editingTask && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 600, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '20px', 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '85vh', 
            overflow: 'auto', 
            padding: '28px',
            animation: 'slideUp 0.3s ease'
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Edit Task</h3>
              <button onClick={() => { setEditingTask(null); setEditTaskData({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assigned_to: [] }); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #A7F3D0', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#065F46' }}><strong>Task ID:</strong> {editingTask.id}</div>
              <div style={{ fontSize: '13px', color: '#065F46' }}><strong>Service ID:</strong> {editingTask.order_number}</div>
            </div>

            <form onSubmit={handleSaveEditedTask}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Task Name *</label>
                <input type="text" value={editTaskData.taskName} onChange={e => setEditTaskData({...editTaskData, taskName: e.target.value})} required style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Description</label>
                <textarea value={editTaskData.description} onChange={e => setEditTaskData({...editTaskData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', resize: 'vertical', outline: 'none', transition: 'border 0.2s', fontFamily: 'inherit' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Deadline Date</label>
                  <input type="date" value={editTaskData.deadline} onChange={e => setEditTaskData({...editTaskData, deadline: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Deadline Time</label>
                  <input type="time" value={editTaskData.deadlineTime} onChange={e => setEditTaskData({...editTaskData, deadlineTime: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Assign to Service Team *</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #D1D5DB', borderRadius: '10px', padding: '8px', background: '#FAFAFA' }}>
                  {employees.map(emp => {
                    const isCurrentlyAssigned = editTaskData.assigned_to.includes(emp.id);
                    const hasActiveTask = tasks.some(t => t.assigned_to?.includes(emp.id) && t.id !== editingTask.id && t.status !== 'COMPLETED' && !t.cancelled);
                    const canSelect = !hasActiveTask || isCurrentlyAssigned;
                    
                    return (
                      <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: canSelect ? 'pointer' : 'not-allowed', opacity: canSelect ? 1 : 0.5, background: isCurrentlyAssigned ? '#F0FDF4' : 'transparent', border: isCurrentlyAssigned ? '1px solid #A7F3D0' : '1px solid transparent', marginBottom: '4px', transition: 'all 0.2s' }}>
                        <input type="checkbox" checked={editTaskData.assigned_to.includes(emp.id)} onChange={e => { if (canSelect) { if (e.target.checked) { setEditTaskData({...editTaskData, assigned_to: [...editTaskData.assigned_to, emp.id]}); } else { setEditTaskData({...editTaskData, assigned_to: editTaskData.assigned_to.filter(id => id !== emp.id)}); } } }} style={{ width: '16px', height: '16px', cursor: canSelect ? 'pointer' : 'not-allowed' }} disabled={!canSelect} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', fontSize: '13px', color: '#1F2937' }}>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{emp.role}</div>
                        </div>
                        <span style={{ background: isCurrentlyAssigned ? '#10B981' : (hasActiveTask ? '#EF4444' : '#10B981'), color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '9px', fontWeight: '600' }}>
                          {isCurrentlyAssigned ? 'Assigned' : (hasActiveTask ? 'Busy' : 'Available')}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p style={{ fontSize: '10px', color: '#6B7280', marginTop: '6px' }}>
                  <span style={{ color: '#FF9800' }}>ⓘ</span> Busy employees cannot be selected (they are already assigned to other tasks)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <button type="submit" disabled={!editTaskData.taskName || editTaskData.assigned_to.length === 0} style={{ flex: 1, background: (!editTaskData.taskName || editTaskData.assigned_to.length === 0) ? '#D1D5DB' : '#065F46', color: (!editTaskData.taskName || editTaskData.assigned_to.length === 0) ? '#9CA3AF' : 'white', border: 'none', padding: '10px', borderRadius: '10px', cursor: (!editTaskData.taskName || editTaskData.assigned_to.length === 0) ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Save size={16} /> Save Changes
                </button>
                <button type="button" onClick={() => { setEditingTask(null); setEditTaskData({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assigned_to: [] }); }} style={{ flex: 1, background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#475569', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== ORDER TRACKING MODAL ====== */}
      {viewingOrderTracking && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 400, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '650px', 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.3s ease'
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Order Tracking</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>{viewingOrderTracking.order_number}</p>
              </div>
              <button onClick={() => setViewingOrderTracking(null)} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B7280' }}>Customer</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600', color: '#1F2937' }}>{viewingOrderTracking.customerName}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B7280' }}>Phone</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600', color: '#065F46' }}>{viewingOrderTracking.customerPhone}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B7280' }}>Product</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '500', color: '#374151' }}>{viewingOrderTracking.products?.[0]?.name || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B7280' }}>Quantity</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '600', color: '#065F46' }}>{viewingOrderTracking.products?.[0]?.qty || 1} unit</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Order Journey
              </h4>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
                  {ORDER_STAGES.map((stage, idx) => {
                    const currentStage = ORDER_STAGES.indexOf(viewingOrderTracking.orderStage || 'CREATED');
                    const isCompleted = idx <= currentStage;
                    const isCurrent = idx === currentStage;
                    const stageLabel = ORDER_STAGE_LABELS[stage];
                    return (
                      <div key={stage} style={{ textAlign: 'center', flex: 1, minWidth: '40px' }}>
                        <div style={{ width: '32px', height: '32px', margin: '0 auto 4px', borderRadius: '50%', background: isCompleted ? '#065F46' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isCurrent ? '3px solid #F59E0B' : 'none', transition: 'all 0.3s ease' }}>
                          {isCompleted ? <CheckCircle size={14} color="white" /> : <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{idx + 1}</span>}
                        </div>
                        <span style={{ fontSize: '8px', color: isCompleted ? '#065F46' : '#9CA3AF', fontWeight: isCurrent ? '600' : '400', display: 'block' }}>{stageLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#4B5563' }}>Update Status</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['QUALITY_CHECK', 'READY_FOR_DELIVERY', 'DELIVERED'].map(stage => {
                    const currentIdx = ORDER_STAGES.indexOf(viewingOrderTracking.orderStage || 'CREATED');
                    const targetIdx = ORDER_STAGES.indexOf(stage);
                    const isDisabled = targetIdx <= currentIdx;
                    const stageLabel = ORDER_STAGE_LABELS[stage];
                    return (
                      <button key={stage} onClick={() => updateOrderStage(viewingOrderTracking.id, stage)} disabled={isDisabled} style={{ padding: '4px 12px', background: isDisabled ? '#E5E7EB' : '#065F46', color: isDisabled ? '#9CA3AF' : 'white', border: 'none', borderRadius: '20px', cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: '500' }}>
                        {stageLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> Activity History
                </h4>
                <div style={{ borderLeft: '2px solid #E5E7EB', marginLeft: '12px', paddingLeft: '20px' }}>
                  {(viewingOrderTracking.orderHistory || []).map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '16px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-26px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', background: idx === 0 ? '#065F46' : '#9CA3AF', border: '2px solid white', boxShadow: '0 0 0 2px #E5E7EB' }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>{ORDER_STAGE_LABELS[item.stage] || item.stage}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>{formatDateTime(item.date)}</p>
                        {item.message && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4B5563' }}>{item.message}</p>}
                      </div>
                    </div>
                  ))}
                  {(!viewingOrderTracking.orderHistory || viewingOrderTracking.orderHistory.length === 0) && (
                    <p style={{ color: '#9CA3AF', fontSize: '12px', padding: '10px 0' }}>No activity yet</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px 16px', background: '#F0FDF4', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: getOrderStageStyle(viewingOrderTracking.orderStage || 'CREATED').bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={20} color={getOrderStageStyle(viewingOrderTracking.orderStage || 'CREATED').color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Current Status</p>
                  <p style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: '700', color: '#065F46' }}>
                    {ORDER_STAGE_LABELS[viewingOrderTracking.orderStage] || 'Created'}
                    {viewingOrderTracking.orderStage === 'DELIVERED' && ' ✅ (Completed)'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setViewingOrderTracking(null)} style={{ padding: '8px 24px', background: '#065F46', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== ASSIGN TASK MODAL ====== */}
      {showTaskForm && selectedOrder && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 300, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '85vh', 
            overflow: 'auto', 
            padding: '24px',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Create & Assign Task</h3>
              <button onClick={() => { setShowTaskForm(false); setNewTask({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assignedTo: [] }); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Order</div>
              <div style={{ fontWeight: 'bold' }}>{selectedOrder.order_number} - {selectedOrder.customerName}</div>
              <div style={{ fontSize: '12px' }}>Model: {selectedOrder.products?.[0]?.name || 'N/A'}</div>
            </div>

            <form onSubmit={handleCreateAndAssignTask}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Task Name *</label>
                <input type="text" value={newTask.taskName} onChange={e => setNewTask({...newTask, taskName: e.target.value})} placeholder="e.g., Diagnose motor, Replace battery, Calibrate GPS" required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} rows="3" placeholder="Detailed task instructions..." style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Deadline Date</label>
                  <input type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Deadline Time</label>
                  <input type="time" value={newTask.deadlineTime} onChange={e => setNewTask({...newTask, deadlineTime: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Assign to Team Members *</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '8px' }}>
                  {getAvailableEmployees().length === 0 ? (
                    <p style={{ color: '#EF4444', padding: '16px', textAlign: 'center', fontSize: '12px' }}>No team members available!</p>
                  ) : (
                    getAvailableEmployees().map(emp => (
                      <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px' }}>
                        <input type="checkbox" checked={newTask.assignedTo.includes(emp.id)} onChange={e => { if (e.target.checked) setNewTask({...newTask, assignedTo: [...newTask.assignedTo, emp.id]}); else setNewTask({...newTask, assignedTo: newTask.assignedTo.filter(id => id !== emp.id)}); }} style={{ width: '16px', height: '16px' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '500', fontSize: '13px' }}>{emp.name}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{emp.role}</div>
                        </div>
                        <span style={{ background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '9px' }}>Available</span>
                      </label>
                    ))
                  )}
                </div>
                <p style={{ fontSize: '10px', color: '#6B7280', marginTop: '6px' }}>
                  <span style={{ color: '#FF9800' }}>ⓘ</span> Only available employees can be assigned
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={!newTask.taskName || newTask.assignedTo.length === 0} style={{ flex: 1, background: (!newTask.taskName || newTask.assignedTo.length === 0) ? '#9CA3AF' : '#065F46', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: (!newTask.taskName || newTask.assignedTo.length === 0) ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                  Create & Assign to {newTask.assignedTo.length} Team Member(s)
                </button>
                <button type="button" onClick={() => { setShowTaskForm(false); setNewTask({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assignedTo: [] }); }} style={{ flex: 1, background: '#F3F4F6', color: '#475569', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== EDIT ORDER / NEW ORDER MODAL ====== */}
      {editingOrder && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 300, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '85vh', 
            overflow: 'auto', 
            padding: '24px',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{editingOrder.id === 'new' ? 'New Order' : 'Edit Order'}</h3>
              <button onClick={() => { setEditingOrder(null); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            
            {editingOrder.id !== 'new' && (
              <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Order</div>
                <div style={{ fontWeight: 'bold' }}>{editingOrder.order_number}</div>
              </div>
            )}

            <form onSubmit={editingOrder.id === 'new' ? handleCreateOrder : handleSaveEditedOrder}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Customer Name *</label>
                <input type="text" value={editOrderData.customerName} onChange={e => setEditOrderData({...editOrderData, customerName: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Phone *</label>
                  <input type="tel" value={editOrderData.customerPhone} onChange={e => setEditOrderData({...editOrderData, customerPhone: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Email</label>
                  <input type="email" value={editOrderData.customerEmail} onChange={e => setEditOrderData({...editOrderData, customerEmail: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Address</label>
                <input type="text" value={editOrderData.customerAddress} onChange={e => setEditOrderData({...editOrderData, customerAddress: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Drone Model *</label>
                <input type="text" value={editOrderData.droneModel} onChange={e => setEditOrderData({...editOrderData, droneModel: e.target.value})} required placeholder="e.g., AGRIFLOX Drone, AgriSpray X1" style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Issue Type</label>
                <input type="text" value={editOrderData.issueType} onChange={e => setEditOrderData({...editOrderData, issueType: e.target.value})} placeholder="e.g., Motor Failure, Battery Issue" style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description</label>
                <textarea value={editOrderData.description} onChange={e => setEditOrderData({...editOrderData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Priority</label>
                <select value={editOrderData.priority} onChange={e => setEditOrderData({...editOrderData, priority: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }}>
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, background: '#065F46', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                  {editingOrder.id === 'new' ? 'Create Order' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditingOrder(null); }} style={{ flex: 1, background: '#F3F4F6', color: '#475569', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== CANCEL TASK MODAL ====== */}
      {showCancelConfirm && selectedTask && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 350, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '400px', 
            padding: '24px',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <AlertCircle size={24} color="#DC2626" />
              <h3 style={{ margin: 0, fontSize: '18px' }}>Cancel Task</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              Are you sure you want to cancel <strong>&ldquo;{selectedTask.task_name}&rdquo;</strong>? This will release the assigned team member.
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Reason for cancellation *</label>
              <textarea rows="3" placeholder="Please specify why this task is being cancelled..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px', resize: 'vertical' }} required />
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowCancelConfirm(null); setSelectedTask(null); setCancelReason(''); }} style={{ flex: 1, background: '#F3F4F6', color: '#475569', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCancelTask} disabled={!cancelReason.trim()} style={{ flex: 1, background: !cancelReason.trim() ? '#9CA3AF' : '#DC2626', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: !cancelReason.trim() ? 'not-allowed' : 'pointer', fontWeight: '500' }}>Yes, Cancel Task</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== PROFILE MODAL ====== */}
      {showProfileModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(8px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 500, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '480px', 
            maxHeight: '90vh', 
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.3s ease'
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)', 
              padding: '24px 24px 60px 24px', 
              color: 'white',
              position: 'relative',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>My Profile</h2>
                <button onClick={() => { setShowProfileModal(false); setIsEditingProfile(false); setEditProfileData(profileData); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-40px', position: 'relative' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                {isEditingProfile ? (
                  <>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: editProfileData.photo ? 'transparent' : '#E5E7EB', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {editProfileData.photo ? <img src={editProfileData.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="#9CA3AF" />}
                    </div>
                    <label htmlFor="photo-upload" style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#065F46', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                      <Camera size={14} color="white" />
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </>
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: profileData.photo ? 'transparent' : '#E5E7EB', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {profileData.photo ? <img src={profileData.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="#9CA3AF" />}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 24px 24px' }}>
              {!isEditingProfile ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>{profileData.fullName}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>{profileData.designation || 'Production Manager'}</p>
                  </div>

                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                      <Phone size={18} color="#6B7280" />
                      <div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Phone</div>
                        <div style={{ fontSize: '14px', color: '#1F2937' }}>{profileData.phone || 'Not set'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                      <Mail size={18} color="#6B7280" />
                      <div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Email</div>
                        <div style={{ fontSize: '14px', color: '#1F2937' }}>{profileData.email || 'Not set'}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Preview</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {profileData.photo ? <img src={profileData.photo} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} /> : <User size={40} color="#9CA3AF" />}
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937' }}>{profileData.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{profileData.designation || 'Production Manager'}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{profileData.phone || ''} • {profileData.email || ''}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button onClick={() => { setIsEditingProfile(true); setEditProfileData(profileData); }} style={{ flex: 1, background: '#065F46', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Edit2 size={16} /> Edit Profile
                    </button>
                    <button onClick={onLogout} style={{ flex: 1, background: '#F3F4F6', color: '#DC2626', padding: '12px', borderRadius: '12px', border: '1px solid #FEE2E2', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>Edit Profile</h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Full Name</label>
                    <input type="text" value={editProfileData.fullName} onChange={(e) => setEditProfileData({...editProfileData, fullName: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Designation</label>
                    <input type="text" value={editProfileData.designation} onChange={(e) => setEditProfileData({...editProfileData, designation: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Phone</label>
                    <input type="tel" value={editProfileData.phone} onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
                    <input type="email" value={editProfileData.email} onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={saveProfile} style={{ flex: 1, background: '#065F46', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Save size={16} /> Save Profile
                    </button>
                    <button onClick={() => { setIsEditingProfile(false); setEditProfileData(profileData); }} style={{ flex: 1, background: '#F3F4F6', color: '#475569', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== ACTIVITY LOG MODAL ====== */}
      {showActivityLog && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 400, 
          padding: '16px' 
        }}>
          <div style={{ 
            background: '#FFFFFF', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '550px', 
            maxHeight: '80vh', 
            display: 'flex', 
            flexDirection: 'column',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#064E3B', color: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} /> Activity Log
              </h3>
              <button onClick={() => setShowActivityLog(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {activityLog.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}><p>No activity recorded yet</p></div>
              ) : (
                activityLog.map(log => (
                  <div key={log.id} style={{ padding: '12px', borderBottom: '1px solid #F3F4F6', borderLeft: '3px solid #065F46', marginBottom: '8px', background: '#F8FAFC', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#065F46' }}>{log.action}</span>
                      <span style={{ color: '#6B7280', fontSize: '11px' }}>{formatDateTime(log.timestamp)}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#1F2937', marginTop: '4px' }}>{log.details}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>👤 {log.user}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowActivityLog(false)} style={{ padding: '8px 24px', background: '#065F46', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}