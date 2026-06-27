// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// ✅ Initialize Firebase
const { db, auth } = require('./config/firebase');

// Import routes
const authRoutes = require('./routes/authFirebaseRoutes');
const userRoutes = require('./routes/userFirebaseRoutes');
const droneRoutes = require('./routes/droneRoutes');
const orderRoutes = require('./routes/orderRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const tempCustomerRoutes = require('./routes/tempCustomerRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// ✅ FIX: Enable trust proxy for Render
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
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

// Health check endpoint (must be before auth routes)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        firebase: db ? 'connected' : 'disconnected'
    });
});

// API root
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'GOAG ERP API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            customers: '/api/customers',
            quotations: '/api/quotations',
            orders: '/api/orders',
            drones: '/api/drones',
            tasks: '/api/tasks',
            'service-requests': '/api/service-requests',
            'temp-customers': '/api/temp-customers'
        }
    });
});

// Authentication & Users
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Core Modules
app.use('/api/drones', droneRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/service-requests', serviceRequestRoutes);

// Customer Management
app.use('/api/temp-customers', tempCustomerRoutes);
app.use('/api/customers', customerRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = () => {
    try {
        console.log('🚀 Starting server with Firebase...');

        // Check Firebase connection
        if (db) {
            console.log('✅ Firebase Firestore connected');
        } else {
            console.log('⚠️ Firebase not initialized, check configuration');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📋 Available APIs:`);
            console.log(`   - GET  /health`);
            console.log(`   - GET  /api`);
            console.log(`   - POST /api/auth/login`);
            console.log(`   - POST /api/auth/register`);
            console.log(`   - GET  /api/users`);
            console.log(`   - GET  /api/customers`);
            console.log(`   - GET  /api/quotations`);
            console.log(`   - GET  /api/orders`);
            console.log(`   - GET  /api/drones`);
            console.log(`   - GET  /api/tasks`);
            console.log(`   - GET  /api/service-requests`);
            console.log(`   - GET  /api/temp-customers`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

startServer();