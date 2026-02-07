import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (parent of backend folder)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import routes
import authRoutes from './routes/auth.js';
import bookingsRoutes from './routes/bookings.js';
import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Allow all origins in development
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Star Mobiles API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║         STAR MOBILES BACKEND SERVER               ║
╠═══════════════════════════════════════════════════╣
║  Status:    Running                               ║
║  Port:      ${PORT}                                   ║
║  API Base:  http://localhost:${PORT}/api              ║
║  Health:    http://localhost:${PORT}/api/health       ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
