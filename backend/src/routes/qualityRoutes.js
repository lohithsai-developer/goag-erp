const express = require('express');
const router = express.Router();

// Sample drones ready for quality check
let qualityChecks = [
    {
        id: 1,
        orderNumber: 'ORD-001',
        droneModel: 'GOAG AgriSpray X1',
        droneSerial: 'AG-2024-001',
        customerName: 'Green Fields Farm',
        productionDate: '2026-04-18',
        status: 'pending', // pending, approved, rejected
        inspector: null,
        inspectionDate: null,
        remarks: null,
        images: [],
        checklist: {
            frameAssembly: null,
            motorMounting: null,
            wiring: null,
            flightController: null,
            batteryConnection: null,
            propellerBalance: null,
            gpsFunction: null,
            cameraCalibration: null
        }
    },
    {
        id: 2,
        orderNumber: 'ORD-002',
        droneModel: 'GOAG Survey Pro',
        droneSerial: 'SV-2024-045',
        customerName: 'AgriTech Solutions',
        productionDate: '2026-04-17',
        status: 'in_progress',
        inspector: 'Priya Singh',
        inspectionDate: null,
        remarks: null,
        images: [],
        checklist: {
            frameAssembly: null,
            motorMounting: null,
            wiring: null,
            flightController: null,
            batteryConnection: null,
            propellerBalance: null,
            gpsFunction: null,
            cameraCalibration: null
        }
    }
];

// Quality Checklist Template
const checklistTemplate = [
    { id: 'frameAssembly', name: 'Frame Assembly', description: 'Frame properly assembled, no cracks' },
    { id: 'motorMounting', name: 'Motor Mounting', description: 'Motors securely mounted, spinning freely' },
    { id: 'wiring', name: 'Wiring & Connections', description: 'All wires properly connected, no loose ends' },
    { id: 'flightController', name: 'Flight Controller', description: 'Flight controller calibrated and responding' },
    { id: 'batteryConnection', name: 'Battery Connection', description: 'Battery terminals secure, voltage normal' },
    { id: 'propellerBalance', name: 'Propeller Balance', description: 'Propellers balanced and properly attached' },
    { id: 'gpsFunction', name: 'GPS Function', description: 'GPS signal strong, position locked' },
    { id: 'cameraCalibration', name: 'Camera Calibration', description: 'Camera focused and calibrated' }
];

// Get all quality checks
router.get('/checks', (req, res) => {
    const stats = {
        total: qualityChecks.length,
        pending: qualityChecks.filter(c => c.status === 'pending').length,
        in_progress: qualityChecks.filter(c => c.status === 'in_progress').length,
        approved: qualityChecks.filter(c => c.status === 'approved').length,
        rejected: qualityChecks.filter(c => c.status === 'rejected').length
    };
    res.json({ success: true, checks: qualityChecks, stats, checklist: checklistTemplate });
});

// Get single quality check
router.get('/checks/:id', (req, res) => {
    const check = qualityChecks.find(c => c.id === parseInt(req.params.id));
    res.json({ success: true, check, checklist: checklistTemplate });
});

// Start inspection
router.put('/checks/:id/start', (req, res) => {
    const { id } = req.params;
    const { inspector } = req.body;
    const check = qualityChecks.find(c => c.id === parseInt(id));
    
    if (check) {
        check.status = 'in_progress';
        check.inspector = inspector;
        check.inspectionDate = new Date().toISOString();
        res.json({ success: true, message: 'Inspection started', check });
    } else {
        res.status(404).json({ success: false, message: 'Check not found' });
    }
});

// Update checklist item
router.put('/checks/:id/checklist/:itemId', (req, res) => {
    const { id, itemId } = req.params;
    const { status, remarks } = req.body;
    const check = qualityChecks.find(c => c.id === parseInt(id));
    
    if (check && check.checklist[itemId] !== undefined) {
        check.checklist[itemId] = { status, remarks, checkedAt: new Date().toISOString() };
        res.json({ success: true, message: 'Checklist updated', check });
    } else {
        res.status(404).json({ success: false, message: 'Check or item not found' });
    }
});

// Upload inspection image
router.post('/checks/:id/upload-image', (req, res) => {
    const { id } = req.params;
    const { imageUrl, caption } = req.body;
    const check = qualityChecks.find(c => c.id === parseInt(id));
    
    if (check) {
        check.images.push({ url: imageUrl, caption, uploadedAt: new Date().toISOString() });
        res.json({ success: true, message: 'Image uploaded', images: check.images });
    } else {
        res.status(404).json({ success: false, message: 'Check not found' });
    }
});

// Approve or reject drone
router.put('/checks/:id/decision', (req, res) => {
    const { id } = req.params;
    const { decision, remarks } = req.body;
    const check = qualityChecks.find(c => c.id === parseInt(id));
    
    if (check) {
        check.status = decision;
        check.remarks = remarks;
        check.completedAt = new Date().toISOString();
        
        let message = decision === 'approved' 
            ? 'Drone approved! Ready for delivery.' 
            : 'Drone rejected! Sent back to production.';
        
        res.json({ success: true, message, check });
    } else {
        res.status(404).json({ success: false, message: 'Check not found' });
    }
});

// Get statistics
router.get('/stats', (req, res) => {
    const total = qualityChecks.length;
    const approved = qualityChecks.filter(c => c.status === 'approved').length;
    const rejected = qualityChecks.filter(c => c.status === 'rejected').length;
    const pending = qualityChecks.filter(c => c.status === 'pending').length;
    
    res.json({
        success: true,
        stats: {
            total,
            approved,
            rejected,
            pending,
            approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0
        }
    });
});

module.exports = router;