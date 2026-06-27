import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const LOGO = "https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_99,h_99,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png";

const THEME = {
  primary: '#065F46',
  primaryLight: '#047857',
  primaryDark: '#064E3B',
  accent: '#10B981',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#2563EB',
  purple: '#7C3AED',
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
};

const STATUS_CONFIG = {
  pending: { color: '#D97706', bg: '#FEF3C7', text: 'Pending', icon: '⏳' },
  in_progress: { color: '#2563EB', bg: '#DBEAFE', text: 'In Progress', icon: '🔬' },
  completed: { color: '#059669', bg: '#D1FAE5', text: 'Completed', icon: '✅' },
  rejected: { color: '#DC2626', bg: '#FEE2E2', text: 'Rejected', icon: '❌' },
};

const CHECKLIST_CATEGORIES = [
  { key: 'frame', label: 'Frame & Structure', icon: '🏗️' },
  { key: 'motor', label: 'Motors & ESC', icon: '⚡' },
  { key: 'propeller', label: 'Propellers', icon: '🔄' },
  { key: 'battery', label: 'Battery System', icon: '🔋' },
  { key: 'gps', label: 'GPS & Navigation', icon: '📡' },
  { key: 'flight_controller', label: 'Flight Controller', icon: '🎛️' },
  { key: 'spraying', label: 'Spraying System (Agri)', icon: '🌾' },
];

const CHECKLIST_ITEMS = [
  { id: 1, category: 'frame', name: 'Body Integrity', description: 'Check for cracks, dents, or structural damage' },
  { id: 2, category: 'frame', name: 'Screw Tightening', description: 'Verify all fasteners are properly torqued' },
  { id: 3, category: 'frame', name: 'Arm Alignment', description: 'Check arm alignment and symmetry within ±0.5mm' },
  { id: 4, category: 'frame', name: 'Landing Gear Integrity', description: 'Inspect landing gear for cracks and proper seating' },
  { id: 5, category: 'motor', name: 'Motor Rotation Test', description: 'Verify smooth rotation, no wobble or bearing noise' },
  { id: 6, category: 'motor', name: 'Vibration Threshold', description: 'Vibration <0.3g at hover RPM' },
  { id: 7, category: 'motor', name: 'Operating Temperature', description: 'Motor temp <65°C after 5min hover test' },
  { id: 8, category: 'motor', name: 'ESC Sync Check', description: 'All ESCs respond correctly in sync with FC' },
  { id: 9, category: 'propeller', name: 'Static Balance', description: 'Balance within ±0.2g using prop balancer' },
  { id: 10, category: 'propeller', name: 'Blade Damage Inspection', description: 'Zero cracks, chips, or delamination' },
  { id: 11, category: 'propeller', name: 'Correct CW/CCW Pairing', description: 'Verify propeller rotation direction per motor layout' },
  { id: 12, category: 'battery', name: 'Cell Voltage Balance', description: 'All cells within ±0.05V of each other' },
  { id: 13, category: 'battery', name: 'State of Health (SOH)', description: 'Battery SOH ≥ 95%' },
  { id: 14, category: 'battery', name: 'Connector & Wiring', description: 'No loose wires, correct polarity, heat-shrink intact' },
  { id: 15, category: 'battery', name: 'Charge Cycle Count', description: 'Cycle count within acceptable limit per spec' },
  { id: 16, category: 'gps', name: 'Satellite Lock Test', description: 'Minimum 12 satellites locked in <90 seconds' },
  { id: 17, category: 'gps', name: 'HDOP Value', description: 'Horizontal Dilution of Precision < 1.5' },
  { id: 18, category: 'gps', name: 'Compass Calibration', description: 'Compass error < 5° post-calibration' },
  { id: 19, category: 'gps', name: 'Return-to-Home Test', description: 'RTH accuracy within 1.5m of launch point' },
  { id: 20, category: 'flight_controller', name: 'IMU Calibration', description: 'Gyro and accelerometer offsets within spec' },
  { id: 21, category: 'flight_controller', name: 'Firmware Version', description: 'Firmware matches approved production build' },
  { id: 22, category: 'flight_controller', name: 'Failsafe Configuration', description: 'RC loss, low battery, and geofence failsafes active' },
  { id: 23, category: 'flight_controller', name: 'Data Logging Active', description: 'Black box / telemetry logging confirmed' },
  { id: 24, category: 'spraying', name: 'Tank Pressure Leak Test', description: 'No leaks at 1.5x operating pressure for 2 min' },
  { id: 25, category: 'spraying', name: 'Pump Flow Rate', description: 'Flow rate within ±5% of rated spec' },
  { id: 26, category: 'spraying', name: 'Nozzle Spray Pattern', description: 'Even fan pattern, no clogging or dripping' },
  { id: 27, category: 'spraying', name: 'Level Sensor Accuracy', description: 'Tank level sensor reads correctly at 0%, 50%, 100%' },
];

// ===== SAMPLE DATA GENERATION =====
const generateSampleDrones = () => {
  const models = ['AgriSpray X1', 'SkySurvey Pro', 'CargoHauler 500', 'AgriSpray X1', 'SkySurvey Pro'];
  const customers = [
    'GreenFields Farms', 'MapTech Solutions', 'Harvest King Agro',
    'LogiTech Express', 'AerialView Studios', 'EcoGrow Farms',
    'CityMed Logistics', 'ConstructionScan Inc', 'AgroTech Solutions',
    'SkyView Drones', 'PrecisionAg Systems', 'FarmSmart Industries'
  ];
  const inspectors = ['Arjun Mehta', 'Priya Sharma', 'Ravi Kumar', 'Sarah Wilson', 'Robert Chen', 'Emily Davis', 'Vikram Raj', 'Priya Patel'];
  const statuses = ['pending', 'pending', 'in_progress', 'completed', 'completed', 'pending', 'pending', 'completed'];

  const sampleDrones = [];
  const today = new Date();

  for (let i = 1; i <= 25; i++) {
    const status = statuses[i % statuses.length];
    const model = models[i % models.length];
    const customer = customers[i % customers.length];
    const inspector = inspectors[i % inspectors.length];
    const date = new Date(today);
    date.setDate(date.getDate() - (i % 30) - (i % 10));

    let remarks = '';
    if (status === 'completed') {
      remarks = ['All 27 checks passed. Flight test nominal.', 'Excellent performance across all checks.', 'Ready for delivery. All systems nominal.', 'Flight test passed with flying colors.'][i % 4];
    } else if (status === 'rejected') {
      remarks = ['Motor 3 vibration exceeds 0.3g threshold. Needs bearing replacement.', 'GPS satellite lock insufficient. Antenna replacement required.', 'Battery cell voltage imbalance. Replacement battery needed.', 'Frame crack detected near arm joint. Welding repair required.'][i % 4];
    }

    sampleDrones.push({
      id: i,
      orderNumber: `DRN-2026-${String(i).padStart(3, '0')}`,
      droneModel: model,
      droneSerial: `${model.substring(0, 3).toUpperCase()}-2026-${String(i).padStart(3, '0')}`,
      customerName: customer,
      productionDate: date.toISOString().split('T')[0],
      assignedTo: status === 'pending' ? '' : inspector,
      status: status,
      remarks: remarks,
      inspectedAt: status === 'completed' || status === 'rejected' ? new Date(date.getTime() + 86400000 * 2).toISOString() : null
    });
  }

  return sampleDrones;
};

// Load drones from localStorage or use defaults
const loadDronesFromStorage = () => {
  const stored = localStorage.getItem('quality_drones');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing stored drones:', e);
    }
  }
  const defaultDrones = generateSampleDrones();
  localStorage.setItem('quality_drones', JSON.stringify(defaultDrones));
  return defaultDrones;
};

// ===== CHECKLIST SAVE FUNCTIONS =====
const saveChecklistToStorage = (droneId, checklistStatus) => {
  const key = `checklist_${droneId}`;
  localStorage.setItem(key, JSON.stringify(checklistStatus));
};

const loadChecklistFromStorage = (droneId) => {
  const key = `checklist_${droneId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored checklist:', e);
    }
  }
  return null;
};

// ===== FLIGHT TEST SAVE FUNCTIONS =====
const saveFlightTestToStorage = (droneId, flightTestData) => {
  const key = `flighttest_${droneId}`;
  localStorage.setItem(key, JSON.stringify(flightTestData));
};

const loadFlightTestFromStorage = (droneId) => {
  const key = `flighttest_${droneId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored flight test:', e);
    }
  }
  return null;
};

// ===== INSPECTION REMARKS SAVE FUNCTIONS =====
const saveRemarksToStorage = (droneId, remarks) => {
  const key = `inspection_remarks_${droneId}`;
  localStorage.setItem(key, JSON.stringify(remarks));
};

const loadRemarksFromStorage = (droneId) => {
  const key = `inspection_remarks_${droneId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored remarks:', e);
    }
  }
  return null;
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`
    }}>
      {cfg.icon} {cfg.text}
    </span>
  );
}

function MetricCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: THEME.surface, borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', color: THEME.textSecondary, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: THEME.textPrimary, marginTop: '2px', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '11px', color: THEME.textMuted, marginTop: '4px' }}>{sub}</div>}
        </div>
        <span style={{ fontSize: '20px', opacity: 0.7 }}>{icon}</span>
      </div>
    </div>
  );
}

function DroneTable({ drones, onStart, showAction, showRemarks }) {
  if (drones.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '12px', padding: '48px 20px', textAlign: 'center', color: '#94A3B8' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
        No drones found
      </div>
    );
  }

  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {drones.map(d => (
          <div key={d.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${THEME.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px', color: THEME.primary }}>{d.orderNumber}</div>
                <div style={{ fontSize: '13px', fontWeight: '500' }}>{d.droneModel}</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div style={{ fontSize: '12px', color: THEME.textSecondary }}>
              <div>🔢 {d.droneSerial}</div>
              <div>👤 {d.customerName}</div>
              <div>📅 {d.productionDate}</div>
              <div>🔧 {d.assignedTo || 'Not assigned'}</div>
              {showRemarks && d.remarks && <div style={{ marginTop: '4px', color: THEME.textMuted }}>📝 {d.remarks}</div>}
            </div>
            {showAction && (d.status === 'pending' || d.status === 'in_progress') && (
              <button onClick={() => onStart(d)} style={{ marginTop: '12px', width: '100%', padding: '8px', background: THEME.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                {d.status === 'pending' ? '▶️ Start Inspection' : '🔄 Continue'}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['Order No.', 'Model', 'Serial No.', 'Customer', 'Prod. Date', 'Inspector', 'Status', showRemarks ? 'Remarks' : null, showAction ? 'Action' : null].filter(Boolean).map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {drones.map(d => (
            <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '10px 14px', fontWeight: '600', fontSize: '13px', color: '#065F46' }}>{d.orderNumber}</td>
              <td style={{ padding: '10px 14px', fontSize: '13px' }}>{d.droneModel}</td>
              <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>{d.droneSerial}</td>
              <td style={{ padding: '10px 14px', fontSize: '13px' }}>{d.customerName}</td>
              <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569' }}>{d.productionDate}</td>
              <td style={{ padding: '10px 14px', fontSize: '12px', color: d.assignedTo ? '#0F172A' : '#94A3B8' }}>{d.assignedTo || '—'}</td>
              <td style={{ padding: '10px 14px' }}><StatusBadge status={d.status} /></td>
              {showRemarks && <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569', maxWidth: '150px' }}>{d.remarks || '—'}</td>}
              {showAction && (
                <td style={{ padding: '10px 14px' }}>
                  {(d.status === 'pending' || d.status === 'in_progress') && (
                    <button onClick={() => onStart(d)} style={{ padding: '4px 12px', background: '#065F46', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                      {d.status === 'pending' ? 'Start' : 'Continue'}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== REPORTS COMPONENTS =====
function ReportsSection({ drones }) {
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showProductionDetails, setShowProductionDetails] = useState(false);
  const [showServiceDetails, setShowServiceDetails] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data from other modules
  const [productionOrders, setProductionOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);

  useEffect(() => {
    // Load Production Orders
    const storedProduction = localStorage.getItem('production_orders');
    if (storedProduction) {
      try {
        setProductionOrders(JSON.parse(storedProduction));
      } catch (e) {
        console.error('Error parsing production orders:', e);
      }
    }

    // Load Service Requests
    const storedServices = localStorage.getItem('service_requests');
    if (storedServices) {
      try {
        setServiceRequests(JSON.parse(storedServices));
      } catch (e) {
        console.error('Error parsing service requests:', e);
      }
    }
  }, []);

  const getMonthlyData = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    const monthDrones = drones.filter(d => {
      const dDate = new Date(d.productionDate);
      return dDate.getFullYear() === year && dDate.getMonth() === month - 1;
    });

    const monthProduction = productionOrders.filter(o => {
      const oDate = new Date(o.createdAt);
      return oDate.getFullYear() === year && oDate.getMonth() === month - 1;
    });

    const monthServices = serviceRequests.filter(s => {
      const sDate = new Date(s.created_at);
      return sDate.getFullYear() === year && sDate.getMonth() === month - 1;
    });

    return {
      quality: {
        total: monthDrones.length,
        completed: monthDrones.filter(d => d.status === 'completed').length,
        rejected: monthDrones.filter(d => d.status === 'rejected').length,
        inProgress: monthDrones.filter(d => d.status === 'in_progress').length,
        pending: monthDrones.filter(d => d.status === 'pending').length,
        items: monthDrones
      },
      production: {
        total: monthProduction.length,
        completed: monthProduction.filter(o => o.status === 'COMPLETED').length,
        inProgress: monthProduction.filter(o => o.status === 'IN_PROGRESS' || o.status === 'ASSIGNED').length,
        items: monthProduction
      },
      service: {
        total: monthServices.length,
        completed: monthServices.filter(s => s.status === 'COMPLETED').length,
        inProgress: monthServices.filter(s => s.status === 'IN_PROGRESS' || s.status === 'ASSIGNED').length,
        items: monthServices
      }
    };
  };

  const getYearlyData = (year) => {
    const yearDrones = drones.filter(d => {
      const dDate = new Date(d.productionDate);
      return dDate.getFullYear() === year;
    });

    const yearProduction = productionOrders.filter(o => {
      const oDate = new Date(o.createdAt);
      return oDate.getFullYear() === year;
    });

    const yearServices = serviceRequests.filter(s => {
      const sDate = new Date(s.created_at);
      return sDate.getFullYear() === year;
    });

    const monthlyData = Array(12).fill(0).map((_, i) => {
      const monthDrones = drones.filter(d => {
        const dDate = new Date(d.productionDate);
        return dDate.getFullYear() === year && dDate.getMonth() === i;
      });
      const monthProduction = productionOrders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getFullYear() === year && oDate.getMonth() === i;
      });
      const monthServices = serviceRequests.filter(s => {
        const sDate = new Date(s.created_at);
        return sDate.getFullYear() === year && sDate.getMonth() === i;
      });

      return {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        quality: monthDrones.length,
        production: monthProduction.length,
        service: monthServices.length,
        completed: monthDrones.filter(d => d.status === 'completed').length,
        productionItems: monthProduction,
        serviceItems: monthServices
      };
    });

    return {
      total: yearDrones.length,
      completed: yearDrones.filter(d => d.status === 'completed').length,
      rejected: yearDrones.filter(d => d.status === 'rejected').length,
      monthlyData: monthlyData,
      productionTotal: yearProduction.length,
      serviceTotal: yearServices.length,
      productionItems: yearProduction,
      serviceItems: yearServices
    };
  };

  const getCustomData = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    const filteredDrones = drones.filter(d => {
      const dDate = new Date(d.productionDate);
      return dDate >= fromDate && dDate <= toDate;
    });

    const filteredProduction = productionOrders.filter(o => {
      const oDate = new Date(o.createdAt);
      return oDate >= fromDate && oDate <= toDate;
    });

    const filteredServices = serviceRequests.filter(s => {
      const sDate = new Date(s.created_at);
      return sDate >= fromDate && sDate <= toDate;
    });

    return {
      quality: {
        total: filteredDrones.length,
        completed: filteredDrones.filter(d => d.status === 'completed').length,
        rejected: filteredDrones.filter(d => d.status === 'rejected').length,
        inProgress: filteredDrones.filter(d => d.status === 'in_progress').length,
        pending: filteredDrones.filter(d => d.status === 'pending').length,
        items: filteredDrones
      },
      production: {
        total: filteredProduction.length,
        completed: filteredProduction.filter(o => o.status === 'COMPLETED').length,
        items: filteredProduction
      },
      service: {
        total: filteredServices.length,
        completed: filteredServices.filter(s => s.status === 'COMPLETED').length,
        items: filteredServices
      }
    };
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

  // Production Order Detail Component
  const ProductionDetailView = ({ order }) => (
    <div style={{ background: '#F0FDF4', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #065F46' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontWeight: '600', fontSize: '13px' }}>{order.order_number || 'N/A'}</span>
        <span style={{ fontSize: '12px', color: '#6B7280' }}>👤 {order.customerName || 'N/A'}</span>
        <span style={{ fontSize: '12px', color: '#6B7280' }}>📅 {formatDate(order.createdAt)}</span>
        <span style={{
          background: order.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7',
          color: order.status === 'COMPLETED' ? '#065F46' : '#D97706',
          padding: '2px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {order.status || 'PENDING'}
        </span>
      </div>
      {order.products && order.products.length > 0 && (
        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
          📦 {order.products.map(p => p.name).join(', ')}
        </div>
      )}
    </div>
  );

  // Service Request Detail Component
  const ServiceDetailView = ({ request }) => (
    <div style={{ background: '#EFF6FF', padding: '10px 14px', borderRadius: '8px', marginBottom: '8px', borderLeft: '3px solid #2563EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
        <span style={{ fontWeight: '600', fontSize: '13px' }}>{request.request_number || 'N/A'}</span>
        <span style={{ fontSize: '12px', color: '#6B7280' }}>👤 {request.customerName || 'N/A'}</span>
        <span style={{ fontSize: '12px', color: '#6B7280' }}>📅 {formatDate(request.created_at)}</span>
        <span style={{
          background: request.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7',
          color: request.status === 'COMPLETED' ? '#065F46' : '#D97706',
          padding: '2px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          {request.status || 'PENDING'}
        </span>
      </div>
      {request.issueType && (
        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
          🔧 {request.issueType} {request.droneModel && `- ${request.droneModel}`}
        </div>
      )}
    </div>
  );

  return (
    <div className="anim">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: isMobile ? '17px' : '20px', fontWeight: '700', color: THEME.primary }}>
          📊 Reports & Analytics
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: THEME.textSecondary }}>
          Overview of Quality, Production, and Service performance
        </p>
      </div>

      {/* Report Type Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        background: THEME.surface,
        padding: '8px',
        borderRadius: '16px',
        border: `1px solid ${THEME.border}`
      }}>
        <button
          onClick={() => setReportView('monthly')}
          style={{
            padding: '10px 24px',
            borderRadius: '30px',
            border: 'none',
            background: reportView === 'monthly' ? THEME.primary : '#F1F5F9',
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
            background: reportView === 'yearly' ? THEME.primary : '#F1F5F9',
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
            background: reportView === 'custom' ? THEME.primary : '#F1F5F9',
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

      {/* MONTHLY REPORT - With Detailed Views */}
      {reportView === 'monthly' && (
        <div>
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: THEME.surface,
            padding: '12px 20px',
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`
          }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${THEME.border}`,
                fontSize: '13px',
                background: '#F9FAFB',
                fontWeight: '500'
              }}
            />
          </div>

          {(() => {
            const data = getMonthlyData(selectedMonth);
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <MetricCard label="Quality Total" value={data.quality.total} sub="Drones" color={THEME.primary} icon="🔬" />
                  <MetricCard label="Quality Completed" value={data.quality.completed} sub={`${data.quality.total > 0 ? Math.round(data.quality.completed / data.quality.total * 100) : 0}% Rate`} color={THEME.accent} icon="✅" />
                  <MetricCard label="Production Orders" value={data.production.total} sub={`${data.production.completed} completed`} color={THEME.info} icon="🏭" />
                  <MetricCard label="Service Requests" value={data.service.total} sub={`${data.service.completed} completed`} color={THEME.purple} icon="🔧" />
                </div>

                {/* Production Orders Detail */}
                <div style={{ background: THEME.surface, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${THEME.border}`, marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏭 Production Orders ({data.production.total})
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '400' }}>
                        {data.production.completed} completed
                      </span>
                    </h4>
                    <button
                      onClick={() => setShowProductionDetails(!showProductionDetails)}
                      style={{
                        fontSize: '12px',
                        color: THEME.primary,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {showProductionDetails ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>
                  </div>

                  {showProductionDetails && (
                    <div>
                      {data.production.items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '13px' }}>
                          No production orders for this month
                        </div>
                      ) : (
                        data.production.items.map(order => (
                          <ProductionDetailView key={order.id} order={order} />
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Service Requests Detail */}
                <div style={{ background: THEME.surface, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${THEME.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🔧 Service Requests ({data.service.total})
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '400' }}>
                        {data.service.completed} completed
                      </span>
                    </h4>
                    <button
                      onClick={() => setShowServiceDetails(!showServiceDetails)}
                      style={{
                        fontSize: '12px',
                        color: THEME.primary,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {showServiceDetails ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>
                  </div>

                  {showServiceDetails && (
                    <div>
                      {data.service.items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '13px' }}>
                          No service requests for this month
                        </div>
                      ) : (
                        data.service.items.map(request => (
                          <ServiceDetailView key={request.id} request={request} />
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* YEARLY REPORT - With Detailed Views */}
      {reportView === 'yearly' && (
        <div>
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: THEME.surface,
            padding: '12px 20px',
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`
          }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Select Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${THEME.border}`,
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
            const data = getYearlyData(selectedYear);
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <MetricCard label="Total Quality" value={data.total} sub={`${selectedYear}`} color={THEME.primary} icon="🔬" />
                  <MetricCard label="Quality Completed" value={data.completed} sub={`${data.total > 0 ? Math.round(data.completed / data.total * 100) : 0}% Rate`} color={THEME.accent} icon="✅" />
                  <MetricCard label="Production Orders" value={data.productionTotal} sub="From Production" color={THEME.info} icon="🏭" />
                  <MetricCard label="Service Requests" value={data.serviceTotal} sub="From Service" color={THEME.purple} icon="🔧" />
                </div>

                <div style={{ background: THEME.surface, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${THEME.border}`, overflowX: 'auto', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>📊 Monthly Breakdown - {selectedYear}</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: `1px solid ${THEME.border}` }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#6B7280', fontSize: '10px', fontWeight: '600' }}>Month</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#6B7280', fontSize: '10px', fontWeight: '600' }}>Quality</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#6B7280', fontSize: '10px', fontWeight: '600' }}>Production</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#6B7280', fontSize: '10px', fontWeight: '600' }}>Service</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', color: '#6B7280', fontSize: '10px', fontWeight: '600' }}>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monthlyData.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ padding: '8px 10px', fontWeight: '600' }}>{m.month}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.quality}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.production}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.service}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                              {m.completed}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Yearly Production Details */}
                <div style={{ background: THEME.surface, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${THEME.border}`, marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏭 Production Orders ({data.productionTotal})
                    </h4>
                    <button
                      onClick={() => setShowProductionDetails(!showProductionDetails)}
                      style={{
                        fontSize: '12px',
                        color: THEME.primary,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {showProductionDetails ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>
                  </div>

                  {showProductionDetails && (
                    <div>
                      {data.productionItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '13px' }}>
                          No production orders for this year
                        </div>
                      ) : (
                        data.productionItems.slice(0, 20).map(order => (
                          <ProductionDetailView key={order.id} order={order} />
                        ))
                      )}
                      {data.productionItems.length > 20 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                          Showing 20 of {data.productionItems.length} orders
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Yearly Service Details */}
                <div style={{ background: THEME.surface, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${THEME.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🔧 Service Requests ({data.serviceTotal})
                    </h4>
                    <button
                      onClick={() => setShowServiceDetails(!showServiceDetails)}
                      style={{
                        fontSize: '12px',
                        color: THEME.primary,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {showServiceDetails ? 'Hide Details ▲' : 'View Details ▼'}
                    </button>
                  </div>

                  {showServiceDetails && (
                    <div>
                      {data.serviceItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '13px' }}>
                          No service requests for this year
                        </div>
                      ) : (
                        data.serviceItems.slice(0, 20).map(request => (
                          <ServiceDetailView key={request.id} request={request} />
                        ))
                      )}
                      {data.serviceItems.length > 20 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                          Showing 20 of {data.serviceItems.length} requests
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* CUSTOM RANGE REPORT - With Detailed Views */}
      {reportView === 'custom' && (
        <div>
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            background: THEME.surface,
            padding: '12px 20px',
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`
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
                  border: `1px solid ${THEME.border}`,
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
                  border: `1px solid ${THEME.border}`,
                  fontSize: '13px',
                  background: '#F9FAFB'
                }}
              />
            </div>
          </div>

          {(() => {
            const data = getCustomData(customFrom, customTo);
            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <MetricCard label="Quality Total" value={data.quality.total} sub="Drones" color={THEME.primary} icon="🔬" />
                  <MetricCard label="Quality Completed" value={data.quality.completed} sub={`${data.quality.total > 0 ? Math.round(data.quality.completed / data.quality.total * 100) : 0}% Rate`} color={THEME.accent} icon="✅" />
                  <MetricCard label="Production Orders" value={data.production.total} sub="From Production" color={THEME.info} icon="🏭" />
                  <MetricCard label="Service Requests" value={data.service.total} sub="From Service" color={THEME.purple} icon="🔧" />
                </div>

                <div style={{ background: THEME.surface, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${THEME.border}`, marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>📊 Summary - {formatDate(customFrom)} to {formatDate(customTo)}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Quality</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#065F46' }}>{data.quality.total}</div>
                      <div style={{ fontSize: '11px', color: '#059669' }}>{data.quality.completed} completed</div>
                    </div>
                    <div style={{ background: '#EFF6FF', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Production</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1E40AF' }}>{data.production.total}</div>
                      <div style={{ fontSize: '11px', color: '#2563EB' }}>{data.production.completed} completed</div>
                    </div>
                    <div style={{ background: '#F5F3FF', padding: '12px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Service</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#5B21B6' }}>{data.service.total}</div>
                      <div style={{ fontSize: '11px', color: '#7C3AED' }}>{data.service.completed} completed</div>
                    </div>
                  </div>
                  {/* Production Details */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🏭 Production Orders ({data.production.total})
                      </h5>
                      <button
                        onClick={() => setShowProductionDetails(!showProductionDetails)}
                        style={{
                          fontSize: '11px',
                          color: THEME.primary,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {showProductionDetails ? 'Hide ▲' : 'View ▼'}
                      </button>
                    </div>
                    {showProductionDetails && (
                      <div>
                        {data.production.items.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '12px', color: '#9CA3AF', fontSize: '12px' }}>
                            No production orders in this range
                          </div>
                        ) : (
                          data.production.items.map(order => (
                            <ProductionDetailView key={order.id} order={order} />
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Service Details */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        🔧 Service Requests ({data.service.total})
                      </h5>
                      <button
                        onClick={() => setShowServiceDetails(!showServiceDetails)}
                        style={{
                          fontSize: '11px',
                          color: THEME.primary,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {showServiceDetails ? 'Hide ▲' : 'View ▼'}
                      </button>
                    </div>
                    {showServiceDetails && (
                      <div>
                        {data.service.items.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '12px', color: '#9CA3AF', fontSize: '12px' }}>
                            No service requests in this range
                          </div>
                        ) : (
                          data.service.items.map(request => (
                            <ServiceDetailView key={request.id} request={request} />
                          ))
                        )}
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
  );
}

export default function QualityManagerUI({ user: propUser, onLogout }) {
  const [user, setUser] = useState(propUser || { name: 'Quality Manager', role: 'QC Manager', email: 'qc@goagdrones.com', phone: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drones, setDrones] = useState(loadDronesFromStorage());
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [checklistStatus, setChecklistStatus] = useState({});
  const [inspectionRemarks, setInspectionRemarks] = useState('');
  const [flightTest, setFlightTest] = useState({ pilotName: '', duration: '', altitude: '', stabilityRating: 5, result: 'pending', notes: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [toastMsg, setToastMsg] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileEdit, setProfileEdit] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [activeInspectionTab, setActiveInspectionTab] = useState('checklist');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const fileInputRef = useRef();
  const saveTimeoutRef = useRef(null);

  // ============ REAL-TIME SYNC ============
  useEffect(() => {
    loadDataFromStorage();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const handleStorageChange = (e) => {
      if (e.key === 'quality_drones' || e.key === 'employees' || e.key === 'production_orders') {
        loadDataFromStorage();
        showToast('🔄 Quality data updated from another module', 'info');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const channel = new BroadcastChannel('erp_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'data_updated') {
        loadDataFromStorage();
        showToast('🔄 Data updated from another module', 'info');
      }
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
      channel.close();
    };
  }, []);

  const loadDataFromStorage = () => {
    const storedDrones = localStorage.getItem('quality_drones');
    if (storedDrones) {
      try {
        const parsed = JSON.parse(storedDrones);
        if (parsed && parsed.length > 0) {
          setDrones(parsed);
          return;
        }
      } catch (e) {
        console.error('Error parsing stored drones:', e);
      }
    }
    const defaultDrones = generateSampleDrones();
    localStorage.setItem('quality_drones', JSON.stringify(defaultDrones));
    setDrones(defaultDrones);
  };

  const saveDronesToStorage = (updatedDrones) => {
    localStorage.setItem('quality_drones', JSON.stringify(updatedDrones));
    setDrones(updatedDrones);

    const channel = new BroadcastChannel('erp_sync');
    channel.postMessage({ type: 'data_updated', timestamp: Date.now() });
    channel.close();
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ===== AUTO-SAVE CHECKLIST WITH DEBOUNCE =====
  const autoSaveChecklist = (droneId, newStatus) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveChecklistToStorage(droneId, newStatus);
  };

  // ===== START INSPECTION - LOAD SAVED DATA =====
  const startInspection = (drone) => {
    setSelectedDrone(drone);
    setActiveInspectionTab('checklist');

    const savedChecklist = loadChecklistFromStorage(drone.id);
    if (savedChecklist) {
      setChecklistStatus(savedChecklist);
    } else {
      const init = {};
      CHECKLIST_ITEMS.forEach(i => { init[i.id] = { result: 'pending', remarks: '' }; });
      setChecklistStatus(init);
    }

    const savedFlightTest = loadFlightTestFromStorage(drone.id);
    if (savedFlightTest) {
      setFlightTest(savedFlightTest);
    } else {
      setFlightTest({ pilotName: user.name, duration: '', altitude: '', stabilityRating: 5, result: 'pending', notes: '' });
    }

    const savedRemarks = loadRemarksFromStorage(drone.id);
    if (savedRemarks) {
      setInspectionRemarks(savedRemarks);
    } else {
      setInspectionRemarks(drone.remarks || '');
    }

    if (drone.status === 'pending') {
      const updatedDrones = drones.map(d => d.id === drone.id ? { ...d, status: 'in_progress', assignedTo: user.name } : d);
      saveDronesToStorage(updatedDrones);
    }
  };

  // ===== SET CHECKLIST ITEM WITH AUTO-SAVE =====
  const setCheckItem = (id, result, remarks) => {
    setChecklistStatus(prev => {
      const newStatus = {
        ...prev,
        [id]: { result, remarks: remarks ?? prev[id]?.remarks ?? '' }
      };
      if (selectedDrone) {
        autoSaveChecklist(selectedDrone.id, newStatus);
      }
      return newStatus;
    });
  };

  // ===== UPDATE CHECKLIST REMARKS WITH AUTO-SAVE =====
  const updateChecklistRemarks = (id, remarks) => {
    setChecklistStatus(prev => {
      const newStatus = {
        ...prev,
        [id]: { ...prev[id], remarks: remarks }
      };
      if (selectedDrone) {
        autoSaveChecklist(selectedDrone.id, newStatus);
      }
      return newStatus;
    });
  };

  // ===== UPDATE INSPECTION REMARKS WITH AUTO-SAVE =====
  const updateInspectionRemarks = (remarks) => {
    setInspectionRemarks(remarks);
    if (selectedDrone) {
      saveRemarksToStorage(selectedDrone.id, remarks);
    }
  };

  // ===== UPDATE FLIGHT TEST WITH AUTO-SAVE =====
  const updateFlightTest = (key, value) => {
    setFlightTest(prev => {
      const newFlightTest = { ...prev, [key]: value };
      if (selectedDrone) {
        saveFlightTestToStorage(selectedDrone.id, newFlightTest);
      }
      return newFlightTest;
    });
  };

  // ===== SAVE BUTTON - Manually save current progress =====
  const handleSaveProgress = () => {
    if (!selectedDrone) {
      showToast('No inspection in progress', 'error');
      return;
    }

    saveChecklistToStorage(selectedDrone.id, checklistStatus);
    saveFlightTestToStorage(selectedDrone.id, flightTest);
    saveRemarksToStorage(selectedDrone.id, inspectionRemarks);

    showToast('✅ Progress saved successfully!', 'success');
  };

  // ===== COMPLETE BUTTON - Mark inspection as completed =====
  const handleCompleteInspection = () => {
    if (!selectedDrone) {
      showToast('No inspection in progress', 'error');
      return;
    }

    const unchecked = CHECKLIST_ITEMS.length - getCheckedCount();
    if (unchecked > 0) {
      showToast(`Please complete all ${unchecked} remaining checklist items before completing.`, 'error');
      return;
    }

    setActiveInspectionTab('decision');
    showToast('📝 All checks completed! Please review and make a decision.', 'info');
  };

  const getCheckedCount = () => Object.values(checklistStatus).filter(v => v.result !== 'pending').length;
  const getFailedItems = () => CHECKLIST_ITEMS.filter(i => checklistStatus[i.id]?.result === 'fail');

  // ===== SUBMIT DECISION - Only Approve now =====
  const submitDecision = (decision) => {
    const unchecked = CHECKLIST_ITEMS.length - getCheckedCount();
    if (unchecked > 0 && decision === 'completed') {
      showToast(`Complete all ${unchecked} remaining checklist items before approving.`, 'error');
      return;
    }

    const updatedDrones = drones.map(d => d.id === selectedDrone.id
      ? { ...d, status: 'completed', remarks: inspectionRemarks, assignedTo: user.name, inspectedAt: new Date().toISOString() }
      : d
    );
    saveDronesToStorage(updatedDrones);

    localStorage.removeItem(`checklist_${selectedDrone.id}`);
    localStorage.removeItem(`flighttest_${selectedDrone.id}`);
    localStorage.removeItem(`inspection_remarks_${selectedDrone.id}`);

    showToast('✅ Drone approved and marked as Completed!');
    setSelectedDrone(null);
  };

  const saveProfile = () => {
    setUser(profileEdit);
    setShowProfile(false);
    showToast('Profile updated successfully.');
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const stats = {
    total: drones.length,
    pending: drones.filter(d => d.status === 'pending').length,
    inProgress: drones.filter(d => d.status === 'in_progress').length,
    completed: drones.filter(d => d.status === 'completed').length,
    rejected: drones.filter(d => d.status === 'rejected').length,
  };

  const filtered = drones
    .filter(d => filterStatus === 'all' || d.status === filterStatus)
    .filter(d => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return d.orderNumber.toLowerCase().includes(s) || d.droneModel.toLowerCase().includes(s)
        || d.droneSerial.toLowerCase().includes(s) || d.customerName.toLowerCase().includes(s);
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.productionDate) - new Date(a.productionDate);
      if (sortBy === 'model') return a.droneModel.localeCompare(b.droneModel);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const checkedCount = selectedDrone ? getCheckedCount() : 0;
  const totalItems = CHECKLIST_ITEMS.length;
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div style={{ background: THEME.bg, minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: THEME.textPrimary }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .anim { animation: slideDown 0.25s ease; }
        .btn-hover:hover { opacity: 0.87; transform: translateY(-1px); transition: all 0.15s; }
        .row-hover:hover { background: #F8FAFC !important; }
        input:focus, select:focus, textarea:focus { outline: 2px solid ${THEME.primary}; outline-offset: 1px; border-color: transparent !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .full-width-mobile { width: 100% !important; }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', left: isMobile ? '16px' : 'auto',
          zIndex: 9999,
          background: toastMsg.type === 'error' ? THEME.danger : toastMsg.type === 'info' ? THEME.info : THEME.primary,
          color: 'white', padding: '12px 18px', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', maxWidth: isMobile ? '100%' : '360px',
          animation: 'slideRight 0.25s ease', fontSize: '13px', fontWeight: '500'
        }}>
          {toastMsg.msg}
        </div>
      )}

      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primary} 60%, ${THEME.primaryLight} 100%)`,
        color: 'white', padding: '0 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', minHeight: '56px', boxShadow: '0 2px 10px rgba(6,79,59,0.3)',
        position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={LOGO} alt="GOAG" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.25)' }} />
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', letterSpacing: '0.02em' }}>GOAG DRONES</div>
            <div style={{ fontSize: '10px', opacity: 0.7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quality Control</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 6px' }} className="hide-mobile" />
          <div style={{ fontSize: '11px', opacity: 0.75 }} className="hide-mobile">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setProfileEdit({ ...user }); setShowProfile(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
          >
            {profileImage
              ? <img src={profileImage} alt="avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>{(user.name || 'Q')[0]}</div>
            }
            <span className="hide-mobile">{user.name}</span>
          </button>
          <button onClick={onLogout} className="btn-hover" style={{ padding: '5px 12px', background: THEME.danger, color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        background: THEME.surface, borderBottom: `1px solid ${THEME.border}`,
        padding: '0 12px', display: 'flex', gap: '2px', overflowX: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        {[
          { key: 'dashboard', label: isMobile ? '📊' : 'Dashboard', icon: '📊' },
          { key: 'completed', label: isMobile ? `✅${stats.completed}` : `Completed (${stats.completed})`, icon: '✅' },
          { key: 'analytics', label: isMobile ? '📈' : 'Reports', icon: '📈' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: isMobile ? '10px 12px' : '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: activeTab === tab.key ? '600' : '400', fontSize: isMobile ? '13px' : '13px',
            color: activeTab === tab.key ? THEME.primary : THEME.textSecondary,
            borderBottom: activeTab === tab.key ? `2px solid ${THEME.primary}` : '2px solid transparent',
            whiteSpace: 'nowrap', transition: 'all 0.15s'
          }}>
            {tab.icon} {!isMobile && tab.label}
            {isMobile && tab.key === 'completed' && ` ${stats.completed}`}
          </button>
        ))}
      </nav>

      <main style={{ padding: isMobile ? '12px' : '24px', maxWidth: '1280px', margin: '0 auto' }}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="anim">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '17px' : '20px', fontWeight: '700' }}>Quality Control Overview</h2>
              <span style={{ fontSize: '11px', color: THEME.textMuted, background: THEME.surfaceAlt, padding: '4px 12px', borderRadius: '20px', border: `1px solid ${THEME.border}` }}>
                Live · {drones.length} drones
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: isMobile ? '10px' : '14px',
              marginBottom: '20px'
            }}>
              <MetricCard label="Pending" value={stats.pending} sub="Awaiting" color={THEME.warning} icon="⏳" />
              <MetricCard label="In Progress" value={stats.inProgress} sub="Inspecting" color={THEME.info} icon="🔬" />
              <MetricCard label="Completed" value={stats.completed} sub="Ready" color={THEME.accent} icon="✅" />
            </div>

            <div style={{ background: THEME.surface, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Active Queue</span>
                <button onClick={() => window.location.reload()} style={{ fontSize: '12px', color: THEME.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Refresh →</button>
              </div>
              <DroneTable
                drones={drones.filter(d => d.status !== 'completed' && d.status !== 'rejected').slice(0, isMobile ? 3 : 5)}
                onStart={startInspection}
                showAction
              />
            </div>
          </div>
        )}

        {/* COMPLETED - Only shows completed status */}
        {activeTab === 'completed' && (
          <div className="anim">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: isMobile ? '17px' : '20px', fontWeight: '700' }}>Completed Inspections</h2>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                <input type="text" placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ padding: '7px 10px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '12px', flex: isMobile ? 1 : '0 0 160px', background: THEME.surface }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: '7px 10px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '12px', background: THEME.surface }}>
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <DroneTable
              drones={filtered.filter(d => d.status === 'completed')}
              onStart={startInspection}
              showAction={false}
              showRemarks
            />
          </div>
        )}

        {/* ANALYTICS - Reports with detailed views */}
        {activeTab === 'analytics' && (
          <ReportsSection drones={drones} />
        )}
      </main>

      {/* ===== INSPECTION MODAL ===== */}
      {selectedDrone && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 500, overflowY: 'auto', padding: isMobile ? '10px' : '20px' }}>
          <div style={{
            background: THEME.surface, borderRadius: '16px', width: isMobile ? '100%' : '900px',
            maxWidth: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', animation: 'slideDown 0.25s ease',
            marginBottom: '20px', maxHeight: 'calc(100vh - 20px)', display: 'flex', flexDirection: 'column'
          }}>

            {/* Modal Header */}
            <div style={{
              padding: isMobile ? '14px 16px' : '20px 24px', borderBottom: `1px solid ${THEME.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: `linear-gradient(135deg, ${THEME.primaryDark} 0%, ${THEME.primary} 100%)`,
              borderRadius: '16px 16px 0 0', flexShrink: 0
            }}>
              <div>
                <h2 style={{ margin: 0, color: 'white', fontSize: isMobile ? '15px' : '18px', fontWeight: '700' }}>🔬 Drone Inspection</h2>
                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: isMobile ? '11px' : '12px' }}>{selectedDrone.orderNumber} · {selectedDrone.droneSerial}</p>
              </div>
              <button onClick={() => setSelectedDrone(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Drone Info Banner */}
            <div style={{
              display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: isMobile ? '4px' : '0', background: '#F8FAFC', padding: isMobile ? '10px 14px' : '12px 24px',
              borderBottom: `1px solid ${THEME.border}`, flexShrink: 0
            }}>
              {[
                { l: 'Model', v: selectedDrone.droneModel },
                { l: 'Customer', v: selectedDrone.customerName },
                { l: 'Prod. Date', v: selectedDrone.productionDate },
                { l: 'Inspector', v: user.name },
              ].map(({ l, v }) => (
                <div key={l} style={{ padding: '4px 0' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', textTransform: 'uppercase', color: THEME.textMuted, letterSpacing: '0.05em' }}>{l}</div>
                  <div style={{ fontSize: isMobile ? '11px' : '13px', fontWeight: '600', marginTop: '1px', wordBreak: 'break-word' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div style={{ padding: isMobile ? '8px 14px' : '12px 24px', background: THEME.surfaceAlt, borderBottom: `1px solid ${THEME.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '11px' : '12px', marginBottom: '4px' }}>
                <span style={{ color: THEME.textSecondary, fontWeight: '500' }}>Progress</span>
                <span style={{ fontWeight: '700', color: progressPct === 100 ? THEME.accent : THEME.primary }}>{checkedCount}/{totalItems} · {progressPct}%</span>
              </div>
              <div style={{ height: '5px', background: THEME.border, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progressPct}%`, background: progressPct === 100 ? THEME.accent : THEME.primary, borderRadius: '3px', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Inner Tabs */}
            <div style={{
              display: 'flex', gap: '0', borderBottom: `1px solid ${THEME.border}`,
              padding: isMobile ? '0 12px' : '0 24px', background: THEME.surface, overflowX: 'auto', flexShrink: 0
            }}>
              {[{ key: 'checklist', label: '📋 Checklist' }, { key: 'flight', label: '✈️ Flight' }, { key: 'decision', label: '📝 Decision' }].map(t => (
                <button key={t.key} onClick={() => setActiveInspectionTab(t.key)} style={{
                  padding: isMobile ? '10px 12px' : '12px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? '12px' : '13px',
                  fontWeight: activeInspectionTab === t.key ? '600' : '400',
                  color: activeInspectionTab === t.key ? THEME.primary : THEME.textSecondary,
                  borderBottom: activeInspectionTab === t.key ? `2px solid ${THEME.primary}` : '2px solid transparent',
                  whiteSpace: 'nowrap'
                }}>{t.label}</button>
              ))}
            </div>

            <div style={{ padding: isMobile ? '14px' : '20px 24px', overflowY: 'auto', flex: 1 }}>

              {/* CHECKLIST TAB */}
              {activeInspectionTab === 'checklist' && (
                <div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: THEME.textMuted, marginBottom: '12px' }}>
                    Mark each item as Pass or Fail. Add remarks for any failure. <span style={{ color: THEME.accent, fontWeight: '600' }}>✓ Auto-saved</span>
                  </div>
                  {CHECKLIST_CATEGORIES.map(cat => {
                    const items = CHECKLIST_ITEMS.filter(i => i.category === cat.key);
                    const catPassed = items.filter(i => checklistStatus[i.id]?.result === 'pass').length;
                    const catFailed = items.filter(i => checklistStatus[i.id]?.result === 'fail').length;
                    return (
                      <div key={cat.key} style={{ background: THEME.surfaceAlt, borderRadius: '10px', padding: isMobile ? '10px 12px' : '14px 16px', marginBottom: '10px', border: `1px solid ${THEME.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: isMobile ? '12px' : '13px', color: THEME.primary }}>{cat.icon} {cat.label}</span>
                          <span style={{ fontSize: '10px', color: catFailed > 0 ? THEME.danger : THEME.textMuted }}>
                            {catPassed} ✓ · {catFailed} ✗
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {items.map(item => {
                            const cs = checklistStatus[item.id] || {};
                            return (
                              <div key={item.id} style={{ background: THEME.surface, borderRadius: '6px', padding: isMobile ? '8px 10px' : '10px 12px', border: `1px solid ${cs.result === 'fail' ? '#FECACA' : cs.result === 'pass' ? '#A7F3D0' : THEME.border}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                  <div style={{ flex: 1, minWidth: isMobile ? '120px' : 'auto' }}>
                                    <span style={{ fontWeight: '500', fontSize: isMobile ? '12px' : '13px' }}>{item.name}</span>
                                    <span style={{ fontSize: '10px', color: THEME.textMuted, marginLeft: '4px', display: isMobile ? 'block' : 'inline' }}>{item.description}</span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                    <button
                                      onClick={() => setCheckItem(item.id, 'pass', cs.remarks || '')}
                                      style={{
                                        padding: isMobile ? '3px 10px' : '4px 14px',
                                        background: cs.result === 'pass' ? '#059669' : '#E5E7EB',
                                        color: cs.result === 'pass' ? 'white' : THEME.textSecondary,
                                        border: 'none', borderRadius: '4px',
                                        cursor: 'pointer', fontSize: isMobile ? '11px' : '12px',
                                        fontWeight: '600',
                                        transition: 'all 0.15s'
                                      }}
                                    >
                                      ✓ Pass
                                    </button>
                                    <button
                                      onClick={() => setCheckItem(item.id, 'fail', cs.remarks || '')}
                                      style={{
                                        padding: isMobile ? '3px 10px' : '4px 14px',
                                        background: cs.result === 'fail' ? THEME.danger : '#E5E7EB',
                                        color: cs.result === 'fail' ? 'white' : THEME.textSecondary,
                                        border: 'none', borderRadius: '4px',
                                        cursor: 'pointer', fontSize: isMobile ? '11px' : '12px',
                                        fontWeight: '600',
                                        transition: 'all 0.15s'
                                      }}
                                    >
                                      ✗ Fail
                                    </button>
                                  </div>
                                </div>
                                {cs.result && (
                                  <div style={{ marginTop: '6px' }}>
                                    <input
                                      type="text"
                                      placeholder={cs.result === 'fail' ? "Describe the failure reason…" : "Add optional note..."}
                                      value={cs.remarks || ''}
                                      onChange={e => updateChecklistRemarks(item.id, e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '5px 8px',
                                        border: `1px solid ${cs.result === 'fail' ? '#FECACA' : '#D1FAE5'}`,
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        background: cs.result === 'fail' ? '#FFF5F5' : '#F0FDF4',
                                        transition: 'all 0.15s'
                                      }}
                                    />
                                    {cs.result === 'fail' && (
                                      <div style={{ fontSize: '9px', color: THEME.danger, marginTop: '2px' }}>
                                        ⚠️ Failure reason required
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* SAVE & COMPLETE BUTTONS */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${THEME.border}`,
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    <button
                      onClick={handleSaveProgress}
                      className="btn-hover"
                      style={{
                        flex: 1,
                        padding: isMobile ? '12px' : '10px 20px',
                        background: THEME.info,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: isMobile ? '14px' : '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      💾 Save Progress
                    </button>
                    <button
                      onClick={handleCompleteInspection}
                      className="btn-hover"
                      style={{
                        flex: 1,
                        padding: isMobile ? '12px' : '10px 20px',
                        background: checkedCount === totalItems ? THEME.accent : THEME.border,
                        color: checkedCount === totalItems ? 'white' : THEME.textMuted,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: checkedCount === totalItems ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                        fontSize: isMobile ? '14px' : '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        opacity: checkedCount === totalItems ? 1 : 0.6
                      }}
                      disabled={checkedCount !== totalItems}
                      title={checkedCount !== totalItems ? `Complete ${totalItems - checkedCount} more items` : ''}
                    >
                      ✅ Complete ({checkedCount}/{totalItems})
                    </button>
                  </div>
                </div>
              )}

              {/* FLIGHT TEST TAB */}
              {activeInspectionTab === 'flight' && (
                <div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: THEME.textMuted, marginBottom: '12px' }}>
                    Complete the flight test and record all observations. <span style={{ color: THEME.accent, fontWeight: '600' }}>✓ Auto-saved</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    {[
                      { label: 'Test Pilot', key: 'pilotName', type: 'text', placeholder: 'Full name' },
                      { label: 'Flight Duration (min)', key: 'duration', type: 'number', placeholder: 'e.g. 15' },
                      { label: 'Max Altitude (m)', key: 'altitude', type: 'number', placeholder: 'e.g. 120' },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: THEME.textSecondary, marginBottom: '3px' }}>{f.label}</label>
                        <input
                          type={f.type}
                          value={flightTest[f.key] || ''}
                          placeholder={f.placeholder}
                          onChange={e => updateFlightTest(f.key, e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', border: `1px solid ${THEME.border}`, borderRadius: '6px', fontSize: isMobile ? '12px' : '13px' }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: THEME.textSecondary, marginBottom: '3px' }}>Flight Outcome</label>
                      <select
                        value={flightTest.result}
                        onChange={e => updateFlightTest('result', e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', border: `1px solid ${THEME.border}`, borderRadius: '6px', fontSize: isMobile ? '12px' : '13px', background: THEME.surface }}>
                        <option value="pending">Pending</option>
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: THEME.textSecondary, marginBottom: '3px' }}>Stability Rating</label>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {[1, 2, 3, 4, 5].map(r => (
                        <button
                          key={r}
                          onClick={() => updateFlightTest('stabilityRating', r)}
                          style={{
                            width: isMobile ? '36px' : '44px',
                            height: isMobile ? '36px' : '44px',
                            border: `2px solid ${flightTest.stabilityRating >= r ? THEME.primary : THEME.border}`,
                            background: flightTest.stabilityRating >= r ? THEME.primary : THEME.surface,
                            color: flightTest.stabilityRating >= r ? 'white' : THEME.textSecondary,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: isMobile ? '13px' : '14px',
                            transition: 'all 0.15s'
                          }}>
                          {r}
                        </button>
                      ))}
                      <span style={{ alignSelf: 'center', marginLeft: '6px', fontSize: '11px', color: THEME.textMuted }}>
                        {['', 'Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'][flightTest.stabilityRating]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: THEME.textSecondary, marginBottom: '3px' }}>Flight Observations</label>
                    <textarea
                      rows={isMobile ? 3 : 4}
                      value={flightTest.notes || ''}
                      onChange={e => updateFlightTest('notes', e.target.value)}
                      placeholder="Note anomalies, vibrations, GPS drift, hover instability, RTH accuracy…"
                      style={{ width: '100%', padding: '8px 10px', border: `1px solid ${THEME.border}`, borderRadius: '6px', fontSize: isMobile ? '12px' : '13px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {/* DECISION TAB - Only Approve button */}
              {activeInspectionTab === 'decision' && (
                <div>
                  {getFailedItems().length > 0 && (
                    <div style={{ background: '#FEF2F2', border: `1px solid #FECACA`, borderRadius: '8px', padding: '12px 14px', marginBottom: '14px' }}>
                      <div style={{ fontWeight: '600', color: THEME.danger, marginBottom: '6px', fontSize: isMobile ? '12px' : '13px' }}>⚠️ Failed Items ({getFailedItems().length})</div>
                      {getFailedItems().map(item => (
                        <div key={item.id} style={{ fontSize: '11px', color: THEME.danger, padding: '2px 0' }}>
                          • {item.name}{checklistStatus[item.id]?.remarks ? ` — ${checklistStatus[item.id].remarks}` : ''}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: isMobile ? '12px' : '13px', marginBottom: '4px' }}>Inspector Remarks</label>
                    <textarea
                      rows={isMobile ? 3 : 4}
                      value={inspectionRemarks}
                      onChange={e => updateInspectionRemarks(e.target.value)}
                      placeholder="Summary of inspection outcome, findings, and conditions…"
                      style={{ width: '100%', padding: '8px 10px', border: `1px solid ${THEME.border}`, borderRadius: '6px', fontSize: isMobile ? '12px' : '13px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ background: THEME.surfaceAlt, borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', fontSize: isMobile ? '11px' : '12px', color: THEME.textSecondary, border: `1px solid ${THEME.border}` }}>
                    <strong>Summary:</strong> {checkedCount}/{totalItems} completed · {getFailedItems().length} failures · Flight: {flightTest.result}
                  </div>

                  <div>
                    <button
                      onClick={() => submitDecision('completed')}
                      className="btn-hover"
                      style={{
                        width: '100%',
                        padding: isMobile ? '14px' : '16px',
                        background: THEME.accent,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: isMobile ? '16px' : '17px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      ✅ Approve & Complete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== PROFILE MODAL ===== */}
      {showProfile && profileEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: '16px' }}>
          <div style={{ background: THEME.surface, borderRadius: '16px', width: isMobile ? '100%' : '460px', maxWidth: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', animation: 'slideDown 0.25s ease' }}>
            <div style={{ padding: isMobile ? '14px 16px' : '20px 24px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? '15px' : '16px', fontWeight: '700' }}>Edit Profile</h3>
              <button onClick={() => setShowProfile(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: THEME.textMuted }}>×</button>
            </div>
            <div style={{ padding: isMobile ? '16px' : '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  {profileImage
                    ? <img src={profileImage} alt="avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${THEME.primary}` }} />
                    : <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', color: 'white', border: `3px solid ${THEME.primary}` }}>
                      {(profileEdit.name || 'Q')[0]}
                    </div>
                  }
                  <button onClick={() => fileInputRef.current.click()}
                    style={{ position: 'absolute', bottom: 0, right: 0, background: THEME.primary, border: '2px solid white', color: 'white', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ✎
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImageChange} />
                <span style={{ fontSize: '11px', color: THEME.textMuted }}>Click the pencil to change photo</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 9876543210' },
                  { label: 'Role', key: 'role', type: 'text', disabled: true },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: THEME.textSecondary, marginBottom: '3px' }}>{f.label}</label>
                    <input
                      type={f.type} value={profileEdit[f.key] || ''} placeholder={f.placeholder || ''}
                      disabled={f.disabled}
                      onChange={e => setProfileEdit({ ...profileEdit, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: `1px solid ${THEME.border}`, borderRadius: '6px', fontSize: isMobile ? '13px' : '14px', background: f.disabled ? THEME.surfaceAlt : THEME.surface, color: f.disabled ? THEME.textMuted : THEME.textPrimary }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <button onClick={() => setShowProfile(false)} style={{ flex: 1, padding: '9px', background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Cancel</button>
                <button onClick={saveProfile} className="btn-hover" style={{ flex: 1, padding: '9px', background: THEME.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}