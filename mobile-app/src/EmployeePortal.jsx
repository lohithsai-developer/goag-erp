import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle, Clock, Calendar, User, LogOut, ClipboardList,
  Home, PlusCircle, AlertCircle,
  CalendarDays, Check, X, RefreshCw,
  Search, ThumbsUp, ThumbsDown,
  Clock as ClockIcon, AlertTriangle, Camera,
  AlertCircle as AlertIcon, Flag, ChevronRight,
  Bell, ArrowLeft, Send, FileText, Info, MessageSquare,
  Building2, UserCheck, Phone, Mail, MapPin, Briefcase,
  Star, TrendingUp, Award, BarChart2, ChevronDown, Eye,
  Users, UserPlus, UserMinus, Edit2, Trash2, Calendar as CalendarIcon, Clock as ClockIcon2,
  Pause, Package, DollarSign, ShoppingCart, TrendingUp as TrendingUpIcon, PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';

const LOGO = "https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_99,h_99,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';
const fmtDateWithTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Not set';

const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const statusBadge = (status) => {
  const map = {
    assigned: { bg: '#DBEAFE', color: '#1D4ED8', text: 'Assigned' },
    in_progress: { bg: '#FEF3C7', color: '#B45309', text: 'In Progress' },
    completed: { bg: '#D1FAE5', color: '#059669', text: 'Completed' },
    pending: { bg: '#FEF3C7', color: '#B45309', text: 'Pending' },
    approved: { bg: '#D1FAE5', color: '#059669', text: 'Approved' },
    rejected: { bg: '#FEE2E2', color: '#DC2626', text: 'Rejected' },
    paused: { bg: '#FEF3C7', color: '#D97706', text: 'Paused' },
  };
  return map[status] || { bg: '#F3F4F6', color: '#6B7280', text: status || 'Unknown' };
};

const priorityBadge = (p) => {
  const map = {
    high: { bg: '#FEE2E2', color: '#DC2626', icon: '🔴' },
    medium: { bg: '#FEF3C7', color: '#D97706', icon: '🟡' },
    low: { bg: '#D1FAE5', color: '#059669', icon: '🟢' },
  };
  return map[p?.toLowerCase()] || { bg: '#F3F4F6', color: '#6B7280', icon: '⚪' };
};

const daysUntil = (deadline) => deadline ? Math.ceil((new Date(deadline) - new Date()) / 86400000) : null;
const isOverdue = (deadline, status) => deadline && new Date(deadline) < new Date() && status !== 'completed' && status !== 'paused';

// ── Generate customer order ID ──────────────────────────────────────────────
const generateOrderId = (taskId) => {
  const num = taskId.replace(/\D/g, '');
  return `GOAG-${num}.1`;
};

// ── Sample data (shown when localStorage is empty) ──────────────────────────
const SAMPLE_TASKS = [
  { id: 'TSK001', name: 'Drone Inventory Update', deadline: '2026-06-18T18:00:00', priority: 'High', status: 'assigned', assignedBy: 'Production Manager', assignedByRole: 'production', assignedByName: 'Ravi Kumar', desc: 'Update the drone parts inventory in the warehouse system and reconcile with physical stock.', createdAt: '2026-06-16T09:30:00', orderId: 'GOAG-001.1' },
  { id: 'TSK002', name: 'Client Requirement Analysis', deadline: '2026-06-28T17:00:00', priority: 'Medium', status: 'in_progress', assignedBy: 'After-Sales Manager', assignedByRole: 'after_sales', assignedByName: 'Priya Sharma', desc: 'Analyse the client requirements for the new batch order and prepare a summary report.', createdAt: '2026-06-16T10:15:00', orderId: 'GOAG-002.1' },
  { id: 'TSK003', name: 'Flight Log Verification', deadline: '2026-06-25T16:30:00', priority: 'High', status: 'completed', assignedBy: 'Production Manager', assignedByRole: 'production', assignedByName: 'Ravi Kumar', desc: 'Verify all flight logs from the last maintenance cycle and flag any anomalies.', createdAt: '2026-06-17T11:00:00', completedAt: '2026-06-20T14:30:00', completionNote: 'Task completed successfully', orderId: 'GOAG-003.1' },
  { id: 'TSK004', name: 'ERP Module Testing', deadline: '2026-07-02T18:00:00', priority: 'Medium', status: 'assigned', assignedBy: 'Production Manager', assignedByRole: 'production', assignedByName: 'Ravi Kumar', desc: 'Test the new ERP module end-to-end and report bugs with screenshots.', createdAt: '2026-06-17T14:45:00', orderId: 'GOAG-004.1' },
  { id: 'TSK005', name: 'Prepare Weekly Report', deadline: '2026-06-21T17:30:00', priority: 'Low', status: 'assigned', assignedBy: 'After-Sales Manager', assignedByRole: 'after_sales', assignedByName: 'Priya Sharma', desc: 'Compile the weekly performance report and submit to the manager by EOD Friday.', createdAt: '2026-06-18T09:00:00', orderId: 'GOAG-005.1' },
];

// Sample components data
const SAMPLE_COMPONENTS = [
  { id: 'CMP001', name: 'Drone Motor - 2212', category: 'Motor' },
  { id: 'CMP002', name: 'Propeller - 10x4.5', category: 'Propeller' },
  { id: 'CMP003', name: 'Flight Controller - Pixhawk', category: 'Controller' },
  { id: 'CMP004', name: 'GPS Module - NEO-6M', category: 'Module' },
  { id: 'CMP005', name: 'Battery - 4S 5200mAh', category: 'Battery' },
  { id: 'CMP006', name: 'ESC - 30A', category: 'ESC' },
];

// Extended sample attendance data with more records for monthly/yearly view
const SAMPLE_ATTENDANCE = [
  // June 2024 data
  { employeeId: 'EMP-001', date: '2024-06-01', checkIn: '2024-06-01T09:15:00', checkOut: '2024-06-01T18:30:00', status: 'present', hoursWorked: 9.25, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-02', checkIn: '2024-06-02T09:05:00', checkOut: '2024-06-02T18:15:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-03', checkIn: '2024-06-03T09:30:00', checkOut: '2024-06-03T17:45:00', status: 'present', hoursWorked: 8.25, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-06-04', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null },
  { employeeId: 'EMP-001', date: '2024-06-05', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'sick' },
  { employeeId: 'EMP-001', date: '2024-06-06', checkIn: '2024-06-06T09:00:00', checkOut: '2024-06-06T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-07', checkIn: '2024-06-07T09:10:00', checkOut: '2024-06-07T18:20:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-08', checkIn: '2024-06-08T09:25:00', checkOut: '2024-06-08T17:50:00', status: 'present', hoursWorked: 8.42, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-06-09', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'casual' },
  { employeeId: 'EMP-001', date: '2024-06-10', checkIn: '2024-06-10T09:00:00', checkOut: '2024-06-10T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-11', checkIn: '2024-06-11T09:15:00', checkOut: '2024-06-11T18:30:00', status: 'present', hoursWorked: 9.25, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-12', checkIn: '2024-06-12T09:05:00', checkOut: '2024-06-12T18:15:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-13', checkIn: '2024-06-13T09:30:00', checkOut: '2024-06-13T17:45:00', status: 'present', hoursWorked: 8.25, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-06-14', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null },
  { employeeId: 'EMP-001', date: '2024-06-15', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'sick' },
  { employeeId: 'EMP-001', date: '2024-06-16', checkIn: '2024-06-16T09:00:00', checkOut: '2024-06-16T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-17', checkIn: '2024-06-17T09:10:00', checkOut: '2024-06-17T18:20:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-06-18', checkIn: '2024-06-18T09:25:00', checkOut: '2024-06-18T17:50:00', status: 'present', hoursWorked: 8.42, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-06-19', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'casual' },
  { employeeId: 'EMP-001', date: '2024-06-20', checkIn: '2024-06-20T09:00:00', checkOut: '2024-06-20T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
  // July 2024 data
  { employeeId: 'EMP-001', date: '2024-07-01', checkIn: '2024-07-01T09:15:00', checkOut: '2024-07-01T18:30:00', status: 'present', hoursWorked: 9.25, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-07-02', checkIn: '2024-07-02T09:05:00', checkOut: '2024-07-02T18:15:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-07-03', checkIn: '2024-07-03T09:30:00', checkOut: '2024-07-03T17:45:00', status: 'present', hoursWorked: 8.25, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-07-04', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null },
  { employeeId: 'EMP-001', date: '2024-07-05', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'sick' },
  { employeeId: 'EMP-001', date: '2024-07-06', checkIn: '2024-07-06T09:00:00', checkOut: '2024-07-06T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-07-07', checkIn: '2024-07-07T09:10:00', checkOut: '2024-07-07T18:20:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-07-08', checkIn: '2024-07-08T09:25:00', checkOut: '2024-07-08T17:50:00', status: 'present', hoursWorked: 8.42, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-07-09', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'casual' },
  { employeeId: 'EMP-001', date: '2024-07-10', checkIn: '2024-07-10T09:00:00', checkOut: '2024-07-10T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
  // August 2024 data
  { employeeId: 'EMP-001', date: '2024-08-01', checkIn: '2024-08-01T09:15:00', checkOut: '2024-08-01T18:30:00', status: 'present', hoursWorked: 9.25, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-08-02', checkIn: '2024-08-02T09:05:00', checkOut: '2024-08-02T18:15:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-08-03', checkIn: '2024-08-03T09:30:00', checkOut: '2024-08-03T17:45:00', status: 'present', hoursWorked: 8.25, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-08-04', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null },
  { employeeId: 'EMP-001', date: '2024-08-05', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'sick' },
  { employeeId: 'EMP-001', date: '2024-08-06', checkIn: '2024-08-06T09:00:00', checkOut: '2024-08-06T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-08-07', checkIn: '2024-08-07T09:10:00', checkOut: '2024-08-07T18:20:00', status: 'present', hoursWorked: 9.17, location: 'Office' },
  { employeeId: 'EMP-001', date: '2024-08-08', checkIn: '2024-08-08T09:25:00', checkOut: '2024-08-08T17:50:00', status: 'present', hoursWorked: 8.42, location: 'Remote' },
  { employeeId: 'EMP-001', date: '2024-08-09', checkIn: null, checkOut: null, status: 'absent', hoursWorked: 0, location: null, leaveType: 'casual' },
  { employeeId: 'EMP-001', date: '2024-08-10', checkIn: '2024-08-10T09:00:00', checkOut: '2024-08-10T18:00:00', status: 'present', hoursWorked: 9, location: 'Office' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function EmployeePortal({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [taskDetailId, setTaskDetailId] = useState(null);
  const [pauseTaskId, setPauseTaskId] = useState(null);
  const [pauseReason, setPauseReason] = useState('');
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Attendance filter
  const [attendanceView, setAttendanceView] = useState('monthly'); // 'monthly' or 'yearly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Component form
  const [newComponent, setNewComponent] = useState({
    componentName: '',
    componentId: '',
    quantity: 1,
    category: ''
  });
  const [componentsUsed, setComponentsUsed] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const componentInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filters
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all');

  // Profile
  const [profileImage, setProfileImage] = useState(null);
  const [empDetails, setEmpDetails] = useState({
    name: user?.name || 'Employee',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'employee',
    department: user?.department || 'Production',
    employeeId: user?.id || 'EMP-001',
    joinDate: user?.joinDate || '2024-01-01',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
  });

  // Leave form
  const [newLeave, setNewLeave] = useState({ type: 'sick', startDate: '', endDate: '', reason: '', description: '' });
  const [editLeave, setEditLeave] = useState({ type: 'sick', startDate: '', endDate: '', reason: '', description: '' });
  const [overdueReport, setOverdueReport] = useState('');

  const fileInputRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // ── Helper to get order ID ──────────────────────────────────────────────
  const getOrderId = (task) => {
    if (task.orderId) return task.orderId;
    return generateOrderId(task.id);
  };

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadAll();
    const img = localStorage.getItem(`profile_image_${user?.id}`);
    if (img) setProfileImage(img);
    const det = localStorage.getItem(`employee_details_${user?.id}`);
    if (det) setEmpDetails(JSON.parse(det));
    
    const savedComponents = localStorage.getItem('components_used');
    if (savedComponents) {
      setComponentsUsed(JSON.parse(savedComponents));
    }

    try {
      broadcastChannelRef.current = new BroadcastChannel('erp_components_sync');
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.type === 'COMPONENT_UPDATED') {
          loadComponents();
          toast('🔄 Components updated from another tab', { icon: '🔄' });
        }
      };
    } catch (_) {}

    const onStorage = (e) => {
      if (['production_tasks', 'employee_leaves', 'employee_attendance', 'employees', 'components_used'].includes(e.key)) {
        loadAll();
        toast('🔄 Data updated', { icon: '🔄' });
      }
    };
    window.addEventListener('storage', onStorage);
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
          componentInputRef.current && !componentInputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => { 
      window.removeEventListener('storage', onStorage); 
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadComponents = () => {
    const savedComponents = localStorage.getItem('components_used');
    if (savedComponents) {
      setComponentsUsed(JSON.parse(savedComponents));
    }
  };

  const loadAll = () => {
    setLoading(true);
    const rawTasks = localStorage.getItem('production_tasks');
    let allTasks = [];
    if (rawTasks) {
      allTasks = JSON.parse(rawTasks);
      const mine = allTasks.filter(t => t.assignedTo?.includes(user?.id) || t.assignedNames?.includes(user?.name));
      setTasks(mine);
      const completed = mine.filter(t => t.status === 'completed');
      setCompletedTasks(completed);
    } else {
      const sampleWithCompleted = SAMPLE_TASKS.map(t => {
        if (t.id === 'TSK003') {
          return { ...t, status: 'completed', completedAt: '2026-06-20T14:30:00', completionNote: 'Task completed successfully' };
        }
        return t;
      });
      setTasks(sampleWithCompleted);
      const completed = sampleWithCompleted.filter(t => t.status === 'completed');
      setCompletedTasks(completed);
      localStorage.setItem('production_tasks', JSON.stringify(sampleWithCompleted));
    }
    
    const rawAtt = localStorage.getItem('employee_attendance');
    if (rawAtt) {
      const all = JSON.parse(rawAtt);
      const filtered = all.filter(r => {
        if (user?.id) return r.employeeId === user.id;
        if (user?.name) return r.employeeName === user.name;
        return true;
      });
      setAttendanceRecords(filtered.length > 0 ? filtered : SAMPLE_ATTENDANCE);
    } else {
      const sampleWithId = SAMPLE_ATTENDANCE.map(r => ({
        ...r,
        employeeId: user?.id || 'EMP-001',
        employeeName: user?.name || 'Employee'
      }));
      setAttendanceRecords(sampleWithId);
      localStorage.setItem('employee_attendance', JSON.stringify(sampleWithId));
    }
    
    const rawLeaves = localStorage.getItem('employee_leaves');
    if (rawLeaves) {
      const all = JSON.parse(rawLeaves);
      const filtered = all.filter(l => {
        if (user?.id) return l.employeeId === user.id;
        if (user?.name) return l.employeeName === user.name;
        return true;
      });
      setLeaveRequests(filtered);
    }
    
    loadComponents();
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading('Refreshing data...', { id: 'refresh' });
    await new Promise(resolve => setTimeout(resolve, 800));
    loadAll();
    setRefreshing(false);
    toast.success('✅ Data refreshed successfully!', { id: 'refresh' });
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateTaskStatus = (taskId, newStatus, reason = '') => {
    const raw = localStorage.getItem('production_tasks');
    const all = raw ? JSON.parse(raw) : [];
    
    const task = all.find(t => t.id === taskId);
    if (newStatus === 'in_progress' && task && task.status === 'assigned') {
      const existingInProgress = all.find(t => t.status === 'in_progress' && t.assignedTo?.includes(user?.id));
      if (existingInProgress) {
        toast.error(`You already have a task in progress: "${existingInProgress.name}". Complete it first!`, { duration: 4000 });
        return;
      }
    }
    
    const updated = all.map(t => {
      if (t.id !== taskId) return t;
      const now = new Date().toISOString();
      return {
        ...t,
        status: newStatus,
        updatedAt: now,
        ...(newStatus === 'completed' ? { completedAt: now, completionNote: reason || 'Task completed' } : {}),
        ...(newStatus === 'paused' ? { pausedAt: now, pauseReason: reason } : {}),
        ...(newStatus === 'in_progress' && t.status === 'paused' ? { resumedAt: now } : {}),
        statusHistory: [...(t.statusHistory || []), { status: newStatus, date: now, reason }],
        employeeReport: reason ? { reason, submittedAt: now, employeeName: user?.name, employeeId: user?.id } : t.employeeReport,
      };
    });
    localStorage.setItem('production_tasks', JSON.stringify(updated));

    const notif = {
      id: Date.now(), type: 'task_update', taskId,
      employeeId: user?.id, employeeName: user?.name,
      assignedByRole: task?.assignedByRole,
      status: newStatus, reason, date: new Date().toISOString(), read: false,
    };
    const nRaw = localStorage.getItem('task_notifications');
    const notifs = nRaw ? JSON.parse(nRaw) : [];
    notifs.unshift(notif);
    localStorage.setItem('task_notifications', JSON.stringify(notifs));

    const mine = updated.filter(t => t.assignedTo?.includes(user?.id) || t.assignedNames?.includes(user?.name));
    setTasks(mine);
    const completed = mine.filter(t => t.status === 'completed');
    setCompletedTasks(completed);
    
    setPauseTaskId(null);
    setPauseReason('');
    setOverdueReport('');
    
    if (newStatus === 'in_progress') {
      toast.success('🚀 Task started! Complete it to start the next one.');
    } else if (newStatus === 'completed') {
      toast.success('✅ Task completed successfully! You can now start a new task.');
      if (taskDetailId === taskId) {
        setTaskDetailId(null);
      }
      setTimeout(() => {
        loadAll();
      }, 100);
    } else if (newStatus === 'paused') {
      toast.success('⏸️ Task paused successfully.');
    }
  };

  const submitLeave = (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) { toast.error('Fill all required fields'); return; }
    const leave = {
      id: Date.now(), 
      employeeId: user?.id, 
      employeeName: user?.name,
      ...newLeave, 
      status: 'pending',
      appliedDate: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
    };
    const raw = localStorage.getItem('employee_leaves');
    const all = raw ? JSON.parse(raw) : [];
    all.unshift(leave);
    localStorage.setItem('employee_leaves', JSON.stringify(all));
    const nRaw = localStorage.getItem('leave_notifications');
    const notifs = nRaw ? JSON.parse(nRaw) : [];
    notifs.unshift({ id: Date.now(), type: 'leave_request', leaveId: leave.id, employeeId: user?.id, employeeName: user?.name, data: leave, date: new Date().toISOString(), read: false });
    localStorage.setItem('leave_notifications', JSON.stringify(notifs));
    toast.success('Leave request submitted!');
    setShowLeaveModal(false);
    setNewLeave({ type: 'sick', startDate: '', endDate: '', reason: '', description: '' });
    loadAll();
  };

  const updateLeave = (e) => {
    e.preventDefault();
    if (!editLeave.startDate || !editLeave.endDate || !editLeave.reason) { toast.error('Fill all required fields'); return; }
    
    const raw = localStorage.getItem('employee_leaves');
    const all = raw ? JSON.parse(raw) : [];
    const updated = all.map(l => {
      if (l.id !== editingLeaveId) return l;
      return {
        ...l,
        ...editLeave,
        updatedAt: new Date().toISOString(),
        status: l.status === 'approved' || l.status === 'rejected' ? l.status : 'pending',
      };
    });
    localStorage.setItem('employee_leaves', JSON.stringify(updated));
    
    toast.success('✅ Leave request updated successfully!');
    setEditingLeaveId(null);
    setEditLeave({ type: 'sick', startDate: '', endDate: '', reason: '', description: '' });
    loadAll();
  };

  const deleteLeave = (leaveId) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    
    const raw = localStorage.getItem('employee_leaves');
    const all = raw ? JSON.parse(raw) : [];
    const updated = all.filter(l => l.id !== leaveId);
    localStorage.setItem('employee_leaves', JSON.stringify(updated));
    
    toast.success('🗑️ Leave request deleted');
    loadAll();
  };

  const saveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem(`employee_details_${user?.id}`, JSON.stringify(empDetails));
    toast.success('Profile saved!');
    setShowProfileModal(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      localStorage.setItem(`profile_image_${user?.id}`, reader.result);
      toast.success('Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleEditLeave = (leave) => {
    setEditingLeaveId(leave.id);
    setEditLeave({
      type: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
      description: leave.description || '',
    });
  };

  // ── Component Handlers ────────────────────────────────────────────────────
  const handleComponentInputChange = (value) => {
    setNewComponent({ ...newComponent, componentName: value, componentId: '' });
    const filtered = SAMPLE_COMPONENTS.filter(c => 
      c.name.toLowerCase().includes(value.toLowerCase()) ||
      c.category.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredComponents(filtered);
    setShowDropdown(value.length > 0 && filtered.length > 0);
  };

  const handleInputFocus = () => {
    setFilteredComponents(SAMPLE_COMPONENTS);
    setShowDropdown(true);
  };

  const handleSelectComponent = (component) => {
    setNewComponent({
      ...newComponent,
      componentName: component.name,
      componentId: component.id,
      category: component.category
    });
    setShowDropdown(false);
    setFilteredComponents([]);
  };

  const handleAddComponent = (e) => {
    e.preventDefault();
    if (!newComponent.componentName.trim()) {
      toast.error('Please enter or select a component');
      return;
    }
    
    const existingComponent = SAMPLE_COMPONENTS.find(c => 
      c.name.toLowerCase() === newComponent.componentName.toLowerCase()
    );
    
    const componentEntry = {
      id: Date.now(),
      componentId: existingComponent?.id || 'CUSTOM_' + Date.now(),
      componentName: newComponent.componentName.trim(),
      category: existingComponent?.category || newComponent.category || 'Custom',
      quantity: newComponent.quantity || 1,
      addedAt: new Date().toISOString(),
      addedBy: user?.name || 'Employee',
      addedById: user?.id || 'EMP-001',
      isCustom: !existingComponent
    };
    
    const updatedComponents = [...componentsUsed, componentEntry];
    setComponentsUsed(updatedComponents);
    localStorage.setItem('components_used', JSON.stringify(updatedComponents));
    
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ 
          type: 'COMPONENT_UPDATED',
          data: componentEntry
        });
      }
    } catch (_) {}
    
    toast.success(`✅ ${componentEntry.componentName} added successfully!`);
    
    setNewComponent({
      componentName: '',
      componentId: '',
      quantity: 1,
      category: ''
    });
    setShowDropdown(false);
    setFilteredComponents([]);
  };

  const handleRemoveComponent = (componentId) => {
    if (!window.confirm('Are you sure you want to remove this component?')) return;
    const updated = componentsUsed.filter(c => c.id !== componentId);
    setComponentsUsed(updated);
    localStorage.setItem('components_used', JSON.stringify(updated));
    
    try {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ 
          type: 'COMPONENT_UPDATED',
          data: { removed: componentId }
        });
      }
    } catch (_) {}
    
    toast.success('Component removed');
  };

  // ── Attendance Report Functions ──────────────────────────────────────────
  const getMonthlyData = (records, year, month) => {
    return records.filter(record => {
      const date = new Date(record.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  const getYearlyData = (records, year) => {
    return records.filter(record => {
      const date = new Date(record.date);
      return date.getFullYear() === year;
    });
  };

  const calculateStats = (records) => {
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const totalHours = records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const totalDays = records.length;
    const attendancePercentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : 0;
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;
    
    // Leave type breakdown
    const leaveTypes = {};
    records.filter(r => r.status === 'absent' && r.leaveType).forEach(r => {
      const type = r.leaveType || 'other';
      leaveTypes[type] = (leaveTypes[type] || 0) + 1;
    });

    return {
      present,
      absent,
      totalHours,
      totalDays,
      attendancePercentage,
      avgHours,
      leaveTypes,
      locationStats: records.filter(r => r.status === 'present').reduce((acc, r) => {
        const loc = r.location || 'Office';
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {})
    };
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const displayTasks = tasks.length === 0 ? SAMPLE_TASKS : tasks;
  const inProgressTasks = displayTasks.filter(t => t.status === 'in_progress');
  const assignedTasks = displayTasks.filter(t => t.status === 'assigned');
  const pausedTasks = displayTasks.filter(t => t.status === 'paused');
  const completedTasksList = completedTasks.length > 0 ? completedTasks : displayTasks.filter(t => t.status === 'completed');
  const filteredLeaves = leaveRequests.filter(l => leaveFilter === 'all' || l.status === leaveFilter);
  
  // Attendance filtering based on view
  let filteredAtt = [];
  let attendanceStats = {};
  let reportTitle = '';
  
  if (attendanceView === 'monthly') {
    filteredAtt = getMonthlyData(attendanceRecords, selectedYear, selectedMonth);
    attendanceStats = calculateStats(filteredAtt);
    reportTitle = `${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} ${selectedYear}`;
  } else {
    filteredAtt = getYearlyData(attendanceRecords, selectedYear);
    attendanceStats = calculateStats(filteredAtt);
    reportTitle = `Year ${selectedYear}`;
  }

  const stats = {
    total: displayTasks.length,
    active: displayTasks.filter(t => t.status !== 'completed').length,
    inProgress: inProgressTasks.length,
    assigned: assignedTasks.length,
    paused: pausedTasks.length,
    completed: completedTasksList.length,
    pendingLeaves: leaveRequests.filter(l => l.status === 'pending').length,
    attendance: attendanceRecords.length,
    totalHours: attendanceRecords.reduce((s, r) => s + (r.hoursWorked || 0), 0).toFixed(1),
    presentDays: attendanceRecords.filter(r => r.status === 'present').length,
    absentDays: attendanceRecords.filter(r => r.status === 'absent').length,
    componentsUsed: componentsUsed.length,
  };

  // ── Selected task for detail view ─────────────────────────────────────────
  const selectedTask = taskDetailId ? [...displayTasks, ...completedTasksList].find(t => t.id === taskDetailId) : null;

  // ── Colors ─────────────────────────────────────────────────────────────────
  const G = { dark: '#064E3B', mid: '#065F46', light: '#D1FAE5', accent: '#10B981' };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStartTask = (taskId) => {
    updateTaskStatus(taskId, 'in_progress');
  };

  const handleCompleteTask = (taskId) => {
    setIsCompleting(true);
    updateTaskStatus(taskId, 'completed');
    setTimeout(() => {
      setIsCompleting(false);
    }, 500);
  };

  const handlePauseTask = (taskId) => {
    setPauseTaskId(taskId);
    setPauseReason('');
  };

  const handleSubmitPause = (taskId) => {
    if (!pauseReason.trim()) { 
      toast.error('Please enter a reason for pausing'); 
      return; 
    }
    updateTaskStatus(taskId, 'paused', pauseReason);
  };

  const handleResumeTask = (taskId) => {
    updateTaskStatus(taskId, 'in_progress', 'Resumed after pause');
  };

  const handleViewDetails = (taskId) => {
    setTaskDetailId(taskId);
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'Not set';
    try {
      const date = new Date(deadline);
      return date.toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return deadline;
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: '#F0FDF4', minHeight: '100vh', fontFamily: "'Inter', system-ui, Arial, sans-serif", maxWidth: '480px', margin: '0 auto', position: 'relative' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{ background: `linear-gradient(135deg, ${G.dark} 0%, ${G.mid} 100%)`, color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={LOGO} alt="GOAG" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.3)' }} />
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px' }}>GOAG DRONES</div>
            <div style={{ fontSize: '10px', opacity: 0.75, letterSpacing: '0.5px' }}>EMPLOYEE PORTAL</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setShowProfileModal(true)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 10px 5px 5px', borderRadius: '24px', cursor: 'pointer', color: 'white' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: G.light, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white' }}>
              {profileImage
                ? <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '11px', fontWeight: '700', color: G.mid }}>{getInitials(user?.name)}</span>}
            </div>
            <span style={{ fontSize: '12px', fontWeight: '600', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
          </button>
          <button 
            onClick={onLogout} 
            style={{ background: '#EF4444', border: 'none', padding: '7px 12px', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px', paddingBottom: '90px' }}>

        {/* ── DASHBOARD ──────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${G.mid} 0%, ${G.accent} 100%)`, borderRadius: '16px', padding: '20px', color: 'white', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', opacity: 0.85 }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},</div>
              <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{user?.name?.split(' ')[0]} 👋</div>
              <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '6px' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { icon: <ClipboardList size={20} />, val: stats.total, label: 'Total Tasks', color: G.mid },
                { icon: <Clock size={20} />, val: stats.inProgress, label: 'In Progress', color: '#F59E0B' },
                { icon: <CheckCircle size={20} />, val: stats.completed, label: 'Completed', color: '#10B981' },
                { icon: <Package size={20} />, val: stats.componentsUsed, label: 'Components', color: '#8B5CF6' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* In Progress Tasks */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="#F59E0B" /> In Progress Task
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {inProgressTasks.length === 1 ? '1 active' : 'No active task'}
                </div>
              </div>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>Loading tasks...</div>
              ) : inProgressTasks.length === 0 ? (
                <div>
                  <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                    <Clock size={32} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px' }}>No task in progress</div>
                    <div style={{ fontSize: '11px', marginTop: '4px', color: '#D1D5DB' }}>
                      {assignedTasks.length > 0 ? 'Start a task from the list below' : 'No tasks assigned yet'}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowComponentModal(true)}
                    style={{
                      width: '100%',
                      background: `linear-gradient(135deg, ${G.mid} 0%, ${G.accent} 100%)`,
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(6, 78, 59, 0.2)',
                      transition: 'all 0.3s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <PlusCircle size={14} /> Add Component
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {inProgressTasks.map(task => {
                    const sb = statusBadge(task.status);
                    const pb = priorityBadge(task.priority);
                    const od = isOverdue(task.deadline, task.status);
                    const du = daysUntil(task.deadline);
                    const orderId = getOrderId(task);

                    return (
                      <div key={task.id} style={{ background: od ? '#FFF5F5' : '#FEF3C7', borderRadius: '12px', padding: '14px', border: od ? '1.5px solid #FECACA' : '1px solid #FDE68A', boxShadow: od ? '0 0 0 2px #FEE2E2' : '0 0 0 1px #FDE68A' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{orderId}</div>
                          </div>
                          <span style={{ background: pb.bg, color: pb.color, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '8px', marginLeft: '8px', flexShrink: 0 }}>{pb.icon} {task.priority}</span>
                        </div>

{task.desc && <div style={{ fontSize: '12px', color: '#4B5563', background: 'white', borderRadius: '8px', padding: '8px', marginBottom: '8px', lineHeight: 1.5 }}>{task.desc}</div>}

                        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#6B7280', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <span>📅 {formatDeadline(task.deadline)}</span>
                          {du !== null && <span style={{ color: od ? '#DC2626' : du <= 2 ? '#D97706' : '#6B7280', fontWeight: '600' }}>{od ? '⚠️ Overdue' : du === 0 ? '⏰ Due today' : `${du}d left`}</span>}
                          {task.assignedByName && <span>👤 {task.assignedByName}</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ background: sb.bg, color: sb.color, fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>{sb.text}</span>
                          <button 
                            onClick={() => handleViewDetails(task.id)} 
                            style={{ background: '#F3F4F6', color: '#374151', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Eye size={11} /> Details
                          </button>
                          <button 
                            onClick={() => handleCompleteTask(task.id)} 
                            disabled={isCompleting}
                            style={{ 
                              background: G.accent, 
                              color: 'white', 
                              border: 'none', 
                              padding: '5px 10px', 
                              borderRadius: '6px', 
                              cursor: isCompleting ? 'not-allowed' : 'pointer', 
                              fontSize: '10px', 
                              fontWeight: '600',
                              opacity: isCompleting ? 0.6 : 1
                            }}
                          >
                            {isCompleting ? 'Completing...' : 'Done ✓'}
                          </button>
                          <button 
                            onClick={() => handlePauseTask(task.id)} 
                            style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Pause size={11} /> Pause
                          </button>
                          <button 
                            onClick={() => setShowComponentModal(true)} 
                            style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <PlusCircle size={11} /> Add
                          </button>
                        </div>

                        {pauseTaskId === task.id && (
                          <div style={{ marginTop: '10px', padding: '12px', background: '#FEF3C7', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', marginBottom: '6px' }}>Why do you want to pause this task?</div>
                            <textarea 
                              value={pauseReason} 
                              onChange={e => setPauseReason(e.target.value)} 
                              placeholder="Explain why you need to pause…" 
                              rows={3} 
                              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box' }} 
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button 
                                onClick={() => handleSubmitPause(task.id)} 
                                style={{ flex: 1, background: '#F59E0B', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                              >
                                Submit Pause
                              </button>
                              <button 
                                onClick={() => setPauseTaskId(null)} 
                                style={{ padding: '8px 14px', background: '#6B7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Paused Tasks */}
            {pausedTasks.length > 0 && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Pause size={16} color="#D97706" /> Paused Tasks ({pausedTasks.length})
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pausedTasks.map(task => {
                    const pb = priorityBadge(task.priority);
                    const orderId = getOrderId(task);
                    return (
                      <div key={task.id} style={{ background: '#FEF3C7', borderRadius: '10px', padding: '12px', border: '1px solid #FDE68A' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</div>
                            <div style={{ fontSize: '10px', color: '#6B7280' }}>{orderId}</div>
                          </div>
                          <span style={{ background: pb.bg, color: pb.color, fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '6px', marginLeft: '8px', flexShrink: 0 }}>{pb.icon} {task.priority}</span>
                        </div>
                        {task.pauseReason && (
                          <div style={{ fontSize: '11px', color: '#92400E', background: '#FDE68A', padding: '6px 10px', borderRadius: '6px', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '600' }}>Pause reason: </span>{task.pauseReason}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#6B7280', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span>📅 {formatDeadline(task.deadline)}</span>
                          {task.assignedByName && <span>👤 {task.assignedByName}</span>}
                        </div>
                        <button 
                          onClick={() => handleResumeTask(task.id)} 
                          style={{ width: '100%', background: '#10B981', color: 'white', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                        >
                          ▶️ Resume Task
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Assigned Tasks */}
            {assignedTasks.length > 0 && inProgressTasks.length === 0 && pausedTasks.length === 0 && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ClipboardList size={16} color={G.mid} /> Available Tasks ({assignedTasks.length})
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Click Start to begin</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {assignedTasks.map(task => {
                    const pb = priorityBadge(task.priority);
                    const od = isOverdue(task.deadline, task.status);
                    const du = daysUntil(task.deadline);
                    const orderId = getOrderId(task);

                    return (
                      <div key={task.id} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '12px', border: '1px solid #E5E7EB' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</div>
                            <div style={{ fontSize: '10px', color: '#6B7280' }}>{orderId}</div>
                          </div>
                          <span style={{ background: pb.bg, color: pb.color, fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '6px', marginLeft: '8px', flexShrink: 0 }}>{pb.icon} {task.priority}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: '#6B7280', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span>📅 {formatDeadline(task.deadline)}</span>
                          {du !== null && <span style={{ color: od ? '#DC2626' : '#6B7280' }}>{od ? '⚠️ Overdue' : `${du}d left`}</span>}
                          {task.assignedByName && <span>👤 {task.assignedByName}</span>}
                        </div>
                        <button 
                          onClick={() => handleStartTask(task.id)} 
                          style={{ width: '100%', background: '#F59E0B', color: 'white', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                        >
                          🚀 Start Task
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {assignedTasks.length === 0 && inProgressTasks.length === 0 && pausedTasks.length === 0 && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '30px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <CheckCircle size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>All tasks completed! 🎉</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Great job! You have no pending tasks.</div>
              </div>
            )}
          </div>
        )}

        {/* ── ATTENDANCE TAB ────────────────────────────────────────────── */}
        {tab === 'attendance' && (
          <div>
            {/* View Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'white', borderRadius: '12px', padding: '4px', border: '1px solid #E5E7EB' }}>
              <button
                onClick={() => setAttendanceView('monthly')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: attendanceView === 'monthly' ? '700' : '400',
                  background: attendanceView === 'monthly' ? G.mid : 'transparent',
                  color: attendanceView === 'monthly' ? 'white' : '#6B7280',
                  transition: 'all 0.3s'
                }}
              >
                Monthly Report
              </button>
              <button
                onClick={() => setAttendanceView('yearly')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: attendanceView === 'yearly' ? '700' : '400',
                  background: attendanceView === 'yearly' ? G.mid : 'transparent',
                  color: attendanceView === 'yearly' ? 'white' : '#6B7280',
                  transition: 'all 0.3s'
                }}
              >
                Yearly Report
              </button>
            </div>

            {/* Month/Year Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  if (attendanceView === 'monthly') {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  } else {
                    setSelectedYear(selectedYear - 1);
                  }
                }}
                style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}
              >
                ◀
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>
                {reportTitle}
              </div>
              <button
                onClick={() => {
                  if (attendanceView === 'monthly') {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  } else {
                    setSelectedYear(selectedYear + 1);
                  }
                }}
                style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}
              >
                ▶
              </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              {[
                { label: 'Present', val: attendanceStats.present, color: '#10B981', icon: <Users size={16} /> },
                { label: 'Absent', val: attendanceStats.absent, color: '#EF4444', icon: <UserMinus size={16} /> },
                { label: 'Attend %', val: `${attendanceStats.attendancePercentage}%`, color: '#F59E0B', icon: <TrendingUpIcon size={16} /> },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
                    {s.icon} {s.label}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            {/* Additional Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Total Hours</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: G.mid }}>{attendanceStats.totalHours.toFixed(1)}h</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Avg: {attendanceStats.avgHours}h/day</div>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Total Days</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#8B5CF6' }}>{attendanceStats.totalDays}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Working days</div>
              </div>
            </div>

            {/* Leave Type Breakdown */}
            {Object.keys(attendanceStats.leaveTypes).length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>📋 Leave Breakdown</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(attendanceStats.leaveTypes).map(([type, count]) => (
                    <span key={type} style={{ 
                      background: '#FEF3C7', 
                      color: '#92400E', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location Stats */}
            {Object.keys(attendanceStats.locationStats || {}).length > 0 && (
              <div style={{ background: 'white', borderRadius: '12px', padding: '14px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', marginBottom: '8px' }}>📍 Work Location</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.entries(attendanceStats.locationStats).map(([location, count]) => (
                    <span key={location} style={{ 
                      background: '#DBEAFE', 
                      color: '#1D4ED8', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {location}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '90px 1fr 1fr 70px', 
                background: '#F9FAFB', 
                padding: '10px 14px',
                borderBottom: '2px solid #E5E7EB',
                fontSize: '10px',
                fontWeight: '700',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <div>Date</div>
                <div>Check In</div>
                <div>Check Out</div>
                <div style={{ textAlign: 'center' }}>Status</div>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredAtt.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>
                    <CalendarDays size={32} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px' }}>No records found</div>
                  </div>
                ) : (
                  filteredAtt.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((record, index) => {
                    const isPresent = record.status === 'present';
                    const isAbsent = record.status === 'absent';
                    const leaveType = record.leaveType || '';
                    
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '90px 1fr 1fr 70px', 
                          padding: '10px 14px',
                          borderBottom: index < filteredAtt.length - 1 ? '1px solid #F3F4F6' : 'none',
                          background: isAbsent ? '#FEF2F2' : isPresent ? '#F0FDF4' : 'white',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>
                          {fmtDate(record.date)}
                        </div>
                        <div style={{ fontSize: '12px', color: isPresent ? '#065F46' : '#9CA3AF' }}>
                          {isPresent ? fmtTime(record.checkIn) : '—'}
                          {isAbsent && leaveType && (
                            <span style={{ fontSize: '10px', color: '#DC2626', display: 'block' }}>
                              {leaveType === 'sick' ? '🤒 Sick' : 
                               leaveType === 'casual' ? '😊 Casual' : 
                               leaveType === 'annual' ? '🌴 Annual' : 
                               leaveType === 'other' ? '📋 Other' : 'Absent'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: isPresent ? '#065F46' : '#9CA3AF' }}>
                          {isPresent ? fmtTime(record.checkOut) : '—'}
                          {isPresent && record.hoursWorked && (
                            <span style={{ fontSize: '10px', color: '#6B7280', display: 'block' }}>
                              {record.hoursWorked}h
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '10px', 
                            fontWeight: '700',
                            background: isPresent ? '#D1FAE5' : '#FEE2E2',
                            color: isPresent ? '#059669' : '#DC2626'
                          }}>
                            {isPresent ? '✅' : '❌'}
                          </span>
                          {isPresent && record.location && (
                            <div style={{ fontSize: '8px', color: '#6B7280', marginTop: '1px' }}>
                              {record.location === 'Office' ? '🏢' : '🏠'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LEAVES TAB ───────────────────────────────────────────────── */}
        {tab === 'leaves' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <select 
                value={leaveFilter} 
                onChange={e => setLeaveFilter(e.target.value)} 
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', background: 'white', fontWeight: '500' }}
              >
                <option value="all">📋 All Requests</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
              </select>
              <button 
                onClick={() => setShowLeaveModal(true)} 
                style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
              >
                <PlusCircle size={16} /> Apply
              </button>
            </div>

            {filteredLeaves.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <CalendarDays size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>No leave requests</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Apply for leave to see it here</div>
                <button 
                  onClick={() => setShowLeaveModal(true)} 
                  style={{ marginTop: '12px', background: '#8B5CF6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                >
                  Apply for Leave
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredLeaves.map(l => {
                  const sb = statusBadge(l.status);
                  const isEditable = l.status === 'pending';
                  
                  return (
                    <div key={l.id} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                            {l.type.charAt(0).toUpperCase() + l.type.slice(1)} Leave
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px' }}>
                            📅 {fmtDate(l.startDate)} → {fmtDate(l.endDate)}
                          </div>
                        </div>
                        <span style={{ background: sb.bg, color: sb.color, fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', flexShrink: 0 }}>
                          {sb.text}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '13px', color: '#4B5563', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '600' }}>Reason:</span> {l.reason}
                      </div>
                      {l.description && <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>{l.description}</div>}
                      
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '10px' }}>
                        Applied {fmtDateTime(l.appliedDate)}
                        {l.updatedAt && l.updatedAt !== l.appliedDate && (
                          <span style={{ display: 'block', marginTop: '2px', color: '#8B5CF6' }}>
                            ✏️ Updated {fmtDateTime(l.updatedAt)}
                          </span>
                        )}
                      </div>
                      
                      {l.status === 'rejected' && l.rejectionReason && (
                        <div style={{ marginBottom: '10px', padding: '10px', background: '#FEE2E2', borderRadius: '8px', fontSize: '12px', color: '#DC2626' }}>
                          <span style={{ fontWeight: '600' }}>Manager note: </span>{l.rejectionReason}
                        </div>
                      )}

                      {isEditable && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button 
                            onClick={() => handleEditLeave(l)}
                            style={{ flex: 1, background: '#3B82F6', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button 
                            onClick={() => deleteLeave(l.id)}
                            style={{ flex: 1, background: '#EF4444', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COMPLETED TAB ─────────────────────────────────────────────── */}
        {tab === 'completed' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937' }}>✅ Completed Tasks</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669', background: '#D1FAE5', padding: '4px 12px', borderRadius: '20px' }}>
                {completedTasksList.length} completed
              </div>
            </div>
            
            {completedTasksList.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                <Award size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>No completed tasks yet</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>Complete tasks to see them here</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {completedTasksList.map(task => {
                  const orderId = getOrderId(task);
                  return (
                    <div key={task.id} style={{ 
                      background: 'white', 
                      borderRadius: '14px', 
                      padding: '16px', 
                      border: '1px solid #D1FAE5', 
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                      transition: 'all 0.3s ease',
                      animation: 'fadeIn 0.5s ease-in'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#065F46' }}>{task.name}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{orderId}</div>
                        </div>
                        <span style={{ 
                          background: '#D1FAE5', 
                          color: '#059669', 
                          fontSize: '11px', 
                          fontWeight: '700', 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          flexShrink: 0
                        }}>
                          <Check size={14} /> Done
                        </span>
                      </div>
                      
                      {task.desc && (
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#4B5563', 
                          background: '#F9FAFB', 
                          borderRadius: '8px', 
                          padding: '10px', 
                          marginBottom: '10px', 
                          lineHeight: 1.5,
                          border: '1px solid #E5E7EB'
                        }}>
                          {task.desc}
                        </div>
                      )}
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '8px', 
                        marginBottom: '10px',
                        padding: '10px',
                        background: '#F9FAFB',
                        borderRadius: '8px'
                      }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DEADLINE</div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>📅 {formatDeadline(task.deadline)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>COMPLETED</div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#059669' }}>✅ {fmtDateTime(task.completedAt)}</div>
                        </div>
                      </div>
                      
                      {task.completionNote && task.completionNote !== 'Task completed' && (
                        <div style={{ 
                          padding: '10px 12px', 
                          background: '#FEF3C7', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          color: '#92400E', 
                          border: '1px solid #FDE68A', 
                          marginBottom: '10px' 
                        }}>
                          <span style={{ fontWeight: '600' }}>📝 Delay note: </span>{task.completionNote}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => handleViewDetails(task.id)} 
                        style={{ 
                          width: '100%', 
                          background: '#F3F4F6', 
                          color: '#374151', 
                          border: 'none', 
                          padding: '10px', 
                          borderRadius: '10px', 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '6px', 
                          transition: 'all 0.2s ease' 
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                      >
                        <Eye size={16} /> View Details
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ────────────────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: 'white', borderTop: '1px solid #E5E7EB', display: 'flex', zIndex: 200, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
        {[
          { id: 'dashboard', icon: <Home size={20} />, label: 'Home' },
          { id: 'attendance', icon: <ClockIcon size={20} />, label: 'Attendance' },
          { id: 'leaves', icon: <CalendarDays size={20} />, label: 'Leave', badge: stats.pendingLeaves },
          { id: 'completed', icon: <CheckCircle size={20} />, label: 'Done', badge: stats.completed },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            style={{ flex: 1, padding: '8px 0 10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', position: 'relative', color: tab === t.id ? G.mid : '#9CA3AF' }}
          >
            <div style={{ position: 'relative' }}>
              {t.icon}
              {t.badge > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: '700', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge > 9 ? '9+' : t.badge}</span>}
            </div>
            <span style={{ fontSize: '10px', fontWeight: tab === t.id ? '700' : '400' }}>{t.label}</span>
            {tab === t.id && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '24px', height: '3px', background: G.mid, borderRadius: '0 0 4px 4px' }} />}
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════════
          COMPONENT MODAL
         ════════════════════════════════════════════════════════════════════ */}
      {showComponentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '2px', margin: '0 auto 20px' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>Repair Parts / Components</h3>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>SR-20260619-007 - Smart Farming</div>
              </div>
              <button 
                onClick={() => setShowComponentModal(false)} 
                style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

<div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>
                <Package size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Add Component (Select from drone components used)
              </div>
              
              <form onSubmit={handleAddComponent}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Component *</label>
                  <div style={{ position: 'relative' }} ref={componentInputRef}>
                    <input 
                      type="text"
                      value={newComponent.componentName}
                      onChange={(e) => handleComponentInputChange(e.target.value)}
                      onFocus={handleInputFocus}
                      placeholder="Type to search or select from dropdown..."
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '10px', 
                        fontSize: '13px',
                        background: 'white'
                      }}
                    />
                    {showDropdown && filteredComponents.length > 0 && (
                      <div 
                        ref={dropdownRef}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 50,
                          marginTop: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {filteredComponents.map(comp => (
                          <div
                            key={comp.id}
                            onClick={() => handleSelectComponent(comp)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #F3F4F6',
                              fontSize: '13px',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <div style={{ fontWeight: '500' }}>{comp.name}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>{comp.category}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                    Select from dropdown or type your own component name
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Quantity *</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newComponent.quantity} 
                    onChange={e => setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                    required
                  />
                </div>

                {newComponent.componentName && !SAMPLE_COMPONENTS.find(c => c.name.toLowerCase() === newComponent.componentName.toLowerCase()) && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Category (Optional)</label>
                    <input 
                      type="text"
                      value={newComponent.category}
                      onChange={e => setNewComponent({ ...newComponent, category: e.target.value })}
                      placeholder="Enter category..."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px' }}
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    background: G.mid, 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontSize: '13px', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <PlusCircle size={16} /> Add
                </button>
              </form>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '12px' }}>
                <ShoppingCart size={16} style={{ display: 'inline', marginRight: '6px' }} />
                Components Used ({componentsUsed.length})
              </div>

              {componentsUsed.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #D1D5DB' }}>
                  <Package size={48} color="#D1D5DB" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>No components added yet</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Select or type a component name and add it</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {componentsUsed.map(comp => (
                    <div key={comp.id} style={{ 
                      background: 'white', 
                      borderRadius: '10px', 
                      padding: '12px 14px', 
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {comp.componentName}
                          {comp.isCustom && <span style={{ fontSize: '10px', color: '#8B5CF6', marginLeft: '6px' }}>(Custom)</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                          Category: {comp.category || 'N/A'} | Qty: {comp.quantity}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                          Added: {fmtDateTime(comp.addedAt)} {comp.addedBy && `by ${comp.addedBy}`}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveComponent(comp.id)}
                        style={{ 
                          background: '#FEE2E2', 
                          color: '#DC2626', 
                          border: 'none', 
                          padding: '6px 10px', 
                          borderRadius: '8px', 
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowComponentModal(false)} 
              style={{ 
                width: '100%', 
                padding: '14px', 
                marginTop: '16px',
                background: '#F3F4F6', 
                color: '#374151', 
                border: '1px solid #E5E7EB', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontSize: '14px', 
                fontWeight: '600' 
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TASK DETAIL FULL-SCREEN DRAWER
         ════════════════════════════════════════════════════════════════════ */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, background: '#F0FDF4', zIndex: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', maxWidth: '480px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ background: `linear-gradient(135deg, ${G.dark} 0%, ${G.mid} 100%)`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 10 }}>
            <button 
              onClick={() => setTaskDetailId(null)} 
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0 }}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedTask.name}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{getOrderId(selectedTask)}</div>
            </div>
            {(() => {
              const sb = statusBadge(selectedTask.status);
              return <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.3)' }}>{sb.text}</span>;
            })()}
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>Assigned By</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: selectedTask.assignedByRole === 'production' ? '#DBEAFE' : '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedTask.assignedByRole === 'production'
                    ? <Building2 size={22} color="#1D4ED8" />
                    : <UserCheck size={22} color="#7C3AED" />}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{selectedTask.assignedByName || selectedTask.assignedBy || 'Manager'}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    {selectedTask.assignedByRole === 'production' ? '⚙️ Production Manager' : selectedTask.assignedByRole === 'after_sales' ? '🔧 After-Sales Manager' : '👔 Manager'}
                  </div>
                </div>
              </div>
            </div>

            {selectedTask.desc && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Description</div>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6 }}>{selectedTask.desc}</div>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                <ClockIcon2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Timeline
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>
                    <CalendarIcon size={12} style={{ display: 'inline', marginRight: '4px' }} /> Assigned
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                    {selectedTask.createdAt ? fmtDateWithTime(selectedTask.createdAt) : fmtDate(selectedTask.assignedDate)}
                  </div>
                </div>
                <div style={{ padding: '12px', background: isOverdue(selectedTask.deadline, selectedTask.status) ? '#FFF5F5' : '#F9FAFB', borderRadius: '10px', border: isOverdue(selectedTask.deadline, selectedTask.status) ? '1px solid #FECACA' : '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>
                    <CalendarIcon size={12} style={{ display: 'inline', marginRight: '4px' }} /> Deadline
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: isOverdue(selectedTask.deadline, selectedTask.status) ? '#DC2626' : '#111827' }}>
                    {selectedTask.deadline ? formatDeadline(selectedTask.deadline) : 'Not set'}
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Priority</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                    {priorityBadge(selectedTask.priority).icon} {selectedTask.priority || 'Normal'}
                  </div>
                </div>
                <div style={{ padding: '12px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '4px' }}>Status</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                    {statusBadge(selectedTask.status).text}
                  </div>
                </div>
              </div>
              
              {(() => {
                const du = daysUntil(selectedTask.deadline);
                const od = isOverdue(selectedTask.deadline, selectedTask.status);
                if (selectedTask.status === 'completed') {
                  return (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#D1FAE5', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#059669', textAlign: 'center' }}>
                      ✅ Completed on {fmtDateTime(selectedTask.completedAt)}
                    </div>
                  );
                }
                if (selectedTask.status === 'paused') {
                  return (
                    <div style={{ marginTop: '10px', padding: '10px 14px', background: '#FEF3C7', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#D97706', textAlign: 'center' }}>
                      ⏸️ Task paused on {fmtDateTime(selectedTask.pausedAt)}
                      {selectedTask.pauseReason && ` - Reason: ${selectedTask.pauseReason}`}
                    </div>
                  );
                }
                return (
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: od ? '#FEE2E2' : du !== null && du <= 2 ? '#FEF3C7' : '#D1FAE5', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: od ? '#DC2626' : du !== null && du <= 2 ? '#B45309' : '#059669', textAlign: 'center' }}>
                    {od ? '⚠️ This task is overdue!' : du === 0 ? '⏰ Due today!' : du === 1 ? '⏳ Due tomorrow!' : `✅ ${du} days remaining`}
                  </div>
                );
              })()}
            </div>

            {selectedTask.status === 'paused' && (
              <div style={{ background: '#FEF3C7', borderRadius: '14px', padding: '16px', border: '1.5px solid #FDE68A' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Pause size={14} /> This task is currently paused.
                </div>
                {selectedTask.pauseReason && (
                  <div style={{ fontSize: '13px', color: '#78350F', marginBottom: '12px', padding: '10px', background: 'white', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '600' }}>Reason: </span>{selectedTask.pauseReason}
                  </div>
                )}
                <button
                  onClick={() => { handleResumeTask(selectedTask.id); setTaskDetailId(null); }}
                  style={{ width: '100%', background: '#10B981', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
                >
                  ▶️ Resume Task
                </button>
              </div>
            )}

            {selectedTask.status !== 'completed' && selectedTask.status !== 'paused' && isOverdue(selectedTask.deadline, selectedTask.status) && (
              <div style={{ background: '#FFF5F5', borderRadius: '14px', padding: '16px', border: '1.5px solid #FECACA' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertIcon size={14} /> This task is overdue. Submit a report to your manager.
                </div>
                <div>
                  <textarea
                    value={overdueReport}
                    onChange={e => setOverdueReport(e.target.value)}
                    placeholder="Explain why this task was not completed on time. This will be sent to your manager…"
                    rows={4}
                    style={{ width: '100%', padding: '10px', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box', background: 'white' }}
                  />
                  <button
                    onClick={() => {
                      if (!overdueReport.trim()) { toast.error('Please write your report first'); return; }
                      updateTaskStatus(selectedTask.id, 'completed', overdueReport);
                      setTaskDetailId(null);
                    }}
                    style={{ marginTop: '10px', width: '100%', background: '#DC2626', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Send size={15} /> Submit Delay Report to Manager
                  </button>
                </div>
              </div>
            )}

            {selectedTask.status === 'completed' && selectedTask.completionNote && selectedTask.completionNote !== 'Task completed' && (
              <div style={{ background: '#FEF3C7', borderRadius: '14px', padding: '16px', border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400E', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delay Report Submitted</div>
                <div style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.5 }}>{selectedTask.completionNote}</div>
                {selectedTask.employeeReport?.submittedAt && (
                  <div style={{ fontSize: '11px', color: '#B45309', marginTop: '8px' }}>Submitted: {fmtDateTime(selectedTask.employeeReport.submittedAt)}</div>
                )}
              </div>
            )}

            {selectedTask.statusHistory?.length > 0 && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
                  <ClockIcon2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Activity Log
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...selectedTask.statusHistory].reverse().map((h, i) => {
                    const sb = statusBadge(h.status);
                    return (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sb.color, marginTop: '4px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{sb.text}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{fmtDateTime(h.date)}</div>
                          {h.reason && <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px', fontStyle: 'italic' }}>"{h.reason}"</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTask.status !== 'completed' && selectedTask.status !== 'paused' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedTask.status === 'assigned' && (
                  <button 
                    onClick={() => { updateTaskStatus(selectedTask.id, 'in_progress'); setTaskDetailId(null); }} 
                    style={{ width: '100%', background: '#F59E0B', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
                  >
                    🚀 Start Working
                  </button>
                )}
                {selectedTask.status === 'in_progress' && (
                  <>
                    <button 
                      onClick={() => { handleCompleteTask(selectedTask.id); setTaskDetailId(null); }} 
                      style={{ width: '100%', background: G.accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
                    >
                      ✅ Mark as Complete
                    </button>
                    <button 
                      onClick={() => { handlePauseTask(selectedTask.id); }} 
                      style={{ width: '100%', background: '#F59E0B', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Pause size={18} /> Pause Task
                    </button>
                  </>
                )}
              </div>
            )}

            {pauseTaskId === selectedTask.id && (
              <div style={{ marginTop: '10px', padding: '16px', background: '#FEF3C7', borderRadius: '12px', border: '2px solid #FDE68A' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', marginBottom: '8px' }}>Why do you want to pause this task?</div>
                <textarea 
                  value={pauseReason} 
                  onChange={e => setPauseReason(e.target.value)} 
                  placeholder="Explain why you need to pause…" 
                  rows={4} 
                  style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} 
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => handleSubmitPause(selectedTask.id)} 
                    style={{ flex: 1, background: '#F59E0B', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  >
                    Submit Pause
                  </button>
                  <button 
                    onClick={() => setPauseTaskId(null)} 
                    style={{ padding: '12px 20px', background: '#6B7280', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          LEAVE MODAL - Create
         ════════════════════════════════════════════════════════════════════ */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>Apply for Leave</h3>
              <button 
                onClick={() => setShowLeaveModal(false)} 
                style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={submitLeave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Leave Type *</label>
                <select 
                  value={newLeave.type} 
                  onChange={e => setNewLeave({ ...newLeave, type: e.target.value })} 
                  style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', background: 'white' }}
                >
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="casual">😊 Casual Leave</option>
                  <option value="annual">🌴 Annual Leave</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Start Date *</label>
                  <input 
                    type="date" 
                    value={newLeave.startDate} 
                    onChange={e => setNewLeave({ ...newLeave, startDate: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>End Date *</label>
                  <input 
                    type="date" 
                    value={newLeave.endDate} 
                    onChange={e => setNewLeave({ ...newLeave, endDate: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Reason *</label>
                <input 
                  type="text" 
                  value={newLeave.reason} 
                  onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} 
                  placeholder="Brief reason" 
                  required 
                  style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Details (Optional)</label>
                <textarea 
                  value={newLeave.description} 
                  onChange={e => setNewLeave({ ...newLeave, description: e.target.value })} 
                  placeholder="Additional details…" 
                  rows={3} 
                  style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} 
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '14px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          LEAVE MODAL - Edit
         ════════════════════════════════════════════════════════════════════ */}
      {editingLeaveId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>✏️ Edit Leave Request</h3>
              <button 
                onClick={() => { setEditingLeaveId(null); setEditLeave({ type: 'sick', startDate: '', endDate: '', reason: '', description: '' }); }} 
                style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={updateLeave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Leave Type *</label>
                <select 
                  value={editLeave.type} 
                  onChange={e => setEditLeave({ ...editLeave, type: e.target.value })} 
                  style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', background: 'white' }}
                >
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="casual">😊 Casual Leave</option>
                  <option value="annual">🌴 Annual Leave</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Start Date *</label>
                  <input 
                    type="date" 
                    value={editLeave.startDate} 
                    onChange={e => setEditLeave({ ...editLeave, startDate: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>End Date *</label>
                  <input 
                    type="date" 
                    value={editLeave.endDate} 
                    onChange={e => setEditLeave({ ...editLeave, endDate: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Reason *</label>
                <input 
                  type="text" 
                  value={editLeave.reason} 
                  onChange={e => setEditLeave({ ...editLeave, reason: e.target.value })} 
                  placeholder="Brief reason" 
                  required 
                  style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Details (Optional)</label>
                <textarea 
                  value={editLeave.description} 
                  onChange={e => setEditLeave({ ...editLeave, description: e.target.value })} 
                  placeholder="Additional details…" 
                  rows={3} 
                  style={{ width: '100%', padding: '11px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} 
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '14px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
              >
                Update Leave Request
              </button>
            </form>
          </div>
        </div>
      )}

{/* ════════════════════════════════════════════════════════════════════
          PROFILE BOTTOM SHEET
         ════════════════════════════════════════════════════════════════════ */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ width: '40px', height: '4px', background: '#E5E7EB', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>My Profile</h3>
              <button 
                onClick={() => setShowProfileModal(false)} 
                style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div 
                onClick={() => fileInputRef.current?.click()} 
                style={{ width: '100px', height: '100px', borderRadius: '50%', background: G.light, border: `4px solid ${G.mid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
              >
                {profileImage
                  ? <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '36px', fontWeight: '800', color: G.mid }}>{getInitials(user?.name)}</span>}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.45)', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Camera size={14} />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>Tap to change photo</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              {[
                { val: stats.total, label: 'Tasks', color: G.mid },
                { val: stats.completed, label: 'Done', color: '#10B981' },
                { val: `${stats.totalHours}h`, label: 'Hours', color: '#F59E0B' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#F9FAFB', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <form onSubmit={saveProfile}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', editable: true },
                { key: 'email', label: 'Email', type: 'email', editable: true },
                { key: 'phone', label: 'Phone', type: 'tel', editable: true },
                { key: 'employeeId', label: 'Employee ID', type: 'text', editable: false },
                { key: 'role', label: 'Role', type: 'text', editable: false },
                { key: 'department', label: 'Department', type: 'text', editable: true },
                { key: 'emergencyContact', label: 'Emergency Contact', type: 'tel', editable: true },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={empDetails[f.key] || ''}
                    onChange={e => f.editable && setEmpDetails({ ...empDetails, [f.key]: e.target.value })}
                    disabled={!f.editable}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', background: f.editable ? 'white' : '#F9FAFB', color: f.editable ? '#111827' : '#6B7280', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '700', color: '#374151' }}>Address</label>
                <textarea 
                  value={empDetails.address || ''} 
                  onChange={e => setEmpDetails({ ...empDetails, address: e.target.value })} 
                  rows={2} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} 
                />
              </div>
              <button 
                type="submit" 
                style={{ width: '100%', padding: '14px', background: G.mid, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}