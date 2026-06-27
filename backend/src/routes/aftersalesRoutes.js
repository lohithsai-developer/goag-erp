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

// ========== SERVICE REQUESTS ==========

// Get all service requests
router.get('/requests', authenticateToken, (req, res) => {
    db.query(
        `SELECT * FROM service_requests ORDER BY 
            CASE priority 
                WHEN 'URGENT' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'NORMAL' THEN 3 
                ELSE 4 
            END, 
            created_at DESC`,
        (err, results) => {
            if (err) {
                console.error('Error fetching service requests:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const stats = {
                total: results.length,
                pending: results.filter(r => r.status === 'PENDING').length,
                in_progress: results.filter(r => r.status === 'IN_PROGRESS').length,
                quality_check: results.filter(r => r.status === 'QUALITY_CHECK').length,
                completed: results.filter(r => r.status === 'COMPLETED').length,
                overdue: results.filter(r => {
                    if (r.status === 'COMPLETED') return false;
                    return new Date(r.sla_deadline) < new Date();
                }).length
            };
            
            res.json({ requests: results, stats });
        }
    );
});

// Get single service request by ID
router.get('/requests/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM service_requests WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching service request:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Service request not found' });
        }
        
        res.json(results[0]);
    });
});

// Create new service request
router.post('/requests/create', authenticateToken, (req, res) => {
    const { 
        customerName, customerPhone, customerEmail, customerAddress,
        droneModel, droneSerial, issueType, description, priority
    } = req.body;
    
    const requestNumber = `SR-${Date.now()}`;
    const slaDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    db.query(
        `INSERT INTO service_requests 
         (request_number, customer_name, customer_phone, customer_email, customer_address,
          drone_model, drone_serial, issue_type, description, priority, status, 
          sla_deadline, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW())`,
        [requestNumber, customerName, customerPhone, customerEmail, customerAddress,
         droneModel, droneSerial, issueType, description, priority || 'NORMAL', slaDeadline],
        (err, result) => {
            if (err) {
                console.error('Error creating service request:', err);
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ 
                id: result.insertId, 
                request_number: requestNumber,
                message: 'Service request created successfully' 
            });
        }
    );
});

// Update service request status
router.put('/requests/:id/status', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.query(
        'UPDATE service_requests SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id],
        (err, result) => {
            if (err) {
                console.error('Error updating service request:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Service request not found' });
            }
            
            res.json({ message: `Service request status updated to ${status}` });
        }
    );
});

// ========== CUSTOMER LOOKUP ==========

// Search customer by ID, Name, or Phone
router.get('/customer/lookup', authenticateToken, (req, res) => {
    const { search } = req.query;
    
    if (!search) {
        return res.status(400).json({ error: 'Search term is required' });
    }
    
    // Search in customers table
    db.query(
        `SELECT * FROM customers WHERE 
            customer_id LIKE ? OR 
            name LIKE ? OR 
            phone LIKE ?`,
        [`%${search}%`, `%${search}%`, `%${search}%`],
        (err, customers) => {
            if (err) {
                console.error('Error searching customer:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (customers.length === 0) {
                return res.json({ success: false, message: 'No customers found' });
            }
            
            if (customers.length > 1) {
                return res.json({ 
                    success: true, 
                    isMultiple: true,
                    customers: customers.map(c => ({
                        customerId: c.customer_id,
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                        address: c.address
                    }))
                });
            }
            
            const customer = customers[0];
            
            // Get customer's order history
            db.query(
                `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`,
                [customer.id],
                (err2, orders) => {
                    if (err2) console.error('Error fetching orders:', err2);
                    
                    // Get customer's service history
                    db.query(
                        `SELECT * FROM service_requests WHERE customer_name = ? ORDER BY created_at DESC`,
                        [customer.name],
                        (err3, services) => {
                            if (err3) console.error('Error fetching service history:', err3);
                            
                            res.json({
                                success: true,
                                customer: {
                                    customerId: customer.customer_id,
                                    name: customer.name,
                                    phone: customer.phone,
                                    email: customer.email,
                                    address: customer.address,
                                    orders: orders || [],
                                    serviceHistory: services || []
                                }
                            });
                        }
                    );
                }
            );
        }
    );
});

// ========== SERVICE TASKS ==========

// Get all service tasks
router.get('/tasks', authenticateToken, (req, res) => {
    db.query(
        `SELECT t.*, sr.request_number, sr.customer_name 
         FROM service_tasks t 
         LEFT JOIN service_requests sr ON t.request_id = sr.id 
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
                console.error('Error fetching service tasks:', err);
                return res.status(500).json({ error: err.message });
            }
            
            // Parse assigned_to JSON for each task
            const tasks = results.map(task => ({
                ...task,
                assigned_to: task.assigned_to ? JSON.parse(task.assigned_to) : [],
                assigned_to_names: task.assigned_to_names ? JSON.parse(task.assigned_to_names) : []
            }));
            
            res.json({ tasks });
        }
    );
});

// Get tasks for a specific service request
router.get('/requests/:requestId/tasks', authenticateToken, (req, res) => {
    const { requestId } = req.params;
    
    db.query(
        'SELECT * FROM service_tasks WHERE request_id = ? ORDER BY created_at DESC',
        [requestId],
        (err, results) => {
            if (err) {
                console.error('Error fetching request tasks:', err);
                return res.status(500).json({ error: err.message });
            }
            
            const tasks = results.map(task => ({
                ...task,
                assigned_to: task.assigned_to ? JSON.parse(task.assigned_to) : [],
                assigned_to_names: task.assigned_to_names ? JSON.parse(task.assigned_to_names) : []
            }));
            
            res.json({ tasks });
        }
    );
});

// Create and assign service task in one go
router.post('/tasks/create-and-assign', authenticateToken, (req, res) => {
    const { 
        request_id, task_name, description, deadline, 
        assigned_to, assigned_to_names, priority 
    } = req.body;
    
    if (!request_id || !task_name) {
        return res.status(400).json({ error: 'Request ID and task name are required' });
    }
    
    if (!assigned_to || assigned_to.length === 0) {
        return res.status(400).json({ error: 'At least one employee must be assigned' });
    }
    
    db.query(
        `INSERT INTO service_tasks 
         (request_id, task_name, description, deadline, priority, status, 
          assigned_to, assigned_to_names, created_at) 
         VALUES (?, ?, ?, ?, ?, 'ASSIGNED', ?, ?, NOW())`,
        [request_id, task_name, description, deadline, priority || 'NORMAL', 
         JSON.stringify(assigned_to), JSON.stringify(assigned_to_names)],
        (err, result) => {
            if (err) {
                console.error('Error creating service task:', err);
                return res.status(500).json({ error: err.message });
            }
            
            // Update employees' availability to busy
            const employeeIds = assigned_to;
            const placeholders = employeeIds.map(() => '?').join(',');
            
            db.query(
                `UPDATE users SET is_available = FALSE WHERE id IN (${placeholders})`,
                employeeIds,
                (err2) => {
                    if (err2) console.error('Error updating employee availability:', err2);
                }
            );
            
            // Update request status to IN_PROGRESS if pending
            db.query(
                `UPDATE service_requests SET status = 'IN_PROGRESS' WHERE id = ? AND status = 'PENDING'`,
                [request_id],
                (err3) => {
                    if (err3) console.error('Error updating request status:', err3);
                }
            );
            
            res.json({ 
                id: result.insertId, 
                message: 'Service task created and assigned successfully' 
            });
        }
    );
});

// Assign service task to employees
router.post('/tasks/assign', authenticateToken, (req, res) => {
    const { taskId, employeeIds, employeeNames, deadline, priority } = req.body;
    
    if (!taskId || !employeeIds || employeeIds.length === 0) {
        return res.status(400).json({ error: 'Task ID and at least one employee are required' });
    }
    
    db.query(
        `UPDATE service_tasks 
         SET assigned_to = ?, assigned_to_names = ?, deadline = ?, priority = ?, status = 'ASSIGNED'
         WHERE id = ?`,
        [JSON.stringify(employeeIds), JSON.stringify(employeeNames), deadline, priority || 'NORMAL', taskId],
        (err, result) => {
            if (err) {
                console.error('Error assigning service task:', err);
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
            
            // Get request_id to update request status
            db.query(
                `SELECT request_id FROM service_tasks WHERE id = ?`,
                [taskId],
                (err3, results) => {
                    if (!err3 && results[0]) {
                        db.query(
                            `UPDATE service_requests SET status = 'IN_PROGRESS' 
                             WHERE id = ? AND status = 'PENDING'`,
                            [results[0].request_id],
                            (err4) => {
                                if (err4) console.error('Error updating request status:', err4);
                            }
                        );
                    }
                }
            );
            
            res.json({ message: 'Service task assigned successfully' });
        }
    );
});

// Update service task status
router.put('/tasks/:taskId/status', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const updateQuery = status === 'COMPLETED' 
        ? 'UPDATE service_tasks SET status = ?, completed_at = NOW() WHERE id = ?'
        : 'UPDATE service_tasks SET status = ? WHERE id = ?';
    
    db.query(updateQuery, [status, taskId], (err, result) => {
        if (err) {
            console.error('Error updating task status:', err);
            return res.status(500).json({ error: err.message });
        }
        
        // If task completed, free up assigned employees
        if (status === 'COMPLETED') {
            db.query(
                `SELECT assigned_to, request_id FROM service_tasks WHERE id = ?`,
                [taskId],
                (err2, results) => {
                    if (!err2 && results[0]) {
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
                        
                        // Check if all tasks for this request are completed
                        db.query(
                            `SELECT COUNT(*) as pending_count FROM service_tasks 
                             WHERE request_id = ? AND status != 'COMPLETED'`,
                            [results[0].request_id],
                            (err4, countResult) => {
                                if (!err4 && countResult[0].pending_count === 0) {
                                    db.query(
                                        `UPDATE service_requests SET status = 'COMPLETED' WHERE id = ?`,
                                        [results[0].request_id],
                                        (err5) => {
                                            if (err5) console.error('Error updating request status:', err5);
                                        }
                                    );
                                }
                            }
                        );
                    }
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
        'UPDATE service_tasks SET deadline = ? WHERE id = ?',
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

// Get all service employees
router.get('/employees', authenticateToken, (req, res) => {
    db.query(
        `SELECT id, name, email, role, phone, is_available, department, created_at 
         FROM users 
         WHERE role IN ('employee', 'service_staff', 'service_manager', 'technician')
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

// Get available service employees
router.get('/employees/available', authenticateToken, (req, res) => {
    db.query(
        `SELECT u.id, u.name, u.email, u.role, u.phone, u.is_available, u.department
         FROM users u
         WHERE u.role IN ('employee', 'service_staff', 'technician') 
         AND (u.is_available = TRUE OR u.is_available IS NULL)
         ORDER BY u.name`,
        (err, results) => {
            if (err) {
                console.error('Error fetching available employees:', err);
                return res.status(500).json({ error: err.message });
            }
            
            db.query(
                `SELECT id, name, email, role, department FROM users 
                 WHERE role IN ('employee', 'service_staff', 'technician') 
                 ORDER BY name`,
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
        `SELECT t.*, sr.request_number, sr.customer_name 
         FROM service_tasks t
         LEFT JOIN service_requests sr ON t.request_id = sr.id
         WHERE JSON_CONTAINS(t.assigned_to, ?)
         ORDER BY 
            CASE WHEN t.status = 'PENDING' THEN 1
                 WHEN t.status = 'ASSIGNED' THEN 2
                 WHEN t.status = 'IN_PROGRESS' THEN 3
                 ELSE 4
            END,
            t.deadline ASC`,
        [JSON.stringify(employeeId.toString())],
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

// Get after-sales dashboard statistics
router.get('/dashboard/stats', authenticateToken, (req, res) => {
    const queries = {
        totalRequests: 'SELECT COUNT(*) as count FROM service_requests',
        pendingRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE status = "PENDING"',
        inProgressRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE status = "IN_PROGRESS"',
        qualityCheckRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE status = "QUALITY_CHECK"',
        completedRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE status = "COMPLETED"',
        overdueRequests: 'SELECT COUNT(*) as count FROM service_requests WHERE status != "COMPLETED" AND sla_deadline < NOW()',
        totalTasks: 'SELECT COUNT(*) as count FROM service_tasks',
        completedTasks: 'SELECT COUNT(*) as count FROM service_tasks WHERE status = "COMPLETED"',
        pendingTasks: 'SELECT COUNT(*) as count FROM service_tasks WHERE status IN ("PENDING", "ASSIGNED")',
        totalEmployees: 'SELECT COUNT(*) as count FROM users WHERE role IN ("employee", "service_staff", "technician")',
        availableEmployees: 'SELECT COUNT(*) as count FROM users WHERE role IN ("employee", "service_staff", "technician") AND (is_available = TRUE OR is_available IS NULL)'
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
                    totalRequests: results.totalRequests?.count || 0,
                    pendingRequests: results.pendingRequests?.count || 0,
                    inProgressRequests: results.inProgressRequests?.count || 0,
                    qualityCheckRequests: results.qualityCheckRequests?.count || 0,
                    completedRequests: results.completedRequests?.count || 0,
                    overdueRequests: results.overdueRequests?.count || 0,
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

// ========== CREATE TABLES IF NOT EXISTS ==========

const createTables = () => {
    const serviceRequestsTable = `
        CREATE TABLE IF NOT EXISTS service_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_number VARCHAR(50) UNIQUE NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_phone VARCHAR(20),
            customer_email VARCHAR(255),
            customer_address TEXT,
            drone_model VARCHAR(100),
            drone_serial VARCHAR(100),
            issue_type VARCHAR(255) NOT NULL,
            description TEXT,
            priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
            status ENUM('PENDING', 'IN_PROGRESS', 'QUALITY_CHECK', 'COMPLETED', 'REJECTED') DEFAULT 'PENDING',
            sla_deadline DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    const serviceTasksTable = `
        CREATE TABLE IF NOT EXISTS service_tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            request_id INT NOT NULL,
            task_name VARCHAR(255) NOT NULL,
            description TEXT,
            assigned_to JSON,
            assigned_to_names JSON,
            priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') DEFAULT 'NORMAL',
            status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
            estimated_hours INT DEFAULT 8,
            deadline DATETIME,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
        )
    `;
    
    db.query(serviceRequestsTable, (err) => {
        if (err) console.error('Error creating service_requests table:', err);
        else console.log('Service requests table ready');
    });
    
    db.query(serviceTasksTable, (err) => {
        if (err) console.error('Error creating service_tasks table:', err);
        else console.log('Service tasks table ready');
    });
};

// Initialize tables
createTables();

module.exports = router;