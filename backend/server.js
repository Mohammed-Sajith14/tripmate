import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'TripMate API is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes (will be added feature by feature)
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import followRoutes from './routes/follow.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import postRoutes from './routes/post.routes.js';
import tripRoutes from './routes/trip.routes.js';
// import messageRoutes from './routes/message.routes.js'; // Coming next

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/trips', tripRoutes);
// app.use('/api/messages', messageRoutes); // Coming next

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
});
