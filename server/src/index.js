import Razorpay from "razorpay";
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.disable('x-powered-by');
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()), credentials: false }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error.' });
});
const port = Number(process.env.PORT || 4000);
if (process.env.NODE_ENV !== 'test') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
    console.error('JWT_SECRET must be configured with at least 24 characters.');
    process.exit(1);
  }
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopeasy', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(port, () => console.log(`ShopEasy API listening on ${port}`)))
    .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
}
export default app;
