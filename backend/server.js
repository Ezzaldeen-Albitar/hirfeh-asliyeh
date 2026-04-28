import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './src/config/db.js';
import { initSocket } from './src/config/socket.js';
import { errorHandler } from './src/middleware/error.middleware.js';

import authRoutes from './src/routes/auth.routes.js';
import artisanRoutes from './src/routes/artisans.routes.js';
import productRoutes from './src/routes/products.routes.js';
import originStoryRoutes from './src/routes/originStories.routes.js';
import customizationRoutes from './src/routes/customizations.routes.js';
import orderRoutes from './src/routes/orders.routes.js';
import reviewRoutes from './src/routes/reviews.routes.js';
import workshopRoutes from './src/routes/workshops.routes.js';
import notificationRoutes from './src/routes/notifications.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import searchRoutes from './src/routes/search.routes.js';

await connectDB();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});
initSocket(io);
app.set('io', io);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/products', productRoutes);
app.use('/api/origin-stories', originStoryRoutes);
app.use('/api/customizations', customizationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Hirfeh Asliyeh server running on port ${PORT} [${process.env.NODE_ENV}]`);
});