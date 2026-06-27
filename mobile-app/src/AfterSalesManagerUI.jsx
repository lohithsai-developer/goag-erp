import { useState, useEffect } from 'react';
import {
  Package, Users, ClipboardList, CheckCircle, Clock, AlertCircle,
  Plus, Eye, Search, UserPlus, Calendar, TrendingUp, TrendingDown,
  Wrench, UserCheck, ChevronRight, BarChart3, Filter, X, Edit2, Save,
  ChevronDown, ChevronUp, Timer, Phone, MapPin, Calendar as CalendarIcon,
  Truck, Home, Briefcase, Star, Award, Settings, Activity, BarChart,
  User, Camera, Mail, Phone as PhoneIcon, Briefcase as BriefcaseIcon,
  UserCircle, Pencil, Info, ShoppingBag, History
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  BarChart as ReBarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// Pre-defined components used in drone manufacturing
const DRONE_COMPONENTS = [
  { id: 'motor', name: 'Motor', category: 'Propulsion', defaultCost: 4500 },
  { id: 'esc', name: 'ESC (Electronic Speed Controller)', category: 'Propulsion', defaultCost: 3500 },
  { id: 'propeller', name: 'Propeller Set', category: 'Propulsion', defaultCost: 1200 },
  { id: 'battery', name: 'LiPo Battery', category: 'Power', defaultCost: 8500 },
  { id: 'power_distribution', name: 'Power Distribution Board', category: 'Power', defaultCost: 2800 },
  { id: 'flight_controller', name: 'Flight Controller', category: 'Avionics', defaultCost: 12000 },
  { id: 'gps_module', name: 'GPS Module', category: 'Avionics', defaultCost: 6500 },
  { id: 'compass', name: 'Compass Module', category: 'Avionics', defaultCost: 3200 },
  { id: 'receiver', name: 'Receiver', category: 'Avionics', defaultCost: 4200 },
  { id: 'transmitter', name: 'Transmitter', category: 'Avionics', defaultCost: 7500 },
  { id: 'camera', name: 'Camera Module', category: 'Sensors', defaultCost: 15000 },
  { id: 'gimbal', name: 'Gimbal Stabilizer', category: 'Sensors', defaultCost: 18000 },
  { id: 'fpv_system', name: 'FPV System', category: 'Sensors', defaultCost: 9500 },
  { id: 'frame', name: 'Drone Frame', category: 'Structure', defaultCost: 5500 },
  { id: 'landing_gear', name: 'Landing Gear', category: 'Structure', defaultCost: 2200 },
  { id: 'sensor', name: 'Obstacle Sensor', category: 'Sensors', defaultCost: 7800 },
  { id: 'servo', name: 'Servo Motor', category: 'Propulsion', defaultCost: 1800 },
  { id: 'wiring_kit', name: 'Wiring Harness Kit', category: 'Structure', defaultCost: 1500 }
];

// Component categories for grouping
const COMPONENT_CATEGORIES = {
  'Propulsion': { icon: '⚡', color: '#F59E0B' },
  'Power': { icon: '🔋', color: '#DC2626' },
  'Avionics': { icon: '📡', color: '#3B82F6' },
  'Sensors': { icon: '📷', color: '#8B5CF6' },
  'Structure': { icon: '🏗️', color: '#065F46' }
};

// Drone models data
const DRONE_MODELS = [
  { id: 1, name: 'AGRIFLOX® CROPS FERTIGINATE™', price: 337365 },
  { id: 2, name: 'GOAG AgriSpray X1', price: 250000 },
  { id: 3, name: 'Precision Sprayer Pro', price: 450000 }
];

// Order tracking stages
const ORDER_STAGES = ['CREATED', 'ASSIGNED', 'TASK_COMPLETED', 'QUALITY_CHECK', 'READY_FOR_DELIVERY', 'DELIVERED'];

const ORDER_STAGE_LABELS = {
  'CREATED': 'Created',
  'ASSIGNED': 'Assigned',
  'TASK_COMPLETED': 'Task Completed',
  'QUALITY_CHECK': 'Quality Check',
  'READY_FOR_DELIVERY': 'Ready for Delivery',
  'DELIVERED': 'Delivered'
};

const LOGO = "https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_99,h_99,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png";

export default function AfterSalesManagerUI({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerTypeModal, setShowCustomerTypeModal] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedExistingCustomer, setSelectedExistingCustomer] = useState(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [viewingTaskDetails, setViewingTaskDetails] = useState(null);
  const [viewingOrderTracking, setViewingOrderTracking] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.name || 'LOHITH SAI GUTHHIKONDA',
    designation: 'Service Manager',
    phone: user?.phone || '+91 9876543210',
    email: user?.email || 'lohith.guttikonda07@gmail.com',
    photo: user?.photo || null
  });
  const [editProfileData, setEditProfileData] = useState({ ...profileData });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // New Task Form State
  const [newTask, setNewTask] = useState({
    taskName: '', description: '', deadline: '', deadlineTime: '17:00', assignedTo: []
  });

  // Edit Task State
  const [editTaskData, setEditTaskData] = useState({
    taskName: '', description: '', deadline: '', deadlineTime: '17:00', assigned_to: []
  });

  // Cancel Task State
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  const [editRequestData, setEditRequestData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    droneModel: '',
    issueType: '',
    description: '',
    priority: 'NORMAL'
  });

  // New request form
  const [newRequest, setNewRequest] = useState({
    customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
    droneModel: '', issueType: '', description: '', priority: 'NORMAL'
  });

  // Parts/Components state
  const [showPartsModal, setShowPartsModal] = useState(null);
  const [partsData, setPartsData] = useState({});

  // Customers state
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Reports state
  const [reportView, setReportView] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customFrom, setCustomFrom] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().split('T')[0]);

  // Auto-sync employee availability based on active tasks
  useEffect(() => {
    if (employees.length === 0) return;
    let changed = false;
    const updatedEmployees = employees.map(emp => {
      const isBusy = tasks.some(task =>
        task.assigned_to?.includes(emp.id) &&
        task.status !== 'COMPLETED' &&
        task.status !== 'CANCELLED'
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

  // Load data from localStorage
  useEffect(() => {
    loadData();
    // Load saved profile data
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData(parsed);
      setEditProfileData(parsed);
    }
    // Load parts data
    const savedParts = localStorage.getItem('parts_data');
    if (savedParts) {
      setPartsData(JSON.parse(savedParts));
    }
  }, []);

  const loadData = () => {
    // Load service requests
    const storedRequests = localStorage.getItem('service_requests');
    if (storedRequests) {
      setRequests(JSON.parse(storedRequests));
    } else {
      const sampleRequests = [
        {
          id: 1,
          request_number: 'SR-20260101-005',
          customerName: 'Rajesh Farms',
          customerPhone: '9876543210',
          customerEmail: 'rajesh@farms.com',
          customerAddress: '123 Farm Road, Pune',
          droneModel: 'AGRIFLOX® CROPS FERTIGINATE™',
          issueType: 'Motor Failure',
          description: 'One motor not working, drone tilting',
          priority: 'HIGH',
          status: 'COMPLETED',
          created_at: '2026-01-01T10:00:00Z',
          order_stage: 'DELIVERED',
          delivered_at: '2026-01-05T15:30:00Z',
          order_history: [
            { stage: 'CREATED', date: '2026-01-01T10:00:00Z', time: '10:00 AM', message: 'Service request created' },
            { stage: 'ASSIGNED', date: '2026-01-01T11:00:00Z', time: '11:00 AM', message: 'Task assigned to Ramesh Kumar, Suresh Patel' },
            { stage: 'TASK_COMPLETED', date: '2026-01-03T16:00:00Z', time: '4:00 PM', message: 'Task "Diagnose Motor Issue" completed' },
            { stage: 'QUALITY_CHECK', date: '2026-01-04T10:00:00Z', time: '10:00 AM', message: 'Quality Check started' },
            { stage: 'READY_FOR_DELIVERY', date: '2026-01-04T16:00:00Z', time: '4:00 PM', message: 'Ready for delivery' },
            { stage: 'DELIVERED', date: '2026-01-05T15:30:00Z', time: '3:30 PM', message: '✅ Product delivered to Rajesh Farms on 5 Jan 2026' }
          ],
          purchase_date: '2025-12-15T00:00:00Z'
        },
        {
          id: 2,
          request_number: 'SR-20260115-006',
          customerName: 'GreenField Agro',
          customerPhone: '9876543211',
          customerEmail: 'contact@greenfield.com',
          customerAddress: '456 Green Road, Nagpur',
          droneModel: 'GOAG AgriSpray X1',
          issueType: 'Battery Issue',
          description: 'Battery not holding charge',
          priority: 'NORMAL',
          status: 'IN_PROGRESS',
          created_at: '2026-01-15T14:30:00Z',
          order_stage: 'ASSIGNED',
          order_history: [
            { stage: 'CREATED', date: '2026-01-15T14:30:00Z', time: '2:30 PM', message: 'Service request created' },
            { stage: 'ASSIGNED', date: '2026-01-15T16:00:00Z', time: '4:00 PM', message: 'Task assigned to Mahesh Singh' }
          ],
          purchase_date: '2025-11-20T00:00:00Z'
        },
        {
          id: 3,
          request_number: 'SR-20260120-007',
          customerName: 'Smart Farming',
          customerPhone: '9876543212',
          customerEmail: 'info@smartfarming.com',
          customerAddress: '789 Tech Park, Hyderabad',
          droneModel: 'Precision Sprayer Pro',
          issueType: 'GPS Signal Loss',
          description: 'Drone losing GPS signal frequently',
          priority: 'URGENT',
          status: 'COMPLETED',
          created_at: '2026-01-20T09:15:00Z',
          order_stage: 'DELIVERED',
          delivered_at: '2026-01-25T11:00:00Z',
          order_history: [
            { stage: 'CREATED', date: '2026-01-20T09:15:00Z', time: '9:15 AM', message: 'Service request created' },
            { stage: 'ASSIGNED', date: '2026-01-20T10:00:00Z', time: '10:00 AM', message: 'Task assigned to Dinesh Yadav, Prakash Reddy' },
            { stage: 'TASK_COMPLETED', date: '2026-01-22T17:00:00Z', time: '5:00 PM', message: 'Task "Fix GPS Issue" completed' },
            { stage: 'QUALITY_CHECK', date: '2026-01-23T09:00:00Z', time: '9:00 AM', message: 'Quality Check started' },
            { stage: 'READY_FOR_DELIVERY', date: '2026-01-24T12:00:00Z', time: '12:00 PM', message: 'Ready for delivery' },
            { stage: 'DELIVERED', date: '2026-01-25T11:00:00Z', time: '11:00 AM', message: '✅ Product delivered to Smart Farming on 25 Jan 2026' }
          ],
          purchase_date: '2025-10-10T00:00:00Z'
        },
        {
          id: 4,
          request_number: 'SR-20260125-008',
          customerName: 'Kisan Agro',
          customerPhone: '9876543213',
          customerEmail: 'kisan@agro.com',
          customerAddress: '456 Farm Road, Pune',
          droneModel: 'AGRIFLOX® CROPS FERTIGINATE™',
          issueType: 'Software Issue',
          description: 'Drone not responding to commands',
          priority: 'NORMAL',
          status: 'COMPLETED',
          created_at: '2026-01-25T09:15:00Z',
          order_stage: 'DELIVERED',
          delivered_at: '2026-01-30T14:00:00Z',
          order_history: [
            { stage: 'CREATED', date: '2026-01-25T09:15:00Z', time: '9:15 AM', message: 'Service request created' },
            { stage: 'ASSIGNED', date: '2026-01-25T11:00:00Z', time: '11:00 AM', message: 'Task assigned to Ramesh Kumar' },
            { stage: 'TASK_COMPLETED', date: '2026-01-27T15:00:00Z', time: '3:00 PM', message: 'Task "Software Update" completed' },
            { stage: 'QUALITY_CHECK', date: '2026-01-28T10:00:00Z', time: '10:00 AM', message: 'Quality Check started' },
            { stage: 'READY_FOR_DELIVERY', date: '2026-01-29T12:00:00Z', time: '12:00 PM', message: 'Ready for delivery' },
            { stage: 'DELIVERED', date: '2026-01-30T14:00:00Z', time: '2:00 PM', message: '✅ Product delivered to Kisan Agro on 30 Jan 2026' }
          ],
          purchase_date: '2025-09-05T00:00:00Z'
        }
      ];
      setRequests(sampleRequests);
      localStorage.setItem('service_requests', JSON.stringify(sampleRequests));
    }

    // Load tasks
    const storedTasks = localStorage.getItem('service_tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      const sampleTasks = [
        {
          id: 101,
          request_id: 1,
          request_number: 'SR-20260101-005',
          task_name: 'Diagnose Motor Issue',
          description: 'Check all motors and identify which one is causing the tilting issue',
          deadline: '2026-01-03T17:00:00',
          deadline_date: '2026-01-03',
          deadline_time: '17:00',
          status: 'COMPLETED',
          assigned_to: [1, 2],
          assigned_to_names: ['Ramesh Kumar', 'Suresh Patel'],
          created_at: '2026-01-01T10:30:00Z',
          start_date: '2026-01-01T11:00:00Z',
          completed_date: '2026-01-03T16:00:00Z',
          cancelled: false,
          cancelled_reason: null
        },
        {
          id: 102,
          request_id: 2,
          request_number: 'SR-20260115-006',
          task_name: 'Replace Battery',
          description: 'Replace the faulty battery with a new one',
          deadline: '2026-01-18T17:00:00',
          deadline_date: '2026-01-18',
          deadline_time: '17:00',
          status: 'IN_PROGRESS',
          assigned_to: [3],
          assigned_to_names: ['Mahesh Singh'],
          created_at: '2026-01-15T16:00:00Z',
          start_date: '2026-01-16T09:00:00Z',
          completed_date: null,
          cancelled: false,
          cancelled_reason: null
        },
        {
          id: 103,
          request_id: 3,
          request_number: 'SR-20260120-007',
          task_name: 'Fix GPS Issue',
          description: 'Diagnose and fix GPS signal loss problem',
          deadline: '2026-01-22T17:00:00',
          deadline_date: '2026-01-22',
          deadline_time: '17:00',
          status: 'COMPLETED',
          assigned_to: [4, 5],
          assigned_to_names: ['Dinesh Yadav', 'Prakash Reddy'],
          created_at: '2026-01-20T10:00:00Z',
          start_date: '2026-01-20T11:00:00Z',
          completed_date: '2026-01-22T17:00:00Z',
          cancelled: false,
          cancelled_reason: null
        },
        {
          id: 104,
          request_id: 4,
          request_number: 'SR-20260125-008',
          task_name: 'Software Update',
          description: 'Update drone firmware and test responsiveness',
          deadline: '2026-01-27T17:00:00',
          deadline_date: '2026-01-27',
          deadline_time: '17:00',
          status: 'COMPLETED',
          assigned_to: [1],
          assigned_to_names: ['Ramesh Kumar'],
          created_at: '2026-01-25T11:00:00Z',
          start_date: '2026-01-25T12:00:00Z',
          completed_date: '2026-01-27T15:00:00Z',
          cancelled: false,
          cancelled_reason: null
        }
      ];
      setTasks(sampleTasks);
      localStorage.setItem('service_tasks', JSON.stringify(sampleTasks));
    }

    // Load employees
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      const sampleEmployees = [
        { id: 1, name: 'Ramesh Kumar', role: 'Service Technician', is_available: true, avatar: '🔧', tasks_completed: 15, rating: 4.8 },
        { id: 2, name: 'Suresh Patel', role: 'Senior Technician', is_available: true, avatar: '⚙️', tasks_completed: 25, rating: 4.9 },
        { id: 3, name: 'Mahesh Singh', role: 'Diagnostic Expert', is_available: false, avatar: '📱', tasks_completed: 8, rating: 4.6 },
        { id: 4, name: 'Dinesh Yadav', role: 'Service Engineer', is_available: true, avatar: '🔨', tasks_completed: 19, rating: 4.7 },
        { id: 5, name: 'Prakash Reddy', role: 'Support Specialist', is_available: true, avatar: '💬', tasks_completed: 16, rating: 4.8 }
      ];
      setEmployees(sampleEmployees);
      localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    }
  };

  // Save profile data
  const saveProfile = () => {
    localStorage.setItem('user_profile', JSON.stringify(editProfileData));
    setProfileData(editProfileData);
    setIsEditingProfile(false);
    toast.success('Profile updated successfully!');
  };

  // Handle profile photo change
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

  const saveRequests = (newRequests) => {
    localStorage.setItem('service_requests', JSON.stringify(newRequests));
    setRequests(newRequests);
  };

  const saveTasks = (newTasks) => {
    localStorage.setItem('service_tasks', JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  const saveEmployees = (newEmployees) => {
    localStorage.setItem('employees', JSON.stringify(newEmployees));
    setEmployees(newEmployees);
  };

  // Generate Customer ID in GOAG-XXX format
  const generateCustomerId = () => {
    const uniquePhones = new Set(requests.map(r => r.customerPhone));
    const uniqueCount = uniquePhones.size;

    const storedCustomerIds = localStorage.getItem('customer_ids');
    let existingIds = storedCustomerIds ? JSON.parse(storedCustomerIds) : [];

    let maxNum = 0;
    existingIds.forEach(id => {
      const num = parseInt(id.split('-')[1]);
      if (num > maxNum) maxNum = num;
    });

    if (uniqueCount > maxNum) maxNum = uniqueCount;

    const nextNum = maxNum + 1;
    const newId = `GOAG-${String(nextNum).padStart(3, '0')}`;

    existingIds.push(newId);
    localStorage.setItem('customer_ids', JSON.stringify(existingIds));

    return newId;
  };

  // Get customer ID for a phone number
  const getCustomerId = (phone) => {
    if (!phone) return 'GOAG-001';

    const storedMapping = localStorage.getItem('customer_phone_to_id');
    let mapping = storedMapping ? JSON.parse(storedMapping) : {};

    if (mapping[phone]) {
      return mapping[phone];
    }

    const newId = generateCustomerId();
    mapping[phone] = newId;
    localStorage.setItem('customer_phone_to_id', JSON.stringify(mapping));

    return newId;
  };

  // Get customer number from customer ID
  const getCustomerNumber = (phone) => {
    const customerId = getCustomerId(phone);
    return parseInt(customerId.split('-')[1]);
  };

  // Generate sequential service request number based on customer ID
  const generateRequestNumber = (customerPhone) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const customerNum = getCustomerNumber(customerPhone);
    const paddedSeq = String(customerNum).padStart(3, '0');

    return `SR-${year}${month}${day}-${paddedSeq}`;
  };

  // Handle New Service Request button click
  const handleNewServiceRequestClick = () => {
    setShowCustomerTypeModal(true);
  };

  // Handle Existing Customer selection
  const handleSelectExistingCustomer = (customer) => {
    setSelectedExistingCustomer(customer);
    setNewRequest({
      ...newRequest,
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      customerEmail: customer.customerEmail || '',
      customerAddress: customer.customerAddress || '',
      droneModel: customer.droneModel || '',
      issueType: customer.issueType || '',
      description: customer.description || ''
    });
    setShowCustomerSearch(false);
    setShowCustomerTypeModal(false);
    setShowRequestForm(true);
  };

  // Handle New Customer
  const handleNewCustomer = () => {
    setSelectedExistingCustomer(null);
    setNewRequest({
      customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
      droneModel: '', issueType: '', description: '', priority: 'NORMAL'
    });
    setShowCustomerTypeModal(false);
    setShowRequestForm(true);
  };

  // Get all customers from requests (unique)
  const getAllCustomers = () => {
    const customerMap = new Map();
    requests.forEach(req => {
      if (!customerMap.has(req.customerPhone)) {
        const customerId = getCustomerId(req.customerPhone);
        customerMap.set(req.customerPhone, {
          id: req.id,
          customerName: req.customerName,
          customerPhone: req.customerPhone,
          customerEmail: req.customerEmail || '',
          customerAddress: req.customerAddress || '',
          droneModel: req.droneModel,
          issueType: req.issueType,
          description: req.description,
          customerId: customerId,
          purchase_date: req.purchase_date || null,
          total_services: requests.filter(r => r.customerPhone === req.customerPhone).length,
          completed_services: requests.filter(r => r.customerPhone === req.customerPhone && r.status === 'COMPLETED').length,
          latest_request: requests.filter(r => r.customerPhone === req.customerPhone).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        });
      }
    });
    return Array.from(customerMap.values());
  };

  // Filter customers based on search term
  const getFilteredCustomers = () => {
    const allCustomers = getAllCustomers();
    return allCustomers.filter(customer =>
      customer.customerName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.customerPhone.includes(customerSearchTerm) ||
      (customer.customerEmail && customer.customerEmail.toLowerCase().includes(customerSearchTerm.toLowerCase())) ||
      (customer.customerId && customer.customerId.toLowerCase().includes(customerSearchTerm.toLowerCase()))
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Create new service request
  const handleCreateRequest = (e) => {
    e.preventDefault();

    const requestNumber = generateRequestNumber(newRequest.customerPhone);

    const newRequestObj = {
      id: Date.now(),
      request_number: requestNumber,
      ...newRequest,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      order_stage: 'CREATED',
      delivered_at: null,
      purchase_date: new Date().toISOString(),
      order_history: [{
        stage: 'CREATED',
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        message: 'Service request created'
      }]
    };

    const updatedRequests = [newRequestObj, ...requests];
    saveRequests(updatedRequests);
    setShowRequestForm(false);
    setNewRequest({ customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', droneModel: '', issueType: '', description: '', priority: 'NORMAL' });
    setSelectedExistingCustomer(null);

    if (newRequestObj.customerPhone) {
      getCustomerId(newRequestObj.customerPhone);
    }

    toast.success(`Service request ${newRequestObj.request_number} created successfully`);
  };

  // Edit Service Request
  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setEditRequestData({
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      customerEmail: request.customerEmail || '',
      customerAddress: request.customerAddress || '',
      droneModel: request.droneModel,
      issueType: request.issueType,
      description: request.description,
      priority: request.priority
    });
  };

  // Save Edited Service Request
  const handleSaveEditedRequest = (e) => {
    e.preventDefault();
    if (!editingRequest) return;

    const updatedRequests = requests.map(req =>
      req.id === editingRequest.id ? {
        ...req,
        customerName: editRequestData.customerName,
        customerPhone: editRequestData.customerPhone,
        customerEmail: editRequestData.customerEmail,
        customerAddress: editRequestData.customerAddress,
        droneModel: editRequestData.droneModel,
        issueType: editRequestData.issueType,
        description: editRequestData.description,
        priority: editRequestData.priority
      } : req
    );

    saveRequests(updatedRequests);
    toast.success('Service request updated successfully');
    setEditingRequest(null);
    setEditRequestData({
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

  // Create and assign task - changes request status to ASSIGNED
  const handleCreateAndAssignTask = (e) => {
    e.preventDefault();
    if (!selectedRequest) {
      toast.error('Please select a request first');
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
      request_id: selectedRequest.id,
      request_number: selectedRequest.request_number,
      task_name: newTask.taskName,
      description: newTask.description,
      deadline: deadlineDateTime,
      deadline_date: newTask.deadline,
      deadline_time: newTask.deadlineTime,
      status: 'ASSIGNED',
      assigned_to: newTask.assignedTo,
      assigned_to_names: selectedEmployees.map(e => e.name),
      created_at: new Date().toISOString(),
      start_date: null,
      completed_date: null,
      cancelled: false,
      cancelled_reason: null
    };

    const updatedTasks = [newTaskObj, ...tasks];
    saveTasks(updatedTasks);

    // Mark employees as busy
    const updatedEmployees = employees.map(emp =>
      newTask.assignedTo.includes(emp.id) ?
        { ...emp, is_available: false } :
        emp
    );
    saveEmployees(updatedEmployees);

    // Update request status to ASSIGNED and order stage
    const updatedRequests = requests.map(req =>
      req.id === selectedRequest.id ? {
        ...req,
        status: 'ASSIGNED',
        order_stage: 'ASSIGNED',
        order_history: [
          ...(req.order_history || []),
          {
            stage: 'ASSIGNED',
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
            message: `Task "${newTask.taskName}" assigned to ${selectedEmployees.map(e => e.name).join(', ')}`
          }
        ]
      } : req
    );
    saveRequests(updatedRequests);
    setSelectedRequest({ ...selectedRequest, status: 'ASSIGNED' });

    toast.success(`Task "${newTask.taskName}" assigned to ${selectedEmployees.map(e => e.name).join(', ')}. Request status changed to ASSIGNED`);
    setShowTaskForm(false);
    setNewTask({ taskName: '', description: '', deadline: '', deadlineTime: '17:00', assignedTo: [] });
  };

  // Update task status
  const updateTaskStatus = (taskId, status) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTasks = tasks.map(t =>
      t.id === taskId ? {
        ...t,
        status: status,
        completed_date: status === 'COMPLETED' ? new Date().toISOString() : t.completed_date
      } : t
    );
    saveTasks(updatedTasks);

    // Free up employees if task completed
    if (status === 'COMPLETED' && task?.assigned_to?.length > 0) {
      const updatedEmployees = employees.map(emp =>
        task.assigned_to.includes(emp.id) ?
          { ...emp, is_available: true, tasks_completed: (emp.tasks_completed || 0) + 1 } :
          emp
      );
      saveEmployees(updatedEmployees);

      // Update order stage to TASK_COMPLETED
      const updatedRequests = requests.map(req =>
        req.id === task.request_id ? {
          ...req,
          order_stage: 'TASK_COMPLETED',
          order_history: [
            ...(req.order_history || []),
            {
              stage: 'TASK_COMPLETED',
              date: new Date().toISOString(),
              time: new Date().toLocaleTimeString(),
              message: `Task "${task.task_name}" completed by ${task.assigned_to_names?.join(', ')}`
            }
          ]
        } : req
      );
      saveRequests(updatedRequests);
    }

    toast.success(`Task ${status}`);
  };

  // Edit task
  const handleEditTask = (task) => {
    setViewingTaskDetails(null);
    setEditingTask(task);
    setEditTaskData({
      taskName: task.task_name,
      description: task.description || '',
      deadline: task.deadline_date || '',
      deadlineTime: task.deadline_time || '17:00',
      assigned_to: [...task.assigned_to]
    });
  };

  // Save edited task
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

  // Cancel task
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

    // Free up assigned employees
    if (selectedTask.assigned_to && selectedTask.assigned_to.length > 0) {
      const updatedEmployees = employees.map(emp =>
        selectedTask.assigned_to.includes(emp.id) ?
          { ...emp, is_available: true } :
          emp
      );
      saveEmployees(updatedEmployees);
    }

    toast.success(`Task "${selectedTask.task_name}" cancelled`);
    setShowCancelConfirm(null);
    setSelectedTask(null);
    setCancelReason('');
  };

  // Update order stage
  const updateOrderStage = (requestId, newStage) => {
    const stageLabels = {
      'QUALITY_CHECK': 'Quality Check started',
      'READY_FOR_DELIVERY': 'Ready for delivery',
      'DELIVERED': 'Delivered successfully'
    };

    const updatedRequests = requests.map(req =>
      req.id === requestId ? {
        ...req,
        order_stage: newStage,
        status: newStage === 'DELIVERED' ? 'COMPLETED' : req.status,
        delivered_at: newStage === 'DELIVERED' ? new Date().toISOString() : req.delivered_at,
        order_history: [
          ...(req.order_history || []),
          {
            stage: newStage,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
            message: newStage === 'DELIVERED'
              ? `✅ Product delivered to ${req.customerName} on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
              : stageLabels[newStage] || `Stage updated to ${ORDER_STAGE_LABELS[newStage]}`
          }
        ]
      } : req
    );
    saveRequests(updatedRequests);
    toast.success(`Order stage updated to ${ORDER_STAGE_LABELS[newStage]}`);

    // Refresh selected request if viewing
    if (viewingOrderTracking && viewingOrderTracking.id === requestId) {
      const updatedReq = updatedRequests.find(r => r.id === requestId);
      setViewingOrderTracking(updatedReq);
    }
  };

  // Get tasks for a request
  const getRequestTasks = (requestId) => tasks.filter(t => t.request_id === requestId && !t.cancelled);

  const getAvailableEmployees = () => employees.filter(emp => emp.is_available === true);

  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': { bg: '#FEF3C7', color: '#D97706', icon: '⏳', label: 'Pending', borderColor: '#F59E0B' },
      'ASSIGNED': { bg: '#E0E7FF', color: '#4338CA', icon: '👥', label: 'Assigned', borderColor: '#6366F1' },
      'IN_PROGRESS': { bg: '#DBEAFE', color: '#2563EB', icon: '🔧', label: 'In Progress', borderColor: '#3B82F6' },
      'COMPLETED': { bg: '#D1FAE5', color: '#059669', icon: '✅', label: 'Completed', borderColor: '#10B981' },
      'CANCELLED': { bg: '#FEE2E2', color: '#DC2626', icon: '❌', label: 'Cancelled', borderColor: '#EF4444' }
    };
    return styles[status] || styles.PENDING;
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
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Parts/Components Management Functions
  const handlePartsClick = (request) => {
    setShowPartsModal(request);
  };

  // Calculate average completion time
  const calculateAvgCompletionTime = () => {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED' && t.start_date && t.completed_date);
    if (completedTasks.length === 0) return 0;
    const totalTime = completedTasks.reduce((sum, task) => {
      const start = new Date(task.start_date);
      const end = new Date(task.completed_date);
      const hours = (end - start) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    return Math.round(totalTime / completedTasks.length);
  };

  const resetEmployees = () => {
    const resetEmployeesList = employees.map(emp => ({
      ...emp,
      is_available: true
    }));
    saveEmployees(resetEmployeesList);
    toast.success('✅ All employees are now available!');
  };

  // Dashboard stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    assigned: requests.filter(r => r.status === 'ASSIGNED').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    delivered: requests.filter(r => r.order_stage === 'DELIVERED').length,
    availableEmployees: employees.filter(e => e.is_available).length,
    totalEmployees: employees.length,
    pendingTasks: tasks.filter(t => t.status !== 'COMPLETED' && !t.cancelled).length,
    avgCompletionTime: calculateAvgCompletionTime(),
    totalCustomers: getAllCustomers().length
  };

  const filteredRequests = filterStatus === 'ALL'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  // Reports & Analytics helper functions
  const getYears = () => {
    return [...new Set(requests.map(r => new Date(r.created_at).getFullYear()))].sort();
  };

  const getByMonth = (year) => {
    return Array(12).fill(0).map((_, i) => {
      const m = requests.filter(r => {
        const d = new Date(r.created_at);
        return d.getFullYear() === year && d.getMonth() === i;
      });
      return {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        received: m.length,
        completed: m.filter(r => r.status === 'COMPLETED').length,
        delivered: m.filter(r => r.order_stage === 'DELIVERED').length,
        pending: m.filter(r => r.status === 'PENDING').length,
      };
    });
  };

  const getByYear = () => {
    const years = getYears();
    return years.map(y => {
      const yr = requests.filter(r => new Date(r.created_at).getFullYear() === y);
      const done = yr.filter(r => r.status === 'COMPLETED').length;
      return {
        year: y,
        received: yr.length,
        completed: done,
        delivered: yr.filter(r => r.order_stage === 'DELIVERED').length,
        rate: yr.length > 0 ? Math.round(done / yr.length * 100) : 0
      };
    });
  };

  const getCustom = () => {
    return requests.filter(r => {
      const d = new Date(r.created_at);
      return d >= new Date(customFrom) && d <= new Date(customTo + 'T23:59:59');
    });
  };

  const filteredRequestsList = filteredRequests.filter(r =>
    r.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart color palette
  const CHART_COLORS = ['#065F46', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#DC2626', '#6366F1'];

  // Drone model breakdown for charts
  const getDroneModelStats = () => {
    const modelMap = {};
    requests.forEach(r => {
      const model = r.droneModel || 'Unknown';
      if (!modelMap[model]) modelMap[model] = { name: model, requests: 0, completed: 0 };
      modelMap[model].requests += 1;
      if (r.status === 'COMPLETED') modelMap[model].completed += 1;
    });
    return Object.values(modelMap).map(m => ({
      ...m,
      shortName: m.name.length > 18 ? m.name.substring(0, 16) + '…' : m.name
    })).sort((a, b) => b.requests - a.requests);
  };

  // Issue type breakdown for charts
  const getIssueTypeStats = () => {
    const issueMap = {};
    requests.forEach(r => {
      const issue = r.issueType || 'Other';
      issueMap[issue] = (issueMap[issue] || 0) + 1;
    });
    return Object.entries(issueMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Priority distribution for pie chart
  const getPriorityChartData = () => {
    return [
      { name: 'Urgent', value: requests.filter(r => r.priority === 'URGENT').length, color: '#DC2626' },
      { name: 'High', value: requests.filter(r => r.priority === 'HIGH').length, color: '#F59E0B' },
      { name: 'Normal', value: requests.filter(r => r.priority === 'NORMAL').length, color: '#3B82F6' },
      { name: 'Low', value: requests.filter(r => r.priority === 'LOW').length, color: '#10B981' }
    ].filter(p => p.value > 0);
  };

  // Status distribution for pie chart
  const getStatusChartData = () => {
    return [
      { name: 'Pending', value: stats.pending, color: '#F59E0B' },
      { name: 'Assigned', value: stats.assigned, color: '#6366F1' },
      { name: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
      { name: 'Delivered', value: stats.delivered, color: '#10B981' }
    ].filter(s => s.value > 0);
  };

  // Custom tooltip for charts
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        {label && <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{label}</div>}
        {payload.map((p, idx) => (
          <div key={idx} style={{ fontSize: '12px', color: p.color || p.fill, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || p.fill, display: 'inline-block' }} />
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  };

  // Check if an employee has any active tasks (assigned or in progress)
  const hasActiveTasks = (employeeId) => {
    return tasks.some(t =>
      t.assigned_to.includes(employeeId) &&
      (t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS')
    );
  };

  // Customer Detail View Component
  const CustomerDetailView = ({ customer, onClose }) => {
    const customerRequests = requests.filter(r => r.customerPhone === customer.customerPhone);
    const customerTasks = tasks.filter(t => customerRequests.some(r => r.id === t.request_id));

    return (
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
        zIndex: 2000,
        padding: '16px'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '85vh',
          overflow: 'auto',
          padding: '24px',
          animation: 'slideUp 0.3s ease'
        }}>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#065F46' }}>
                Customer Details
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                {customer.customerId} - {customer.customerName}
              </p>
            </div>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
          </div>

          {/* Customer Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#F0FDF4', padding: '14px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Customer ID</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#065F46' }}>{customer.customerId}</div>
            </div>
            <div style={{ background: '#EFF6FF', padding: '14px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Total Services</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#3B82F6' }}>{customer.total_services}</div>
            </div>
            <div style={{ background: '#D1FAE5', padding: '14px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Completed Services</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{customer.completed_services}</div>
            </div>
            <div style={{ background: '#FEF3C7', padding: '14px', borderRadius: '12px', border: '1px solid #FCD34D' }}>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>Purchase Date</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>{formatDate(customer.purchase_date)}</div>
            </div>
          </div>
          {/* Customer Details */}
          <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Phone</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{customer.customerPhone}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Email</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{customer.customerEmail || 'Not provided'}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Address</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{customer.customerAddress || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Service History */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#065F46" /> Service History
          </h4>

          {customerRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
              <p>No service requests for this customer</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Service ID</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Drone Model</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Issue</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customerRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(req => {
                    const statusStyle = getStatusStyle(req.status);
                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 12px', fontWeight: '500', color: '#065F46' }}>{req.request_number}</td>
                        <td style={{ padding: '10px 12px' }}>{req.droneModel}</td>
                        <td style={{ padding: '10px 12px' }}>{req.issueType}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 10px', borderRadius: '20px', fontSize: '10px' }}>
                            {statusStyle.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>
                          {formatDate(req.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            <button onClick={onClose} style={{ padding: '10px 32px', background: '#065F46', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '500' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)', color: 'white', padding: '16px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={LOGO} alt="GOAG" style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', padding: '4px' }} />
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>GOAG DRONES ERP</h1>
                <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.85 }}>After Sales Service Center</p>
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
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{profileData.designation || 'After Sales Department'}</div>
              </div>
              <button onClick={onLogout} style={{ background: '#DC2626', border: 'none', padding: '6px 20px', borderRadius: '30px', color: 'white', fontWeight: '500', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: '#FFFFFF', padding: '0 24px', gap: '4px', borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap', overflowX: 'auto' }}>
          <button onClick={() => { setActiveTab('dashboard'); }} style={{ padding: '12px 20px', background: 'none', border: 'none', color: activeTab === 'dashboard' ? '#065F46' : '#6B7280', borderBottom: activeTab === 'dashboard' ? '2px solid #065F46' : 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} /> Dashboard
          </button>
          <button onClick={() => { setActiveTab('requests'); }} style={{ padding: '12px 20px', background: 'none', border: 'none', color: activeTab === 'requests' ? '#065F46' : '#6B7280', borderBottom: activeTab === 'requests' ? '2px solid #065F46' : 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={16} /> Service Requests
          </button>
          <button onClick={() => { setActiveTab('serviceTracking'); }} style={{ padding: '12px 20px', background: 'none', border: 'none', color: activeTab === 'serviceTracking' ? '#065F46' : '#6B7280', borderBottom: activeTab === 'serviceTracking' ? '2px solid #065F46' : 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} /> Service Tracking
          </button>
          <button onClick={() => { setActiveTab('reports'); }} style={{ padding: '12px 20px', background: 'none', border: 'none', color: activeTab === 'reports' ? '#065F46' : '#6B7280', borderBottom: activeTab === 'reports' ? '2px solid #065F46' : 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart size={16} /> Reports & Analytics
          </button>
          <button onClick={() => { setActiveTab('employees'); }} style={{ padding: '12px 20px', background: 'none', border: 'none', color: activeTab === 'employees' ? '#065F46' : '#6B7280', borderBottom: activeTab === 'employees' ? '2px solid #065F46' : 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} /> Employees Team
          </button>
          <button onClick={() => { setActiveTab('customers'); }} style={{ padding: '12px 20px', background: 'none', border: 'none', color: activeTab === 'customers' ? '#065F46' : '#6B7280', borderBottom: activeTab === 'customers' ? '2px solid #065F46' : 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} /> Customers
            <span style={{ background: '#065F46', color: 'white', padding: '1px 8px', borderRadius: '12px', fontSize: '10px' }}>{stats.totalCustomers}</span>
          </button>
          <button onClick={() => { setActiveTab('completed'); }} style={{ padding: '12px 20px', background: 'none', border: 'none', color: activeTab === 'completed' ? '#065F46' : '#6B7280', borderBottom: activeTab === 'completed' ? '2px solid #065F46' : 'none', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> Delivered Orders
          </button>
          <button onClick={handleNewServiceRequestClick} style={{ marginLeft: 'auto', background: '#065F46', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>+ New Service Request</button>
        </div>

        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
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
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>{stats.delivered}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Delivered</div>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Recent Service Requests</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Service ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Drone Model</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Issue</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.slice(0, 5).map(req => {
                        const statusStyle = getStatusStyle(req.status);
                        return (
                          <tr key={req.id} style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }} onClick={() => { setSelectedRequest(req); setActiveTab('requests'); }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{req.request_number}</td>
                            <td style={{ padding: '12px' }}>{req.customerName}</td>
                            <td style={{ padding: '12px' }}>{req.droneModel}</td>
                            <td style={{ padding: '12px' }}>{req.issueType}</td>
                            <td style={{ padding: '12px' }}><span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px' }}>{statusStyle.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* SERVICE REQUESTS TAB */}
          {activeTab === 'requests' && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => setFilterStatus('ALL')} style={{ padding: '6px 16px', borderRadius: '30px', border: 'none', background: filterStatus === 'ALL' ? '#065F46' : '#F1F5F9', color: filterStatus === 'ALL' ? 'white' : '#475569', fontSize: '12px', cursor: 'pointer' }}>All</button>
                  <button onClick={() => setFilterStatus('PENDING')} style={{ padding: '6px 16px', borderRadius: '30px', border: 'none', background: filterStatus === 'PENDING' ? '#F59E0B' : '#F1F5F9', color: filterStatus === 'PENDING' ? 'white' : '#475569', fontSize: '12px', cursor: 'pointer' }}>Pending</button>
                  <button onClick={() => setFilterStatus('ASSIGNED')} style={{ padding: '6px 16px', borderRadius: '30px', border: 'none', background: filterStatus === 'ASSIGNED' ? '#6366F1' : '#F1F5F9', color: filterStatus === 'ASSIGNED' ? 'white' : '#475569', fontSize: '12px', cursor: 'pointer' }}>Assigned</button>
                  <button onClick={() => setFilterStatus('IN_PROGRESS')} style={{ padding: '6px 16px', borderRadius: '30px', border: 'none', background: filterStatus === 'IN_PROGRESS' ? '#3B82F6' : '#F1F5F9', color: filterStatus === 'IN_PROGRESS' ? 'white' : '#475569', fontSize: '12px', cursor: 'pointer' }}>In Progress</button>
                  <button onClick={() => setFilterStatus('COMPLETED')} style={{ padding: '6px 16px', borderRadius: '30px', border: 'none', background: filterStatus === 'COMPLETED' ? '#10B981' : '#F1F5F9', color: filterStatus === 'COMPLETED' ? 'white' : '#475569', fontSize: '12px', cursor: 'pointer' }}>Completed</button>
                </div>
                <div style={{ flex: 1, position: 'relative', maxWidth: '280px', marginLeft: 'auto' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input type="text" placeholder="Search by Service ID or Customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #E5E7EB', borderRadius: '30px', fontSize: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredRequestsList.map(req => {
                  const statusStyle = getStatusStyle(req.status);
                  const priorityStyle = getPriorityStyle(req.priority);
                  const requestTasks = getRequestTasks(req.id);
                  const hasTasks = requestTasks.length > 0;
                  const customerId = getCustomerId(req.customerPhone);
                  const isDelivered = req.order_stage === 'DELIVERED';

                  return (
                    <div key={req.id} style={{ background: '#FFFFFF', borderRadius: '16px', border: `1px solid ${isDelivered ? '#10B981' : statusStyle.borderColor}`, padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{req.request_number}</span>
                            <span style={{ background: '#E8F5E9', color: '#065F46', padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }}>{customerId}</span>
                            <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '30px', fontSize: '10px' }}>{statusStyle.icon} {statusStyle.label}</span>
                            {isDelivered && <span style={{ background: '#10B981', color: 'white', padding: '4px 12px', borderRadius: '30px', fontSize: '10px', fontWeight: '600' }}>🚚 Delivered</span>}
                            <span style={{ background: priorityStyle.bg, color: priorityStyle.color, padding: '4px 12px', borderRadius: '30px', fontSize: '10px' }}>{priorityStyle.icon} {priorityStyle.label}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>👤 {req.customerName} | 📞 {req.customerPhone}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Created: {formatDate(req.created_at)}</div>
                          {isDelivered && req.delivered_at && (
                            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: '600' }}>Delivered: {formatDate(req.delivered_at)}</div>
                          )}
                        </div>
                      </div>

                      <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
                        <div><strong>Product:</strong> {req.droneModel}</div>
                        <div><strong>Issue:</strong> {req.issueType}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{req.description}</div>
                      </div>

                      <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleEditRequest(req); }} style={{ background: '#3B82F6', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Edit2 size={12} /> Edit
                        </button>

                        {hasTasks ? (
                          <button onClick={(e) => { e.stopPropagation(); setViewingTaskDetails(requestTasks[0]); }} style={{ background: '#10B981', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} /> View Task
                          </button>
                        ) : (
                          req.status !== 'COMPLETED' && req.status !== 'CANCELLED' && (
                            <button onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); setShowTaskForm(true); }} style={{ background: '#065F46', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px' }}>
                              <Plus size={12} style={{ display: 'inline', marginRight: '4px' }} /> Assign Task
                            </button>
                          )
                        )}

                        <button onClick={(e) => { e.stopPropagation(); setViewingOrderTracking(req); }} style={{ background: '#8B5CF6', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Truck size={12} /> Track Order
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); handlePartsClick(req); }} style={{ background: '#F59E0B', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wrench size={12} /> Parts
                          {partsData[req.id] && partsData[req.id].length > 0 && (
                            <span style={{ background: 'white', color: '#F59E0B', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                              {partsData[req.id].length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* SERVICE TRACKING TAB */}
          {activeTab === 'serviceTracking' && (
            <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Service Request Tracking</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Service ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Customer ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Customer Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Order Stage</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Created Date</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Parts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => {
                      const customerId = getCustomerId(req.customerPhone);
                      const stageStyle = getOrderStageStyle(req.order_stage || 'CREATED');
                      const stageLabel = ORDER_STAGE_LABELS[req.order_stage] || 'Created';
                      const hasParts = partsData[req.id] && partsData[req.id].length > 0;
                      return (
                        <tr key={req.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{req.request_number}</td>
                          <td style={{ padding: '12px', fontWeight: '600', color: '#065F46' }}>{customerId}</td>
                          <td style={{ padding: '12px' }}>{req.customerName}</td>
                          <td style={{ padding: '12px' }}><span style={{ background: stageStyle.bg, color: stageStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>{stageLabel}</span></td>
                          <td style={{ padding: '12px' }}>
                            {formatDate(req.created_at)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePartsClick(req); }}
                              style={{
                                background: hasParts ? '#10B981' : '#F3F4F6',
                                color: hasParts ? 'white' : '#6B7280',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                              }}
                              title="Click to view repair parts added by employees"
                            >
                              <Wrench size={14} />
                              {hasParts && <span style={{ fontSize: '10px', fontWeight: '600' }}>{partsData[req.id].length}</span>}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS & ANALYTICS TAB */}
          {activeTab === 'reports' && (
            <div>
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
                  📊 Monthly
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

              {/* MONTHLY VIEW */}
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
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Select Year:</label>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(Number(e.target.value))}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        fontSize: '13px',
                        background: '#F9FAFB',
                        fontWeight: '500'
                      }}
                    >
                      {getYears().map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  {(() => {
                    const monthData = getByMonth(selectedYear);
                    const totalReceived = monthData.reduce((s, m) => s + m.received, 0);
                    const totalCompleted = monthData.reduce((s, m) => s + m.completed, 0);
                    const totalDelivered = monthData.reduce((s, m) => s + m.delivered, 0);
                    const totalPending = monthData.reduce((s, m) => s + m.pending, 0);

                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Total Requests</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{totalReceived}</div>
                            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '6px' }}>In {selectedYear}</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Completed</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{totalCompleted}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>{totalReceived > 0 ? Math.round(totalCompleted / totalReceived * 100) : 0}% Rate</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Delivered</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{totalDelivered}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>To Customers</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Pending</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{totalPending}</div>
                            <div style={{ fontSize: '12px', color: '#D97706', marginTop: '6px' }}>Awaiting Action</div>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📊 Requests per Month — {selectedYear}</h3>
                            <span style={{ fontSize: '12px', color: '#6B7280' }}>Received vs Completed</span>
                          </div>
                          <div style={{ padding: '16px 12px' }}>
                            <ResponsiveContainer width="100%" height={280}>
                              <ReBarChart data={monthData.filter(m => m.received > 0)} margin={{ top: 5, right: 30, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280', fontWeight: '500' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip content={ChartTooltip} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="received" name="Received" fill="#065F46" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                              </ReBarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📋 Monthly Breakdown</h3>
                          </div>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                  {['Month', 'Received', 'Completed', 'Delivered', 'Rate', 'Pending'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {monthData.map(m => (
                                  <tr key={m.month} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1F2937' }}>{m.month}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{m.received}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                      {m.completed > 0 ? (
                                        <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{m.completed}</span>
                                      ) : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                      {m.delivered > 0 ? (
                                        <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{m.delivered}</span>
                                      ) : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                      {m.received > 0 ? (
                                        <span style={{
                                          background: m.completed / m.received >= 0.7 ? '#D1FAE5' : m.completed / m.received >= 0.4 ? '#DBEAFE' : '#FEF3C7',
                                          color: m.completed / m.received >= 0.7 ? '#065F46' : m.completed / m.received >= 0.4 ? '#1E40AF' : '#92400E',
                                          padding: '4px 12px',
                                          borderRadius: '20px',
                                          fontSize: '11px',
                                          fontWeight: '600'
                                        }}>
                                          {Math.round(m.completed / m.received * 100)}%
                                        </span>
                                      ) : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                      {m.pending > 0 ? (
                                        <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{m.pending}</span>
                                      ) : '0'}
                                    </td>
                                  </tr>
                                ))}
                                {monthData.every(m => m.received === 0) && (
                                  <tr><td colSpan={6} style={{ padding: '30px 16px', color: '#9CA3AF', textAlign: 'center' }}>No data for {selectedYear}</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* YEARLY VIEW */}
              {reportView === 'yearly' && (
                <div>
                  {(() => {
                    const yearData = getByYear();
                    const totalAll = requests.length;
                    const totalCompleted = requests.filter(r => r.status === 'COMPLETED').length;
                    const bestYear = yearData.reduce((a, y) => a.rate > y.rate ? a : y, yearData[0] || {});

                    return (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Total All-Time</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{totalAll}</div>
                            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '6px' }}>All Years</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Total Completed</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{totalCompleted}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>{totalAll > 0 ? Math.round(totalCompleted / totalAll * 100) : 0}% Overall</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Best Year</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{bestYear?.year || '—'}</div>
                            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '6px' }}>{bestYear?.rate || 0}% Rate</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Years Tracked</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{getYears().length}</div>
                            <div style={{ fontSize: '12px', color: '#8B5CF6', marginTop: '6px' }}>In System</div>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📈 Year-on-Year Comparison</h3>
                            <span style={{ fontSize: '12px', color: '#6B7280' }}>Received vs Completed</span>
                          </div>
                          <div style={{ padding: '16px 12px' }}>
                            <ResponsiveContainer width="100%" height={260}>
                              <ReBarChart data={yearData} margin={{ top: 5, right: 30, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6B7280', fontWeight: '600' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip content={ChartTooltip} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="received" name="Received" fill="#065F46" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                              </ReBarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>🔍 Issue Type Breakdown</h3>
                            </div>
                            <div style={{ padding: '12px' }}>
                              <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                  <Pie data={getIssueTypeStats().map(({ name, value }) => ({ name, value }))} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {getIssueTypeStats().map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} stroke="#fff" strokeWidth={2} />)}
                                  </Pie>
                                  <Tooltip content={ChartTooltip} />
                                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>🛸 Drone Model Requests</h3>
                            </div>
                            <div style={{ padding: '12px' }}>
                              <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                  <Pie data={getDroneModelStats().map(({ shortName, requests }) => ({ name: shortName, value: requests, fullName: shortName }))} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {getDroneModelStats().map((_, idx) => <Cell key={idx} fill={CHART_COLORS[(idx + 2) % CHART_COLORS.length]} stroke="#fff" strokeWidth={2} />)}
                                  </Pie>
                                  <Tooltip content={({ active, payload }) => {
                                    if (!active || !payload || !payload.length) return null;
                                    const data = payload[0].payload;
                                    return (
                                      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{data.fullName || data.name}</div>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>Requests: <strong>{data.value}</strong></div>
                                      </div>
                                    );
                                  }} />
                                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📋 Year Summary</h3>
                          </div>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                              <thead>
                                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                  {['Year', 'Received', 'Completed', 'Delivered', 'Rate'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {yearData.map(y => (
                                  <tr key={y.year} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '700', color: '#065F46' }}>{y.year}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{y.received}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                      <span style={{ background: '#D1FAE5', color: '#065F46', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{y.completed}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                      <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{y.delivered}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                      <span style={{
                                        background: y.rate >= 70 ? '#D1FAE5' : y.rate >= 40 ? '#DBEAFE' : '#FEF3C7',
                                        color: y.rate >= 70 ? '#065F46' : y.rate >= 40 ? '#1E40AF' : '#92400E',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                      }}>
                                        {y.rate}%
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* CUSTOM RANGE VIEW */}
              {reportView === 'custom' && (
                <div>
                  {(() => {
                    const customData = getCustom();
                    const customDone = customData.filter(r => r.status === 'COMPLETED').length;

                    return (
                      <>
                        <div style={{
                          background: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #E5E7EB',
                          padding: '16px 20px',
                          marginBottom: '20px',
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>📅 From:</label>
                            <input
                              type="date"
                              value={customFrom}
                              onChange={e => setCustomFrom(e.target.value)}
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
                              onChange={e => setCustomTo(e.target.value)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '13px',
                                background: '#F9FAFB'
                              }}
                            />
                          </div>
                          <span style={{
                            marginLeft: 'auto',
                            background: '#F0FDF4',
                            color: '#065F46',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            Found: {customData.length} requests
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Total Requests</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{customData.length}</div>
                            <div style={{ fontSize: '12px', color: '#065F46', marginTop: '6px' }}>{customFrom} – {customTo}</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Completed</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{customDone}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>{customData.length > 0 ? Math.round(customDone / customData.length * 100) : 0}% Rate</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Delivered</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{customData.filter(r => r.order_stage === 'DELIVERED').length}</div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '6px' }}>In Range</div>
                          </div>
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '18px 20px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '6px' }}>Pending</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{customData.filter(r => r.status === 'PENDING').length}</div>
                            <div style={{ fontSize: '12px', color: '#D97706', marginTop: '6px' }}>Still Open</div>
                          </div>
                        </div>

                        {customData.length > 0 && (
                          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📊 Requests by Month</h3>
                              <span style={{ fontSize: '12px', color: '#6B7280' }}>{customFrom} → {customTo}</span>
                            </div>
                            <div style={{ padding: '16px 12px' }}>
                              {(() => {
                                const byMonth = {};
                                customData.forEach(r => {
                                  const d = new Date(r.created_at);
                                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                                  const label = `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`;
                                  if (!byMonth[key]) byMonth[key] = { label, received: 0, completed: 0 };
                                  byMonth[key].received++;
                                  if (r.status === 'COMPLETED') byMonth[key].completed++;
                                });
                                const chartData = Object.values(byMonth).sort((a, b) => a.label.localeCompare(b.label));
                                return (
                                  <ResponsiveContainer width="100%" height={260}>
                                    <ReBarChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 0 }}>
                                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                      <Tooltip content={ChartTooltip} />
                                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                                      <Bar dataKey="received" name="Received" fill="#065F46" radius={[4, 4, 0, 0]} barSize={24} />
                                      <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                                    </ReBarChart>
                                  </ResponsiveContainer>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>📋 All Requests in Range</h3>
                          </div>
                          {customData.length === 0 ? (
                            <p style={{ padding: '40px 20px', color: '#9CA3AF', textAlign: 'center' }}>No requests found for this date range.</p>
                          ) : (
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                    {['Date', 'Service ID', 'Customer', 'Issue', 'Priority', 'Status'].map(h => (
                                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {customData.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(r => {
                                    const p = getPriorityStyle(r.priority);
                                    const s = getStatusStyle(r.status);
                                    return (
                                      <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '12px 16px' }}>{formatDate(r.created_at)}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#065F46' }}>{r.request_number}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{r.customerName}</td>
                                        <td style={{ padding: '12px 16px' }}>{r.issueType}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                          <span style={{ background: p.bg, color: p.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                            {p.icon} {p.label}
                                          </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                          <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                                            {s.icon} {s.label}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          {/* EMPLOYEES TEAM TAB */}
          {activeTab === 'employees' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Employees</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#D1FAE5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>Available: {getAvailableEmployees().length}</span>
                  <span style={{ background: '#FEE2E2', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>Busy: {stats.totalEmployees - getAvailableEmployees().length}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {employees.map(emp => {
                  const hasActiveTask = hasActiveTasks(emp.id);
                  const isAvailable = !hasActiveTask;

                  return (
                    <div key={emp.id} style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: isAvailable ? '2px solid #10B981' : '2px solid #EF4444',
                      padding: '16px',
                      opacity: isAvailable ? 1 : 0.85
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: isAvailable ? '#D1FAE5' : '#FEE2E2',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          {emp.avatar || '👨‍🔧'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{emp.name}</div>
                          <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                              background: isAvailable ? '#10B981' : '#EF4444',
                              color: 'white',
                              padding: '2px 12px',
                              borderRadius: '30px',
                              fontSize: '10px'
                            }}>
                              {isAvailable ? 'Available' : 'Busy'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#6B7280' }}>✅ {emp.tasks_completed || 0} tasks done</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#065F46' }}>{emp.tasks_completed || 0}</div>
                          <div style={{ fontSize: '10px', color: '#6B7280' }}>Tasks Done</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#065F46' }}>
                  👥 Customers
                  <span style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280', marginLeft: '12px' }}>
                    {stats.totalCustomers} total customers
                  </span>
                </h2>
              </div>

              <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search by Name, Phone, Email or Customer ID..."
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }}
                />
              </div>

              {getFilteredCustomers().length === 0 ? (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
                  <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#374151' }}>No Customers Found</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>Try adjusting your search criteria</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                  {getFilteredCustomers().map(customer => {
                    const customerRequests = requests.filter(r => r.customerPhone === customer.customerPhone);
                    const latestRequest = customerRequests.length > 0 ? customerRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] : null;

                    return (
                      <div
                        key={customer.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '16px',
                          border: '1px solid #E5E7EB',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#065F46'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px' }}>👤</span>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '16px', color: '#1F2937' }}>{customer.customerName}</div>
                                <span style={{ background: '#E8F5E9', color: '#065F46', padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }}>{customer.customerId}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>Total Services</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#065F46' }}>{customer.total_services}</div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: '#6B7280' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '10px', color: '#9CA3AF' }}>Phone</span>
                            {customer.customerPhone}
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '10px', color: '#9CA3AF' }}>Latest Service</span>
                            {latestRequest ? (
                              <span>{latestRequest.request_number} - {formatDate(latestRequest.created_at)}</span>
                            ) : (
                              <span style={{ color: '#9CA3AF' }}>No services yet</span>
                            )}
                          </div>
                          {customer.purchase_date && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span style={{ display: 'block', fontSize: '10px', color: '#9CA3AF' }}>Drone Purchase Date</span>
                              <span style={{ fontWeight: '500', color: '#1F2937' }}>{formatDate(customer.purchase_date)}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ fontSize: '12px', color: '#065F46', fontWeight: '500' }}>Click to view details →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* COMPLETED TAB - ONLY DELIVERED ORDERS */}
          {activeTab === 'completed' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#065F46' }}>
                  🚚 Delivered Orders
                </h2>
                <span style={{ background: '#D1FAE5', color: '#059669', padding: '4px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                  {stats.delivered} Delivered
                </span>
              </div>

              {requests.filter(r => r.order_stage === 'DELIVERED').length === 0 ? (
                <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
                  <Truck size={48} style={{ margin: '0 auto 16px', color: '#D1FAE5' }} />
                  <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#374151' }}>No Delivered Orders</h3>
                  <p style={{ margin: 0, fontSize: '14px' }}>Orders that have been delivered to customers will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {requests.filter(r => r.order_stage === 'DELIVERED').map(req => {
                    const statusStyle = getStatusStyle(req.status);
                    const priorityStyle = getPriorityStyle(req.priority);
                    const customerId = getCustomerId(req.customerPhone);
                    const deliveryDate = req.delivered_at || req.created_at;

                    return (
                      <div key={req.id} style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        border: '2px solid #10B981',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{req.request_number}</span>
                              <span style={{ background: '#E8F5E9', color: '#065F46', padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }}>{customerId}</span>
                              <span style={{ background: '#D1FAE5', color: '#059669', padding: '4px 12px', borderRadius: '30px', fontSize: '10px', fontWeight: '600' }}>
                                ✅ Delivered
                              </span>
                              <span style={{ background: priorityStyle.bg, color: priorityStyle.color, padding: '4px 12px', borderRadius: '30px', fontSize: '10px' }}>{priorityStyle.icon} {priorityStyle.label}</span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '6px' }}>
                              👤 {req.customerName} | 📞 {req.customerPhone}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                              🚚 Delivered: {formatDate(deliveryDate)}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                              Created: {formatDate(req.created_at)}
                            </div>
                          </div>
                        </div>

                        <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
                          <div><strong>Product:</strong> {req.droneModel}</div>
                          <div><strong>Issue:</strong> {req.issueType}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{req.description}</div>
                        </div>

                        {/* Delivery Confirmation Section */}
                        <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={16} color="#065F46" />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#065F46' }}>
                              Product successfully delivered to {req.customerName}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#047857', marginTop: '4px', marginLeft: '24px' }}>
                            Delivery Date: {formatDateTime(req.delivered_at)}
                          </div>
                        </div>

                        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button onClick={(e) => { e.stopPropagation(); setViewingOrderTracking(req); }} style={{ background: '#8B5CF6', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={12} /> View Order History
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handlePartsClick(req); }} style={{ background: '#F59E0B', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '30px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Wrench size={12} /> Parts Used
                            {partsData[req.id] && partsData[req.id].length > 0 && (
                              <span style={{ background: 'white', color: '#F59E0B', borderRadius: '50%', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>
                                {partsData[req.id].length}
                              </span>
                            )}
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
      {viewingTaskDetails && (
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
              <button onClick={() => { setViewingTaskDetails(null); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Task Information</div>
              <div style={{ background: '#F0FDF4', padding: '12px 16px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#065F46' }}>{viewingTaskDetails.task_name}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Service ID: {viewingTaskDetails.request_number}</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Description</div>
              <div style={{ background: '#F9FAFB', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: '#374151', border: '1px solid #E5E7EB', minHeight: '40px' }}>
                {viewingTaskDetails.description || 'No description provided'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Deadline</div>
              <div style={{ background: '#F9FAFB', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', color: '#374151', border: '1px solid #E5E7EB' }}>
                {viewingTaskDetails.deadline ? formatDateTime(viewingTaskDetails.deadline) : 'Not set'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Status</div>
              <div>
                <span style={{ background: getStatusStyle(viewingTaskDetails.status).bg, color: getStatusStyle(viewingTaskDetails.status).color, padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                  {getStatusStyle(viewingTaskDetails.status).icon} {getStatusStyle(viewingTaskDetails.status).label}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', marginBottom: '4px' }}>Assigned To</div>
              <div style={{ background: '#F9FAFB', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', color: '#374151', border: '1px solid #E5E7EB' }}>
                {viewingTaskDetails.assigned_to_names?.join(', ') || 'Not assigned'}
              </div>
            </div>

            {/* Action Buttons - Start Task REMOVED */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #E5E7EB', paddingTop: '16px', flexWrap: 'wrap' }}>
              {/* Complete Task Button - shows when task is IN_PROGRESS */}
              {viewingTaskDetails.status === 'IN_PROGRESS' && (
                <button onClick={() => { updateTaskStatus(viewingTaskDetails.id, 'COMPLETED'); setViewingTaskDetails(null); }} style={{ flex: 1, minWidth: '100px', background: '#10B981', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> Complete Task
                </button>
              )}

              {/* Edit Task Button */}
              <button onClick={() => handleEditTask(viewingTaskDetails)} style={{ flex: 1, minWidth: '100px', background: '#3B82F6', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Edit2 size={16} /> Edit Task
              </button>

              {/* Cancel Task Button - shows when task is not completed */}
              {viewingTaskDetails.status !== 'COMPLETED' && viewingTaskDetails.status !== 'CANCELLED' && (
                <button onClick={() => { setSelectedTask(viewingTaskDetails); setShowCancelConfirm(true); setViewingTaskDetails(null); }} style={{ flex: 1, minWidth: '100px', background: '#EF4444', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <X size={16} /> Cancel
                </button>
              )}

              {/* Close Button - show when task is COMPLETED or CANCELLED */}
              {(viewingTaskDetails.status === 'COMPLETED' || viewingTaskDetails.status === 'CANCELLED') && (
                <button onClick={() => { setViewingTaskDetails(null); }} style={{ flex: 1, minWidth: '100px', background: '#F3F4F6', border: '1px solid #D1D5DB', color: '#475569', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
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
              <div style={{ fontSize: '13px', color: '#065F46' }}><strong>Service ID:</strong> {editingTask.request_number}</div>
            </div>

            <form onSubmit={handleSaveEditedTask}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Task Name *</label>
                <input type="text" value={editTaskData.taskName} onChange={e => setEditTaskData({ ...editTaskData, taskName: e.target.value })} required style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Description</label>
                <textarea value={editTaskData.description} onChange={e => setEditTaskData({ ...editTaskData, description: e.target.value })} rows="3" style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', resize: 'vertical', outline: 'none', transition: 'border 0.2s', fontFamily: 'inherit' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Deadline Date</label>
                  <input type="date" value={editTaskData.deadline} onChange={e => setEditTaskData({ ...editTaskData, deadline: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Deadline Time</label>
                  <input type="time" value={editTaskData.deadlineTime} onChange={e => setEditTaskData({ ...editTaskData, deadlineTime: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#065F46'} onBlur={e => e.target.style.borderColor = '#D1D5DB'} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Assign to Team Members *</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #D1D5DB', borderRadius: '10px', padding: '8px', background: '#FAFAFA' }}>
                  {employees.map(emp => {
                    const isCurrentlyAssigned = editTaskData.assigned_to.includes(emp.id);
                    const hasActiveTask = tasks.some(t => t.assigned_to?.includes(emp.id) && t.id !== editingTask.id && t.status !== 'COMPLETED' && !t.cancelled);
                    const canSelect = !hasActiveTask || isCurrentlyAssigned;

                    return (
                      <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', cursor: canSelect ? 'pointer' : 'not-allowed', opacity: canSelect ? 1 : 0.5, background: isCurrentlyAssigned ? '#F0FDF4' : 'transparent', border: isCurrentlyAssigned ? '1px solid #A7F3D0' : '1px solid transparent', marginBottom: '4px', transition: 'all 0.2s' }}>
                        <input type="checkbox" checked={editTaskData.assigned_to.includes(emp.id)} onChange={e => { if (canSelect) { if (e.target.checked) { setEditTaskData({ ...editTaskData, assigned_to: [...editTaskData.assigned_to, emp.id] }); } else { setEditTaskData({ ...editTaskData, assigned_to: editTaskData.assigned_to.filter(id => id !== emp.id) }); } } }} style={{ width: '16px', height: '16px', cursor: canSelect ? 'pointer' : 'not-allowed' }} disabled={!canSelect} />
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

      {/* ====== ASSIGN TASK MODAL ====== */}
      {showTaskForm && selectedRequest && (
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
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Service Request</div>
              <div style={{ fontWeight: 'bold' }}>{selectedRequest.request_number} - {selectedRequest.customerName}</div>
              <div style={{ fontSize: '12px' }}>Issue: {selectedRequest.issueType}</div>
            </div>

            <form onSubmit={handleCreateAndAssignTask}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Task Name *</label>
                <input type="text" value={newTask.taskName} onChange={e => setNewTask({ ...newTask, taskName: e.target.value })} placeholder="e.g., Diagnose motor, Replace battery, Calibrate GPS" required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows="3" placeholder="Detailed task instructions..." style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Deadline Date</label>
                  <input type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Deadline Time</label>
                  <input type="time" value={newTask.deadlineTime} onChange={e => setNewTask({ ...newTask, deadlineTime: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} />
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
                        <input type="checkbox" checked={newTask.assignedTo.includes(emp.id)} onChange={e => { if (e.target.checked) setNewTask({ ...newTask, assignedTo: [...newTask.assignedTo, emp.id] }); else setNewTask({ ...newTask, assignedTo: newTask.assignedTo.filter(id => id !== emp.id) }); }} style={{ width: '16px', height: '16px' }} />
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

      {/* ====== ORDER TRACKING MODAL ====== */}
      {viewingOrderTracking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>Order Tracking</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>{viewingOrderTracking.request_number}</p>
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
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B7280' }}>Customer ID</p>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '600', color: '#065F46' }}>{getCustomerId(viewingOrderTracking.customerPhone)}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B7280' }}>Product</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '500', color: '#374151' }}>{viewingOrderTracking.droneModel}</p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '10px', color: '#6B7280' }}>Quantity</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', fontWeight: '600', color: '#065F46' }}>1 unit</p>
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
                    const currentStage = ORDER_STAGES.indexOf(viewingOrderTracking.order_stage || 'CREATED');
                    const isCompleted = idx <= currentStage;
                    const isCurrent = idx === currentStage;
                    const stageLabel = ORDER_STAGE_LABELS[stage];
                    return (
                      <div key={stage} style={{ textAlign: 'center', flex: 1, minWidth: '40px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          margin: '0 auto 4px',
                          borderRadius: '50%',
                          background: isCompleted ? '#065F46' : '#E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isCurrent ? '3px solid #F59E0B' : 'none',
                          transition: 'all 0.3s ease'
                        }}>
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
                    const currentIdx = ORDER_STAGES.indexOf(viewingOrderTracking.order_stage || 'CREATED');
                    const targetIdx = ORDER_STAGES.indexOf(stage);
                    const isDisabled = targetIdx <= currentIdx;
                    const stageLabel = ORDER_STAGE_LABELS[stage];
                    return (
                      <button
                        key={stage}
                        onClick={() => updateOrderStage(viewingOrderTracking.id, stage)}
                        disabled={isDisabled}
                        style={{
                          padding: '4px 12px',
                          background: isDisabled ? '#E5E7EB' : '#065F46',
                          color: isDisabled ? '#9CA3AF' : 'white',
                          border: 'none',
                          borderRadius: '20px',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}
                      >
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
                  {(viewingOrderTracking.order_history || []).map((item, idx) => (
                    <div key={idx} style={{ marginBottom: '16px', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-26px',
                        top: '2px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: idx === 0 ? '#065F46' : '#9CA3AF',
                        border: '2px solid white',
                        boxShadow: '0 0 0 2px #E5E7EB'
                      }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1F2937' }}>
                          {ORDER_STAGE_LABELS[item.stage] || item.stage}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6B7280' }}>
                          {formatDateTime(item.date)}
                        </p>
                        {item.message && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4B5563' }}>{item.message}</p>}
                      </div>
                    </div>
                  ))}
                  {(!viewingOrderTracking.order_history || viewingOrderTracking.order_history.length === 0) && (
                    <p style={{ color: '#9CA3AF', fontSize: '12px', padding: '10px 0' }}>No activity yet</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px 16px', background: '#F0FDF4', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: getOrderStageStyle(viewingOrderTracking.order_stage || 'CREATED').bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={20} color={getOrderStageStyle(viewingOrderTracking.order_stage || 'CREATED').color} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Current Status</p>
                  <p style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: '700', color: '#065F46' }}>
                    {ORDER_STAGE_LABELS[viewingOrderTracking.order_stage] || 'Created'}
                    {viewingOrderTracking.order_stage === 'DELIVERED' && ' ✅ (Completed)'}
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

      {/* CUSTOMER TYPE SELECTION MODAL */}
      {showCustomerTypeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '450px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#065F46' }}>Select Customer Type</h3>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={() => setShowCustomerSearch(true)} style={{ padding: '16px', background: '#065F46', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Users size={20} /> Existing Customer
              </button>
              <button onClick={handleNewCustomer} style={{ padding: '16px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <UserPlus size={20} /> New Customer
              </button>
              <button onClick={() => setShowCustomerTypeModal(false)} style={{ padding: '12px', background: '#F3F4F6', color: '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EXISTING CUSTOMER SEARCH MODAL */}
      {showCustomerSearch && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#065F46' }}>Search Existing Customer</h3>
                <button onClick={() => { setShowCustomerSearch(false); setCustomerSearchTerm(''); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="text" placeholder="Search by Name, Phone, Email or Customer ID..." value={customerSearchTerm} onChange={(e) => setCustomerSearchTerm(e.target.value)} autoFocus style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px' }} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
              {getFilteredCustomers().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                  <Users size={48} style={{ margin: '0 auto 16px' }} />
                  <p>No customers found</p>
                  <button onClick={handleNewCustomer} style={{ marginTop: '16px', background: '#065F46', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Add New Customer</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {getFilteredCustomers().map(customer => (
                    <div key={customer.id} onClick={() => handleSelectExistingCustomer(customer)} style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#065F46'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#065F46' }}>{customer.customerName}</div>
                        <span style={{ background: '#E8F5E9', color: '#065F46', padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600' }}>{customer.customerId}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6B7280' }}><span>📞 {customer.customerPhone}</span></div>
                      {customer.customerEmail && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>✉️ {customer.customerEmail}</div>}
                      {customer.customerAddress && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>📍 {customer.customerAddress}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW SERVICE REQUEST MODAL */}
      {showRequestForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedExistingCustomer ? 'Create Service Request for ' + selectedExistingCustomer.customerName : 'New Service Request'}</h3>
              <button onClick={() => { setShowRequestForm(false); setSelectedExistingCustomer(null); setNewRequest({ customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', droneModel: '', issueType: '', description: '', priority: 'NORMAL' }); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            {selectedExistingCustomer && (
              <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '12px', color: '#065F46', fontWeight: '500' }}>Customer Details Auto-filled</div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>{selectedExistingCustomer.customerName} | {selectedExistingCustomer.customerPhone}</div>
              </div>
            )}
            <form onSubmit={handleCreateRequest}>
              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Customer Name *</label><input type="text" value={newRequest.customerName} onChange={e => setNewRequest({ ...newRequest, customerName: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Phone *</label><input type="tel" value={newRequest.customerPhone} onChange={e => setNewRequest({ ...newRequest, customerPhone: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Email</label><input type="email" value={newRequest.customerEmail} onChange={e => setNewRequest({ ...newRequest, customerEmail: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              </div>
              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Address</label><textarea value={newRequest.customerAddress} onChange={e => setNewRequest({ ...newRequest, customerAddress: e.target.value })} rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Drone Model *</label>
                <select value={newRequest.droneModel} onChange={e => setNewRequest({ ...newRequest, droneModel: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }}>
                  <option value="">Select Drone Model</option>
                  {DRONE_MODELS.map(drone => (<option key={drone.id} value={drone.name}>{drone.name} - {formatCurrency(drone.price)}</option>))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Issue Type *</label><input type="text" value={newRequest.issueType} onChange={e => setNewRequest({ ...newRequest, issueType: e.target.value })} required placeholder="e.g., Motor failure, Battery issue, GPS problem" style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description *</label><textarea value={newRequest.description} onChange={e => setNewRequest({ ...newRequest, description: e.target.value })} rows="3" required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Priority</label><select value={newRequest.priority} onChange={e => setNewRequest({ ...newRequest, priority: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }}><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, background: '#065F46', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Create Service Request</button>
                <button type="button" onClick={() => { setShowRequestForm(false); setSelectedExistingCustomer(null); }} style={{ flex: 1, background: '#F3F4F6', color: '#475569', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT SERVICE REQUEST MODAL */}
      {editingRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Edit Service Request</h3>
              <button onClick={() => { setEditingRequest(null); }} style={{ background: '#F3F4F6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>Service ID: {editingRequest.request_number}</div>
              <div style={{ fontWeight: 'bold' }}>Status: {editingRequest.status}</div>
            </div>
            <form onSubmit={handleSaveEditedRequest}>
              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Customer Name *</label><input type="text" value={editRequestData.customerName} onChange={e => setEditRequestData({ ...editRequestData, customerName: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Phone *</label><input type="tel" value={editRequestData.customerPhone} onChange={e => setEditRequestData({ ...editRequestData, customerPhone: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Email</label><input type="email" value={editRequestData.customerEmail} onChange={e => setEditRequestData({ ...editRequestData, customerEmail: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              </div>
              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Address</label><textarea value={editRequestData.customerAddress} onChange={e => setEditRequestData({ ...editRequestData, customerAddress: e.target.value })} rows="2" style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Drone Model *</label>
                <select value={editRequestData.droneModel} onChange={e => setEditRequestData({ ...editRequestData, droneModel: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }}>
                  <option value="">Select Drone Model</option>
                  {DRONE_MODELS.map(drone => (<option key={drone.id} value={drone.name}>{drone.name} - {formatCurrency(drone.price)}</option>))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Issue Type *</label><input type="text" value={editRequestData.issueType} onChange={e => setEditRequestData({ ...editRequestData, issueType: e.target.value })} required placeholder="e.g., Motor failure, Battery issue, GPS problem" style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description *</label><textarea value={editRequestData.description} onChange={e => setEditRequestData({ ...editRequestData, description: e.target.value })} rows="3" required style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }} /></div>
              <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Priority</label><select value={editRequestData.priority} onChange={e => setEditRequestData({ ...editRequestData, priority: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '13px' }}><option value="LOW">Low</option><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, background: '#065F46', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '500' }}><Save size={16} style={{ display: 'inline', marginRight: '6px' }} /> Save Changes</button>
                <button type="button" onClick={() => { setEditingRequest(null); }} style={{ flex: 1, background: '#F3F4F6', color: '#475569', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
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
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setIsEditingProfile(false);
                    setEditProfileData(profileData);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '-40px',
              position: 'relative'
            }}>
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px'
              }}>
                {isEditingProfile ? (
                  <>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: editProfileData.photo ? 'transparent' : '#E5E7EB',
                        border: '4px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {editProfileData.photo ? (
                        <img
                          src={editProfileData.photo}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <User size={40} color="#9CA3AF" />
                      )}
                    </div>
                    <label
                      htmlFor="photo-upload"
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        background: '#065F46',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      <Camera size={14} color="white" />
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: 'none' }}
                    />
                  </>
                ) : (
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: profileData.photo ? 'transparent' : '#E5E7EB',
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {profileData.photo ? (
                      <img
                        src={profileData.photo}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <User size={40} color="#9CA3AF" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 24px 24px' }}>
              {!isEditingProfile ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>{profileData.fullName}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>{profileData.designation || 'Service Manager'}</p>
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
                      {profileData.photo ? (
                        <img src={profileData.photo} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <User size={40} color="#9CA3AF" />
                      )}
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: '#1F2937' }}>{profileData.fullName}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{profileData.designation || 'Service Manager'}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{profileData.phone || ''} • {profileData.email || ''}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setEditProfileData(profileData);
                      }}
                      style={{
                        flex: 1,
                        background: '#065F46',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                    <button
                      onClick={onLogout}
                      style={{
                        flex: 1,
                        background: '#F3F4F6',
                        color: '#DC2626',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #FEE2E2',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1F2937' }}>Edit Profile</h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      value={editProfileData.fullName}
                      onChange={(e) => setEditProfileData({ ...editProfileData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Designation</label>
                    <input
                      type="text"
                      value={editProfileData.designation}
                      onChange={(e) => setEditProfileData({ ...editProfileData, designation: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Phone</label>
                    <input
                      type="tel"
                      value={editProfileData.phone}
                      onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
                    <input
                      type="email"
                      value={editProfileData.email}
                      onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={saveProfile}
                      style={{
                        flex: 1,
                        background: '#065F46',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Save size={16} /> Save Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditProfileData(profileData);
                      }}
                      style={{
                        flex: 1,
                        background: '#F3F4F6',
                        color: '#475569',
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PARTS MANAGEMENT MODAL - Read Only View for Service Manager */}
      {showPartsModal && (
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
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            overflow: 'auto',
            padding: '24px',
            animation: 'slideUp 0.3s ease'
          }}>
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={20} color="#065F46" /> Repair Parts / Components
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>
                  {showPartsModal.request_number} - {showPartsModal.customerName}
                </p>
              </div>
              <button
                onClick={() => { setShowPartsModal(null); }}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              background: '#EFF6FF',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Info size={18} color="#3B82F6" />
              <div style={{ fontSize: '13px', color: '#1E40AF' }}>
                <strong>Components used by employees:</strong> This shows all components that have been added by service team members during repairs.
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Components Used ({partsData[showPartsModal.id]?.length || 0})
                </h4>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  Total Cost: {formatCurrency(partsData[showPartsModal.id]?.reduce((sum, p) => sum + (p.cost * p.quantity), 0) || 0)}
                </span>
              </div>

              {partsData[showPartsModal.id] && partsData[showPartsModal.id].length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Component</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Category</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Qty</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Cost (₹)</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Total</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Added By</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partsData[showPartsModal.id].map((part) => {
                        const employee = employees.find(emp => emp.id === part.addedById);
                        const categoryInfo = COMPONENT_CATEGORIES[part.category] || { icon: '🔧', color: '#6B7280' };
                        return (
                          <tr key={part.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 12px', fontWeight: '500' }}>{part.partName}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span style={{
                                background: categoryInfo.color + '20',
                                color: categoryInfo.color,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '500'
                              }}>
                                {categoryInfo.icon} {part.category}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>{part.quantity}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatCurrency(part.cost)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', color: '#065F46' }}>{formatCurrency(part.cost * part.quantity)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: employee ? '#E0E7FF' : '#F3F4F6',
                                color: employee ? '#4338CA' : '#6B7280',
                                padding: '4px 12px',
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {employee ? (
                                  <>
                                    <span style={{ fontSize: '16px' }}>{employee.avatar || '🔧'}</span>
                                    {employee.name}
                                  </>
                                ) : (
                                  part.addedBy || 'System'
                                )}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '11px', color: '#6B7280' }}>
                              {part.addedAt ? formatDate(part.addedAt) : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#F0FDF4', borderTop: '2px solid #065F46' }}>
                        <td colSpan="4" style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Total Components Cost</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#065F46', fontSize: '16px' }}>
                          {formatCurrency(partsData[showPartsModal.id]?.reduce((sum, p) => sum + (p.cost * p.quantity), 0) || 0)}
                        </td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9CA3AF',
                  border: '2px dashed #E5E7EB',
                  borderRadius: '12px'
                }}>
                  <Wrench size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#6B7280' }}>No components added yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Components will appear here once employees add them during repairs</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '20px' }}>
              <button
                onClick={() => { setShowPartsModal(null); }}
                style={{
                  padding: '10px 32px',
                  background: '#065F46',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAIL VIEW MODAL */}
      {selectedCustomer && (
        <CustomerDetailView
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}