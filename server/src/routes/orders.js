import { Router } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
function razorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_ID.includes('replace') || process.env.RAZORPAY_KEY_SECRET.includes('replace')) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}
router.post('/checkout', async (req, res) => {
  const client = razorpayClient();
  if (!client) return res.status(503).json({ message: 'Online payment is not configured. Add Razorpay test keys to server/.env.' });
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length || items.length > 30) return res.status(400).json({ message: 'Cart is empty or too large.' });
  try {
    const lineItems = [];
    let totalPaise = 0;
    for (const item of items) {
      const quantity = Math.floor(Number(item.quantity));
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ message: 'Invalid quantity.' });
      const p = await Product.findById(item.productId);
      if (!p || p.stock < quantity) return res.status(400).json({ message: `Unavailable or insufficient stock: ${p?.name || 'product'}.` });
      lineItems.push({ product: p._id, name: p.name, price: p.price, quantity });
      totalPaise += Math.round(p.price * 100) * quantity;
    }
    if (totalPaise < 100) return res.status(400).json({ message: 'Minimum order amount is ₹1.' });
    const order = await Order.create({ user: req.user._id, items: lineItems, amountPaise: totalPaise });
    const paymentOrder = await client.orders.create({ amount: totalPaise, currency: 'INR', receipt: order._id.toString() });
    order.razorpayOrderId = paymentOrder.id;
    await order.save();
    res.status(201).json({ orderId: order._id, razorpayOrderId: paymentOrder.id, amount: totalPaise, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) { res.status(500).json({ message: 'Could not start checkout.', detail: e.message }); }
});
router.post('/verify-payment', async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order || !order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id)
    return res.status(404).json({ message: 'Order not found.' });
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature || ''));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return res.status(400).json({ message: 'Payment signature verification failed.' });
  if (order.status !== 'paid') {
    order.status = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
  }
  res.json({ message: 'Payment verified.', order });
});
router.get('/mine', async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })));
export default router;
