const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ========== PRODUCTION ORDERS ==========

// Get all production orders
router.get('/orders', authenticateToken, (req, res) => {
    db.query(
        `SELECT * FROM production_orders ORDER BY 
            CASE priority 
                WHEN 'URGENT' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'NORMAL' THEN 3 
                ELSE 4 
            END, 
            created_at DESC`,
        (err, results) => {
            if (err) {
                console.error('Error fetching production orders:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const orders = results.map(order => ({
                ...order,
                products: typeof order.products === 'string' ? JSON.parse(order.products) : order.products
            }));
            
            const stats = {
                totalOrders: results.length,
                pendingOrders: results.filter(o => o.status === 'PENDING').length,
                inProgressOrders: results.filter(o => o.status === 'IN_PROGRESS').length,
                completedOrders: results.filter(o => o.status === 'COMPLETED').length,
                qualityCheckOrders: results.filter(o => o.status === 'QUALITY_CHECK').length
            };
            
            res.json({ orders, stats });
        }
    );
});

// Get single production order by ID
router.get('/orders/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM production_orders WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching order:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const order = {
            ...results[0],
            products: typeof results[0].products === 'string' ? JSON.parse(results[0].products) : results[0].products
        };
        
        res.json(order);
    });
});

// Update production order status
router.put('/orders/:id/status', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.query(
        'UPDATE production_orders SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error('Error updating order status:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            res.json({ message: `Order status updated to ${status}` });
        }
    );
});

// Update order priority
router.put('/orders/:id/priority', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { priority } = req.body;
    
    db.query(
        'UPDATE production_orders SET priority = ? WHERE id = ?',
        [priority, id],
        (err) => {
            if (err) {
                console.error('Error updating priority:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: `Priority updated to ${priority}` });
        }
    );
});

// ========== TASKS MANAGEMENT ==========

// Get all tasks
router.get('/tasks', authenticateToken, (req, res) => {
    db.query(
        `SELECT t.*, po.order_number, po.customer_name 
         FROM production_tasks t 
         LEFT JOIN production_orders po ON t.production_order_id = po.id 
         ORDER BY 
            CASE t.priority
                WHEN 'URGENT' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'NORMAL' THEN 3
                ELSE 4
            END,
            t.deadline ASC`,
        (err, results) => {
            if (err) {
                console.error('Error fetching tasks:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ tasks: results });
        }
    );
});

// Get tasks for a specific production order
router.get('/orders/:orderId/tasks', authenticateToken, (req, res) => {
    const { orderId } = req.params;
    
    db.query(
        'SELECT * FROM production_tasks WHERE production_order_id = ? ORDER BY created_at DESC',
        [orderId],
        (err, results) => {
            if (err) {
                console.error('Error fetching order tasks:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ tasks: results });
        }
    );
});

// Create and assign task in one go
router.post('/tasks/create-and-assign', authenticateToken, (req, res) => {
    const { 
        production_order_id, task_name, description, deadline, 
        assigned_to, assigned_to_names, priority 
    } = req.body;
    
    if (!production_order_id || !task_name) {
        return res.status(400).json({ error: 'Production order ID and task name are required' });
    }
    
    if (!assigned_to || assigned_to.length === 0) {
        return res.status(400).json({ error: 'At least one employee must be assigned' });
    }
    
    db.query(
        `INSERT INTO production_tasks 
         (production_order_id, task_name, description, deadline, priority, status, 
          assigned_to, assigned_to_names, created_at) 
         VALUES (?, ?, ?, ?, ?, 'ASSIGNED', ?, ?, NOW())`,
        [production_order_id, task_name, description, deadline, priority || 'NORMAL', 
         JSON.stringify(assigned_to), assigned_to_names],
        (err, result) => {
            if (err) {
                console.error('Error creating task:', err);
                return res.status(500).json({ error: err.message });
            }
            
            // Update employees' availability to busy
            const employeeIds = Array.isArray(assigned_to) ? assigned_to : JSON.parse(assigned_to);
            const placeholders = employeeIds.map(() => '?').join(',');
            
            db.query(
                `UPDATE users SET is_available = FALSE WHERE id IN (${placeholders})`,
                employeeIds,
                (err2) => {
                    if (err2) console.error('Error updating employee availability:', err2);
                }
            );
            
            res.json({ 
                id: result.insertId, 
                message: 'Task created and assigned successfully' 
            });
        }
    );
});

// Assign task to employees (multiple)
router.post('/tasks/assign', authenticateToken, (req, res) => {
    const { taskId, employeeIds, employeeNames, deadline, priority } = req.body;
    
    if (!taskId || !employeeIds || employeeIds.length === 0) {
        return res.status(400).json({ error: 'Task ID and at least one employee are required' });
    }
    
    db.query(
        `UPDATE production_tasks 
         SET assigned_to = ?, assigned_to_names = ?, deadline = ?, priority = ?, status = 'ASSIGNED'
         WHERE id = ?`,
        [JSON.stringify(employeeIds), employeeNames, deadline, priority || 'NORMAL', taskId],
        (err, result) => {
            if (err) {
                console.error('Error assigning task:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            // Mark employees as busy
            const placeholders = employeeIds.map(() => '?').join(',');
            db.query(
                `UPDATE users SET is_available = FALSE WHERE id IN (${placeholders})`,
                employeeIds,
                (err2) => {
                    if (err2) console.error('Error updating employee availability:', err2);
                }
            );
            
            res.json({ message: 'Task assigned successfully' });
        }
    );
});

// Update task status
router.put('/tasks/:taskId/status', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const updateQuery = status === 'COMPLETED' 
        ? 'UPDATE production_tasks SET status = ?, completed_at = NOW() WHERE id = ?'
        : 'UPDATE production_tasks SET status = ? WHERE id = ?';
    
    db.query(updateQuery, [status, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task status:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // If task completed, free up assigned employees
        if (status === 'COMPLETED') {
            db.query(
                `SELECT assigned_to FROM production_tasks WHERE id = ?`,
                [taskId],
                (err2, results) => {
                    if (!err2 && results[0] && results[0].assigned_to) {
                        let employeeIds = results[0].assigned_to;
                        if (typeof employeeIds === 'string') {
                            employeeIds = JSON.parse(employeeIds);
                        }
                        if (employeeIds && employeeIds.length > 0) {
                            const placeholders = employeeIds.map(() => '?').join(',');
                            db.query(
                                `UPDATE users SET is_available = TRUE WHERE id IN (${placeholders})`,
                                employeeIds,
                                (err3) => {
                                    if (err3) console.error('Error updating employee availability:', err3);
                                }
                            );
                        }
                    }
                    
                    // Check if all tasks for the order are completed
                    db.query(
                        `SELECT po.id, po.status, 
                            (SELECT COUNT(*) FROM production_tasks WHERE production_order_id = po.id AND status != 'COMPLETED') as pending_tasks
                         FROM production_tasks t
                         JOIN production_orders po ON t.production_order_id = po.id
                         WHERE t.id = ?`,
                        [taskId],
                        (err4, results2) => {
                            if (!err4 && results2[0] && results2[0].pending_tasks === 0) {
                                db.query(
                                    'UPDATE production_orders SET status = "QUALITY_CHECK" WHERE id = ?',
                                    [results2[0].id],
                                    (err5) => {
                                        if (err5) console.error('Error updating order status:', err5);
                                    }
                                );
                            }
                        }
                    );
                }
            );
        }
        
        res.json({ message: `Task status updated to ${status}` });
    });
});

// Update task deadline
router.put('/tasks/:taskId/deadline', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const { deadline } = req.body;
    
    db.query(
        'UPDATE production_tasks SET deadline = ? WHERE id = ?',
        [deadline, taskId],
        (err, result) => {
            if (err) {
                console.error('Error updating task deadline:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            
            res.json({ message: 'Task deadline updated successfully' });
        }
    );
});

// ========== EMPLOYEES MANAGEMENT ==========

// Get all employees
router.get('/employees', authenticateToken, (req, res) => {
    db.query(
        `SELECT id, name, email, role, phone, is_available, created_at 
         FROM users 
         WHERE role IN ('employee', 'production_staff', 'production_manager')
         ORDER BY name`,
        (err, results) => {
            if (err) {
                console.error('Error fetching employees:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ employees: results });
        }
    );
});

// Get available employees (not assigned to any pending task)
router.get('/employees/available', authenticateToken, (req, res) => {
    db.query(
        `SELECT u.id, u.name, u.email, u.role, u.phone, u.is_available
         FROM users u
         WHERE u.role IN ('employee', 'production_staff') 
         AND (u.is_available = TRUE OR u.is_available IS NULL)
         ORDER BY u.name`,
        (err, results) => {
            if (err) {
                console.error('Error fetching available employees:', err);
                return res.status(500).json({ error: err.message });
            }
            
            db.query(
                `SELECT id, name, email, role FROM users WHERE role IN ('employee', 'production_staff') ORDER BY name`,
                (err2, allResults) => {
                    res.json({ 
                        employees: results,
                        all: allResults || []
                    });
                }
            );
        }
    );
});

// Get employee tasks
router.get('/employees/:employeeId/tasks', authenticateToken, (req, res) => {
    const { employeeId } = req.params;
    
    db.query(
        `SELECT t.*, po.order_number, po.customer_name 
         FROM production_tasks t
         LEFT JOIN production_orders po ON t.production_order_id = po.id
         WHERE JSON_CONTAINS(t.assigned_to, ?)
         ORDER BY 
            CASE WHEN t.status = 'PENDING' THEN 1
                 WHEN t.status = 'ASSIGNED' THEN 2
                 WHEN t.status = 'IN_PROGRESS' THEN 3
                 ELSE 4
            END,
            t.deadline ASC`,
        [JSON.stringify(employeeId)],
        (err, results) => {
            if (err) {
                console.error('Error fetching employee tasks:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ tasks: results });
        }
    );
});

// Toggle employee availability
router.put('/employees/:employeeId/availability', authenticateToken, (req, res) => {
    const { employeeId } = req.params;
    const { is_available } = req.body;
    
    db.query(
        'UPDATE users SET is_available = ? WHERE id = ?',
        [is_available, employeeId],
        (err, result) => {
            if (err) {
                console.error('Error updating employee availability:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            
            res.json({ message: `Employee availability updated to ${is_available ? 'available' : 'busy'}` });
        }
    );
});

// ========== DASHBOARD STATS ==========

// Get production dashboard statistics
router.get('/dashboard/stats', authenticateToken, (req, res) => {
    const queries = {
        totalOrders: 'SELECT COUNT(*) as count FROM production_orders',
        pendingOrders: 'SELECT COUNT(*) as count FROM production_orders WHERE status = "PENDING"',
        inProgressOrders: 'SELECT COUNT(*) as count FROM production_orders WHERE status = "IN_PROGRESS"',
        qualityCheckOrders: 'SELECT COUNT(*) as count FROM production_orders WHERE status = "QUALITY_CHECK"',
        completedOrders: 'SELECT COUNT(*) as count FROM production_orders WHERE status = "COMPLETED"',
        totalTasks: 'SELECT COUNT(*) as count FROM production_tasks',
        completedTasks: 'SELECT COUNT(*) as count FROM production_tasks WHERE status = "COMPLETED"',
        pendingTasks: 'SELECT COUNT(*) as count FROM production_tasks WHERE status IN ("PENDING", "ASSIGNED")',
        totalEmployees: 'SELECT COUNT(*) as count FROM users WHERE role IN ("employee", "production_staff")',
        availableEmployees: 'SELECT COUNT(*) as count FROM users WHERE role IN ("employee", "production_staff") AND (is_available = TRUE OR is_available IS NULL)'
    };
    
    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;
    
    for (const [key, query] of Object.entries(queries)) {
        db.query(query, (err, result) => {
            if (err) {
                console.error(`Error fetching ${key}:`, err);
                results[key] = { count: 0 };
            } else {
                results[key] = result[0];
            }
            completed++;
            if (completed === total) {
                res.json({
                    totalOrders: results.totalOrders?.count || 0,
                    pendingOrders: results.pendingOrders?.count || 0,
                    inProgressOrders: results.inProgressOrders?.count || 0,
                    qualityCheckOrders: results.qualityCheckOrders?.count || 0,
                    completedOrders: results.completedOrders?.count || 0,
                    totalTasks: results.totalTasks?.count || 0,
                    completedTasks: results.completedTasks?.count || 0,
                    pendingTasks: results.pendingTasks?.count || 0,
                    totalEmployees: results.totalEmployees?.count || 0,
                    availableEmployees: results.availableEmployees?.count || 0
                });
            }
        });
    }
});

// ========== QUALITY CHECK ==========

// Get orders ready for quality check
router.get('/quality-check/orders', authenticateToken, (req, res) => {
    db.query(
        `SELECT * FROM production_orders 
         WHERE status = 'QUALITY_CHECK' 
         ORDER BY created_at ASC`,
        (err, results) => {
            if (err) {
                console.error('Error fetching quality check orders:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const orders = results.map(order => ({
                ...order,
                products: typeof order.products === 'string' ? JSON.parse(order.products) : order.products
            }));
            
            res.json({ orders });
        }
    );
});

// Submit quality check result
router.post('/quality-check/:orderId/submit', authenticateToken, (req, res) => {
    const { orderId } = req.params;
    const { status, remarks, checkedBy } = req.body;
    
    // Create quality_checks table if not exists
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS quality_checks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            production_order_id INT NOT NULL,
            status ENUM('PASSED', 'FAILED', 'PARTIAL') NOT NULL,
            remarks TEXT,
            checked_by VARCHAR(255),
            checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) console.error('Error creating quality_checks table:', err);
    });
    
    db.query(
        `INSERT INTO quality_checks (production_order_id, status, remarks, checked_by, checked_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [orderId, status, remarks, checkedBy],
        (err, result) => {
            if (err) {
                console.error('Error saving quality check:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const newOrderStatus = status === 'PASSED' ? 'COMPLETED' : 'REWORK';
            db.query(
                'UPDATE production_orders SET status = ? WHERE id = ?',
                [newOrderStatus, orderId],
                (err2) => {
                    if (err2) {
                        console.error('Error updating order status:', err2);
                    }
                    res.json({ 
                        message: `Quality check ${status}. Order status updated to ${newOrderStatus}`,
                        qualityCheckId: result.insertId
                    });
                }
            );
        }
    );
});

// ========== MONTHLY STATS ==========

// Get monthly orders statistics
router.get('/stats/monthly', authenticateToken, (req, res) => {
    const { months = 6 } = req.query;
    
    db.query(
        `SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders,
            SUM(total_amount) as total_value
         FROM production_orders
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month DESC`,
        [months],
        (err, results) => {
            if (err) {
                console.error('Error fetching monthly stats:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ stats: results });
        }
    );
});

// ========== CREATE TABLES IF NOT EXISTS ==========

const createTables = () => {
    const productionOrdersTable = `
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
            status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'QUALITY_CHECK', 'REWORK', 'COMPLETED', 'DELIVERED') DEFAULT 'PENDING',
            assigned_to INT,
            delivery_date DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    const productionTasksTable = `
        CREATE TABLE IF NOT EXISTS production_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            production_order_id INT NOT NULL,
            task_name VARCHAR(255) NOT NULL,
            description TEXT,
            assigned_to JSON,
            assigned_to_names VARCHAR(500),
            priority ENUM('URGENT', 'HIGH', 'NORMAL', 'LOW') DEFAULT 'NORMAL',
            status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
            estimated_hours INT DEFAULT 8,
            deadline DATETIME,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
        )
    `;
    
    db.query(productionOrdersTable, (err) => {
        if (err) console.error('Error creating production_orders table:', err);
        else console.log('Production orders table ready');
    });
    
    db.query(productionTasksTable, (err) => {
        if (err) console.error('Error creating production_tasks table:', err);
        else console.log('Production tasks table ready');
    });
};

// Initialize tables
createTables();

module.exports = router;