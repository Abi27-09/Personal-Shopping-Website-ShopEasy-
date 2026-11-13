import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';

const products = [
  { name: 'Everyday Sneakers', category: 'Fashion', price: 2499, stock: 25, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', description: 'Lightweight everyday sneakers with a comfortable cushioned sole.' },
  { name: 'Classic Backpack', category: 'Fashion', price: 1799, stock: 18, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80', description: 'A practical backpack for commuting, study, and travel.' },
  { name: 'Wireless Headphones', category: 'Electronics', price: 3999, stock: 12, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80', description: 'Wireless over-ear headphones for music and calls.' },
  { name: 'Smart Watch', category: 'Electronics', price: 5499, stock: 9, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', description: 'A clean everyday watch design with smart features.' },
  { name: 'Ceramic Coffee Set', category: 'Home', price: 999, stock: 30, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80', description: 'Minimal ceramic pieces for a calm morning routine.' },
  { name: 'Desk Lamp', category: 'Home', price: 1499, stock: 16, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80', description: 'Modern desk lamp for focused work and reading.' },
  { name: 'Daily Skincare Kit', category: 'Beauty', price: 1299, stock: 20, image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=80', description: 'A simple daily skincare essentials bundle.' },
  { name: 'Yoga Mat', category: 'Sports', price: 1199, stock: 22, image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=80', description: 'Supportive mat for stretching and home workouts.' }
];
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopeasy', { useNewUrlParser: true, useUnifiedTopology: true });
await User.updateOne({ email: 'admin@shopeasy.local' }, { $set: {
  name: 'ShopEasy Admin', email: 'admin@shopeasy.local',
  passwordHash: await bcrypt.hash('ChangeMe123!', 12), role: 'admin'
}}, { upsert: true });
if (await Product.countDocuments() === 0) await Product.insertMany(products);
console.log('Seed complete. Demo admin: admin@shopeasy.local / ChangeMe123! (change immediately).');
await mongoose.disconnect();
