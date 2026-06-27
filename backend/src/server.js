require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import Firebase routes
const authRoutes = require('./routes/authFirebaseRoutes');
const userRoutes = require('./routes/userFirebaseRoutes');

// Import module routes
const droneRoutes = require('./routes/droneRoutes');
const orderRoutes = require('./routes/orderRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');

// ✅ NEW: Import customer routes
const tempCustomerRoutes = require('./routes/tempCustomerRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// ✅ FIX: Enable trust proxy for Render
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ FIX: Updated rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    validate: {
        xForwardedForHeader: false
    }
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ============= ROUTES =============

// Authentication & Users
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Core Modules
app.use('/api/drones', droneRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/service-requests', serviceRequestRoutes);

// ✅ NEW: Customer Management
app.use('/api/temp-customers', tempCustomerRoutes);
app.use('/api/customers', customerRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        console.log('🚀 Starting server with Firebase...');
        console.log('✅ Firebase will handle database operations');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔥 Firebase is connected!`);
            console.log(`📋 Available APIs:`);
            console.log(`   - /api/auth (Authentication)`);
            console.log(`   - /api/users (User Management)`);
            console.log(`   - /api/drones (Drone Management)`);
            console.log(`   - /api/orders (Order Management)`);
            console.log(`   - /api/quotations (Quotation Management)`);
            console.log(`   - /api/tasks (Task Management)`);
            console.log(`   - /api/service-requests (Service Requests)`);
            console.log(`   - /api/temp-customers (Temp Customer Management) ✅ NEW`);
            console.log(`   - /api/customers (Customer Management) ✅ NEW`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();