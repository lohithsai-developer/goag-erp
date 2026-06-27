const express = require('express');
const router = express.Router();

// Inventory Data
let inventory = [
    { id: 1, name: 'Carbon Fiber Frame', sku: 'FRM-001', quantity: 50, minStock: 20, unitPrice: 2500, category: 'Frame', supplier: 'CarbonTech Ltd' },
    { id: 2, name: 'Brushless Motor', sku: 'MTR-001', quantity: 120, minStock: 50, unitPrice: 1800, category: 'Motor', supplier: 'MotorWorld' },
    { id: 3, name: 'Flight Controller', sku: 'FC-001', quantity: 35, minStock: 15, unitPrice: 4500, category: 'Electronics', supplier: 'DJI Supplier' },
    { id: 4, name: 'LiPo Battery 6S', sku: 'BAT-001', quantity: 80, minStock: 30, unitPrice: 3200, category: 'Battery', supplier: 'BatteryHub' },
    { id: 5, name: 'Propeller Set', sku: 'PROP-001', quantity: 200, minStock: 100, unitPrice: 800, category: 'Propeller', supplier: 'PropellerCo' },
    { id: 6, name: 'GPS Module', sku: 'GPS-001', quantity: 45, minStock: 20, unitPrice: 1500, category: 'Electronics', supplier: 'GPSupply' },
    { id: 7, name: 'Landing Gear', sku: 'LG-001', quantity: 60, minStock: 25, unitPrice: 1200, category: 'Frame', supplier: 'CarbonTech Ltd' },
    { id: 8, name: 'Camera Mount', sku: 'CAM-001', quantity: 30, minStock: 10, unitPrice: 900, category: 'Accessory', supplier: 'AccessoryPro' }
];

// Financial Transactions
let transactions = [
    { id: 1, date: '2026-04-01', type: 'income', category: 'Drone Sale', amount: 295000, description: 'ORD-001 - GOAG AgriSpray X1', status: 'completed' },
    { id: 2, date: '2026-04-05', type: 'income', category: 'Drone Sale', amount: 218300, description: 'ORD-002 - GOAG Survey Pro', status: 'completed' },
    { id: 3, date: '2026-04-10', type: 'expense', category: 'Raw Material', amount: 85000, description: 'Frame and motor purchase', status: 'completed' },
    { id: 4, date: '2026-04-12', type: 'expense', category: 'Salary', amount: 150000, description: 'April salaries', status: 'completed' },
    { id: 5, date: '2026-04-15', type: 'income', category: 'Drone Sale', amount: 265500, description: 'ORD-003 - GOAG Cargo Mover', status: 'pending' },
    { id: 6, date: '2026-04-16', type: 'expense', category: 'Rent', amount: 50000, description: 'Office rent', status: 'completed' },
    { id: 7, date: '2026-04-18', type: 'expense', category: 'Utilities', amount: 12000, description: 'Electricity and internet', status: 'completed' }
];

// Invoices
let invoices = [
    { id: 1, invoiceNumber: 'INV-001', orderNumber: 'ORD-001', customerName: 'Green Fields Farm', amount: 295000, status: 'paid', date: '2026-04-10', dueDate: '2026-04-25' },
    { id: 2, invoiceNumber: 'INV-002', orderNumber: 'ORD-002', customerName: 'AgriTech Solutions', amount: 218300, status: 'paid', date: '2026-04-12', dueDate: '2026-04-27' },
    { id: 3, invoiceNumber: 'INV-003', orderNumber: 'ORD-003', customerName: 'GUTHHIKONDA LOHITH SAI', amount: 265500, status: 'pending', date: '2026-04-15', dueDate: '2026-04-30' }
];

// Purchase Orders
let purchaseOrders = [
    { id: 1, poNumber: 'PO-001', supplier: 'CarbonTech Ltd', items: 'Carbon Fiber Frames', quantity: 20, totalAmount: 50000, status: 'delivered', orderDate: '2026-04-05', expectedDate: '2026-04-12' },
    { id: 2, poNumber: 'PO-002', supplier: 'MotorWorld', items: 'Brushless Motors', quantity: 50, totalAmount: 90000, status: 'pending', orderDate: '2026-04-15', expectedDate: '2026-04-25' }
];

// ============ INVENTORY ROUTES ============

// Get all inventory
router.get('/inventory', (req, res) => {
    const lowStock = inventory.filter(i => i.quantity <= i.minStock);
    res.json({ success: true, inventory, lowStock });
});

// Add inventory item
router.post('/inventory/add', (req, res) => {
    const { name, sku, quantity, minStock, unitPrice, category, supplier } = req.body;
    const newItem = {
        id: inventory.length + 1,
        name, sku, quantity: parseInt(quantity), minStock: parseInt(minStock),
        unitPrice: parseInt(unitPrice), category, supplier
    };
    inventory.push(newItem);
    res.json({ success: true, message: 'Item added', item: newItem });
});

// Update inventory quantity
router.put('/inventory/:id/quantity', (req, res) => {
    const { id } = req.params;
    const { quantity, type } = req.body;
    const item = inventory.find(i => i.id === parseInt(id));
    if (item) {
        if (type === 'add') item.quantity += parseInt(quantity);
        else if (type === 'remove') item.quantity -= parseInt(quantity);
        res.json({ success: true, message: 'Stock updated', item });
    } else {
        res.status(404).json({ success: false, message: 'Item not found' });
    }
});

// ============ FINANCIAL ROUTES ============

// Get all transactions
router.get('/transactions', (req, res) => {
    res.json({ success: true, transactions });
});

// Add transaction
router.post('/transactions/add', (req, res) => {
    const { type, category, amount, description } = req.body;
    const newTransaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split('T')[0],
        type, category, amount: parseInt(amount), description, status: 'completed'
    };
    transactions.push(newTransaction);
    res.json({ success: true, message: 'Transaction added', transaction: newTransaction });
});

// Get financial summary
router.get('/financial/summary', (req, res) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const pendingIncome = transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpense;
    
    // Monthly breakdown
    const monthlyData = {};
    transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
        if (t.type === 'income') monthlyData[month].income += t.amount;
        else monthlyData[month].expense += t.amount;
    });
    
    res.json({
        success: true,
        summary: {
            totalIncome,
            totalExpense,
            profit,
            pendingIncome,
            profitMargin: totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0
        },
        monthlyData
    });
});

// ============ INVOICE ROUTES ============

// Get all invoices
router.get('/invoices', (req, res) => {
    res.json({ success: true, invoices });
});

// Update invoice status
router.put('/invoices/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const invoice = invoices.find(i => i.id === parseInt(id));
    if (invoice) {
        invoice.status = status;
        res.json({ success: true, message: `Invoice ${status}`, invoice });
    } else {
        res.status(404).json({ success: false, message: 'Invoice not found' });
    }
});

// ============ PURCHASE ORDER ROUTES ============

// Get all purchase orders
router.get('/purchase-orders', (req, res) => {
    res.json({ success: true, purchaseOrders });
});

// Add purchase order
router.post('/purchase-orders/add', (req, res) => {
    const { supplier, items, quantity, totalAmount } = req.body;
    const newPO = {
        id: purchaseOrders.length + 1,
        poNumber: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
        supplier, items, quantity: parseInt(quantity), totalAmount: parseInt(totalAmount),
        status: 'pending', orderDate: new Date().toISOString().split('T')[0],
        expectedDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    purchaseOrders.push(newPO);
    res.json({ success: true, message: 'Purchase order created', po: newPO });
});

// Update PO status
router.put('/purchase-orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const po = purchaseOrders.find(p => p.id === parseInt(id));
    if (po) {
        po.status = status;
        res.json({ success: true, message: `PO ${status}`, po });
    } else {
        res.status(404).json({ success: false, message: 'PO not found' });
    }
});

module.exports = router;
