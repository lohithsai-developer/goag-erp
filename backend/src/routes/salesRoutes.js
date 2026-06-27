const express = require('express');
const router = express.Router();

// ============ DATA STORAGE (In-memory) ============

// Customers
let customers = [
    { 
        id: 1, 
        name: 'Green Fields Farm', 
        email: 'contact@greenfields.com', 
        phone: '9876543210', 
        address: 'Pune',
        city: 'Pune',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        gst: '27ABCDE1234F1Z',
        createdDate: '2026-04-01'
    },
    { 
        id: 2, 
        name: 'AgriTech Solutions', 
        email: 'info@agritech.com', 
        phone: '9876543211', 
        address: 'Andheri East',
        city: 'Mumbai',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        pincode: '400093',
        gst: '27FGHIJ5678K2Z',
        createdDate: '2026-04-05'
    },
    { 
        id: 3, 
        name: 'GUTHHIKONDA LOHITH SAI', 
        email: 'lohith.gutikonda07@gmail.com', 
        phone: '9441728444', 
        address: 'Near rice mill, veerisettigudem',
        city: 'Kamavarapukota',
        district: 'Eluru',
        state: 'Andhra Pradesh',
        pincode: '534452',
        gst: '37ABCDE1234F1Z',
        createdDate: '2026-04-15'
    }
];

// Pre-defined Drone Models
const droneModels = [
    { id: 1, name: 'GOAG AgriSpray X1', price: 125000, taxRate: 18, description: 'Agricultural spraying drone, 10L capacity' },
    { id: 2, name: 'GOAG Survey Pro', price: 185000, taxRate: 18, description: 'Surveying drone with 4K camera' },
    { id: 3, name: 'GOAG Cargo Mover', price: 225000, taxRate: 18, description: 'Logistics drone, 5kg payload' },
    { id: 4, name: 'GOAG Sprayer Plus', price: 145000, taxRate: 18, description: 'Advanced spraying drone' }
];

// Custom Drone Models (user added)
let customDroneModels = [];

// Custom Add-ons
let customAddons = [
    { id: 1, name: 'Fast Charger', price: 3500, category: 'Accessories', description: 'Quick charging station for drones' },
    { id: 2, name: 'Extra Battery Pack', price: 4500, category: 'Battery', description: '6S LiPo battery spare' },
    { id: 3, name: 'Carrying Case', price: 2500, category: 'Storage', description: 'Professional hard case' },
    { id: 4, name: 'Propeller Guard', price: 1200, category: 'Safety', description: 'Safety propeller guards' },
    { id: 5, name: 'HD Camera Kit', price: 8500, category: 'Camera', description: '4K camera attachment' },
    { id: 6, name: 'WiFi Module', price: 1800, category: 'Connectivity', description: 'Long range WiFi module' }
];

// Quotations
let quotations = [
    { 
        id: 1, 
        number: 'QT-001', 
        customerId: 1,
        customerName: 'Green Fields Farm',
        customerPhone: '9876543210',
        droneModel: 'GOAG AgriSpray X1', 
        quantity: 2, 
        unitPrice: 125000, 
        total: 250000, 
        tax: 45000, 
        grandTotal: 295000, 
        status: 'approved',
        createdDate: '2026-04-10',
        validUntil: '2026-05-10',
        orderNumber: 'ORD-001'
    },
    { 
        id: 2, 
        number: 'QT-002', 
        customerId: 2,
        customerName: 'AgriTech Solutions',
        customerPhone: '9876543211',
        droneModel: 'GOAG Survey Pro', 
        quantity: 1, 
        unitPrice: 185000, 
        total: 185000, 
        tax: 33300, 
        grandTotal: 218300, 
        status: 'pending',
        createdDate: '2026-04-11',
        validUntil: '2026-05-11'
    },
    { 
        id: 3, 
        number: 'QT-003', 
        customerId: 3,
        customerName: 'GUTHHIKONDA LOHITH SAI',
        customerPhone: '9441728444',
        droneModel: 'GOAG Cargo Mover', 
        quantity: 1, 
        unitPrice: 225000, 
        total: 225000, 
        tax: 40500, 
        grandTotal: 265500, 
        status: 'pending',
        createdDate: '2026-04-15',
        validUntil: '2026-05-15'
    }
];

// Orders
let orders = [
    {
        id: 1,
        orderNumber: 'ORD-001',
        customerId: 'GOAG-001',
        customerName: 'Green Fields Farm',
        droneModel: 'GOAG AgriSpray X1',
        quantity: 2,
        totalAmount: 295000,
        status: 'in_production',
        orderDate: '2026-04-10',
        expectedDelivery: '2026-04-25'
    }
];

let customerIdCounter = 3;

// Helper Functions
function generateCustomerId() {
    customerIdCounter++;
    return `GOAG-${String(customerIdCounter).padStart(3, '0')}`;
}

function generateOrderNumber() {
    const nextId = orders.length + 1;
    return `ORD-${String(nextId).padStart(3, '0')}`;
}

function generateQuotationNumber() {
    const nextId = quotations.length + 1;
    return `QT-${String(nextId).padStart(3, '0')}`;
}

// ============ CUSTOMER ROUTES ============

// Get all customers
router.get('/customers', (req, res) => {
    res.json({ success: true, customers });
});

// Get single customer by ID
router.get('/customers/:id', (req, res) => {
    const customer = customers.find(c => c.id === parseInt(req.params.id));
    if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
});

// Add new customer
router.post('/customers/add', (req, res) => {
    const { name, email, phone, address, city, district, state, pincode, gst } = req.body;
    
    const newCustomer = {
        id: customers.length + 1,
        name,
        email: email || '',
        phone,
        address,
        city,
        district,
        state,
        pincode,
        gst: gst || '',
        createdDate: new Date().toISOString().split('T')[0]
    };
    customers.push(newCustomer);
    res.json({ 
        success: true, 
        message: `Customer ${name} added successfully!`, 
        customer: newCustomer 
    });
});

// ============ DRONE MODEL ROUTES ============

// Get all drone models (pre-defined + custom)
router.get('/drone-models', (req, res) => {
    const allDrones = [...droneModels, ...customDroneModels];
    res.json({ success: true, drones: allDrones });
});

// Add custom drone model
router.post('/custom-drone-models/add', (req, res) => {
    const { name, price, description, taxRate } = req.body;
    const newDrone = {
        id: customDroneModels.length + 100,
        name,
        price: parseInt(price),
        taxRate: taxRate || 18,
        description: description || 'Custom drone model',
        isCustom: true,
        createdDate: new Date().toISOString().split('T')[0]
    };
    customDroneModels.push(newDrone);
    res.json({ success: true, message: 'Custom drone model added successfully', drone: newDrone });
});

// Delete custom drone model
router.delete('/custom-drone-models/:id', (req, res) => {
    const { id } = req.params;
    const index = customDroneModels.findIndex(d => d.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Drone model not found' });
    }
    customDroneModels.splice(index, 1);
    res.json({ success: true, message: 'Custom drone model deleted' });
});

// ============ ADD-ON ROUTES ============

// Get all custom add-ons
router.get('/custom-products', (req, res) => {
    res.json({ success: true, products: customAddons });
});

// Add custom add-on
router.post('/custom-products/add', (req, res) => {
    const { name, price, description, category } = req.body;
    const newAddon = {
        id: customAddons.length + 100,
        name,
        price: parseInt(price),
        description: description || '',
        category: category || 'Custom',
        createdDate: new Date().toISOString().split('T')[0]
    };
    customAddons.push(newAddon);
    res.json({ success: true, message: 'Add-on added successfully', product: newAddon });
});

// Delete custom add-on
router.delete('/custom-products/:id', (req, res) => {
    const { id } = req.params;
    const index = customAddons.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Add-on not found' });
    }
    customAddons.splice(index, 1);
    res.json({ success: true, message: 'Add-on deleted' });
});

// ============ QUOTATION ROUTES ============

// Get all quotations
router.get('/quotations', (req, res) => {
    res.json({ success: true, quotations });
});

// Get single quotation
router.get('/quotations/:id', (req, res) => {
    const quotation = quotations.find(q => q.id === parseInt(req.params.id));
    if (!quotation) {
        return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    res.json({ success: true, quotation });
});

// Create pre-filled quotation
router.post('/quotation/prefilled/create', (req, res) => {
    const { customerId, customerName, customerPhone, droneModelId, quantity, unitPrice, total, tax, grandTotal, taxRate } = req.body;
    
    const selectedDrone = droneModels.find(d => d.id === parseInt(droneModelId));
    
    const newQuotation = {
        id: quotations.length + 1,
        number: generateQuotationNumber(),
        customerId: parseInt(customerId),
        customerName,
        customerPhone,
        droneModel: selectedDrone ? selectedDrone.name : 'Custom Drone',
        quantity: parseInt(quantity),
        unitPrice: parseInt(unitPrice),
        total: parseInt(total),
        tax: parseInt(tax),
        grandTotal: parseInt(grandTotal),
        taxRate: taxRate || 18,
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    quotations.push(newQuotation);
    res.json({ success: true, message: 'Quotation created successfully!', quotation: newQuotation });
});

// Create custom quotation (with add-ons)
router.post('/quotation/custom/create', (req, res) => {
    const { 
        customerId, customerName, customerPhone, droneModel, quantity, unitPrice, 
        discount, shipping, addons, subtotal, addonsTotal, discountAmount, 
        afterDiscount, tax, grandTotal 
    } = req.body;
    
    const newQuotation = {
        id: quotations.length + 1,
        number: generateQuotationNumber(),
        customerId: parseInt(customerId),
        customerName,
        customerPhone,
        droneModel,
        quantity: parseInt(quantity),
        unitPrice: parseInt(unitPrice),
        discount: discount || 0,
        shipping: shipping || 0,
        addons: addons || [],
        subtotal: parseInt(subtotal),
        addonsTotal: parseInt(addonsTotal) || 0,
        discountAmount: parseInt(discountAmount),
        afterDiscount: parseInt(afterDiscount),
        tax: parseInt(tax),
        grandTotal: parseInt(grandTotal),
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    quotations.push(newQuotation);
    res.json({ success: true, message: 'Custom quotation created successfully!', quotation: newQuotation });
});

// Update quotation status (approve/reject)
router.put('/quotations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const quotation = quotations.find(q => q.id === parseInt(id));
    
    if (!quotation) {
        return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    
    quotation.status = status;
    res.json({ success: true, message: `Quotation ${status}`, quotation });
});

// Update quotation (edit)
router.put('/quotation/:id', (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const index = quotations.findIndex(q => q.id === parseInt(id));
    
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    
    quotations[index] = { ...quotations[index], ...updateData, updatedAt: new Date().toISOString() };
    res.json({ success: true, message: 'Quotation updated successfully', quotation: quotations[index] });
});

// Convert approved quotation to order
router.post('/quotations/:id/convert-to-order', (req, res) => {
    const { id } = req.params;
    const quotation = quotations.find(q => q.id === parseInt(id));
    
    if (!quotation) {
        return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    
    if (quotation.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Quotation must be approved first' });
    }
    
    // Generate Customer ID if customer doesn't have one
    let customerId = null;
    const existingCustomer = customers.find(c => c.id === quotation.customerId);
    
    if (existingCustomer && !existingCustomer.customerId) {
        customerId = generateCustomerId();
        existingCustomer.customerId = customerId;
    } else if (existingCustomer) {
        customerId = existingCustomer.customerId;
    } else {
        customerId = generateCustomerId();
    }
    
    const orderNumber = generateOrderNumber();
    const expectedDelivery = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const newOrder = {
        id: orders.length + 1,
        orderNumber,
        customerId,
        customerName: quotation.customerName,
        droneModel: quotation.droneModel,
        quantity: quotation.quantity,
        totalAmount: quotation.grandTotal,
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery
    };
    
    orders.push(newOrder);
    quotation.orderNumber = orderNumber;
    
    res.json({ 
        success: true, 
        message: `Order created! Customer ID: ${customerId}`, 
        order: newOrder,
        customerId
    });
});

// ============ ORDER ROUTES ============

// Get all orders
router.get('/orders', (req, res) => {
    res.json({ success: true, orders });
});

// Get single order
router.get('/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
});

// Update order status
router.put('/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find(o => o.id === parseInt(id));
    
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.status = status;
    res.json({ success: true, message: `Order ${status}`, order });
});

// Cancel order
router.put('/orders/:id/cancel', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const order = orders.find(o => o.id === parseInt(id));
    
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.status === 'completed') {
        return res.status(400).json({ success: false, message: 'Cannot cancel completed order' });
    }
    
    if (order.status === 'cancelled') {
        return res.status(400).json({ success: false, message: 'Order already cancelled' });
    }
    
    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();
    order.cancellationReason = reason || 'No reason provided';
    
    // Also update related quotation
    const quotation = quotations.find(q => q.orderNumber === order.orderNumber);
    if (quotation) {
        quotation.status = 'cancelled';
    }
    
    res.json({ 
        success: true, 
        message: `Order ${order.orderNumber} cancelled successfully`, 
        order
    });
});

// Get cancelled orders
router.get('/orders/cancelled', (req, res) => {
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    res.json({ success: true, orders: cancelledOrders });
});

// Get orders by customer
router.get('/orders/customer/:customerId', (req, res) => {
    const { customerId } = req.params;
    const customerOrders = orders.filter(o => o.customerId === customerId || o.customerName === customerId);
    res.json({ success: true, orders: customerOrders });
});

// ============ STATISTICS ROUTES ============

// Get sales statistics
router.get('/statistics', (req, res) => {
    const totalQuotations = quotations.length;
    const approvedQuotations = quotations.filter(q => q.status === 'approved').length;
    const pendingQuotations = quotations.filter(q => q.status === 'pending').length;
    const rejectedQuotations = quotations.filter(q => q.status === 'rejected').length;
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const inProgressOrders = orders.filter(o => o.status === 'in_production').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    res.json({
        success: true,
        statistics: {
            quotations: { total: totalQuotations, approved: approvedQuotations, pending: pendingQuotations, rejected: rejectedQuotations },
            orders: { total: totalOrders, completed: completedOrders, inProgress: inProgressOrders, cancelled: cancelledOrders },
            totalSales: totalSales
        }
    });
});

// ========== PRODUCTION ORDER HANDOFF ROUTES ==========

// Create production order from approved quotation
router.post('/orders/send-to-production', async (req, res) => {
    console.log('=== Send to Production API Called ===');
    console.log('Request Body:', req.body);
    
    const { 
        quotation_id, order_number, customer_name, customer_phone, customer_address,
        products, total_amount, priority, delivery_date, notes 
    } = req.body;
    
    // Validate required fields
    if (!order_number || !customer_name || !products || !total_amount) {
        console.log('Missing required fields');
        return res.status(400).json({ 
            error: 'Missing required fields',
            required: ['order_number', 'customer_name', 'products', 'total_amount']
        });
    }
    
    // First, create production_orders table if not exists
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS production_orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_number VARCHAR(50) UNIQUE NOT NULL,
            quotation_id INT,
            customer_name VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(20),
            customer_address TEXT,
            products JSON NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            priority ENUM('URGENT', 'HIGH', 'NORMAL', 'LOW') DEFAULT 'NORMAL',
            status ENUM('PENDING', 'IN_PROGRESS', 'QUALITY_CHECK', 'COMPLETED', 'DELIVERED') DEFAULT 'PENDING',
            assigned_to INT,
            delivery_date DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err);
            // Continue anyway - table might already exist
        }
    });
    
    // Insert the order into production_orders
    const insertQuery = `
        INSERT INTO production_orders 
        (order_number, quotation_id, customer_name, customer_phone, customer_address,
         products, total_amount, priority, status, delivery_date, notes, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, NOW())
    `;
    
    const productsJson = JSON.stringify(products);
    const insertValues = [
        order_number, quotation_id, customer_name, customer_phone, customer_address,
        productsJson, total_amount, priority || 'NORMAL', delivery_date, notes
    ];
    
    console.log('Insert Query:', insertQuery);
    console.log('Insert Values:', insertValues);
    
    db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ 
                error: 'Database error: ' + err.message,
                details: err.sqlMessage 
            });
        }
        
        console.log('Order inserted successfully, ID:', result.insertId);
        
        // Update quotation status to 'IN_PRODUCTION'
        if (quotation_id) {
            db.query(
                'UPDATE quotations SET status = ? WHERE id = ?',
                ['IN_PRODUCTION', quotation_id],
                (err2) => {
                    if (err2) console.error('Error updating quotation:', err2);
                }
            );
        }
        
        res.json({ 
            success: true,
            message: 'Order sent to production successfully', 
            production_order_id: result.insertId 
        });
    });
});

// Get all production orders (for Production Manager)
router.get('/production-orders', (req, res) => {
    console.log('=== Fetching Production Orders ===');
    
    db.query(
        `SELECT * FROM production_orders ORDER BY created_at DESC`,
        (err, results) => {
            if (err) {
                console.error('Error fetching production orders:', err);
                return res.status(500).json({ error: err.message });
            }
            
            console.log(`Found ${results.length} production orders`);
            
            // Parse JSON products for each order
            const orders = results.map(order => {
                try {
                    return {
                        ...order,
                        products: typeof order.products === 'string' ? JSON.parse(order.products) : order.products
                    };
                } catch (e) {
                    console.error('Error parsing products for order:', order.id, e);
                    return { ...order, products: [] };
                }
            });
            
            res.json(orders);
        }
    );
});

// Update production order status
router.put('/production-orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating production order ${id} to status: ${status}`);
    
    db.query(
        'UPDATE production_orders SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error('Error updating production order:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            res.json({ message: 'Production order updated successfully' });
        }
    );
});

module.exports = router;