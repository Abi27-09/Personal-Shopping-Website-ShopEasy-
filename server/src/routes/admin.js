import { Router } from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth, requireAdmin);
router.get('/orders', async (_req, res) => {
  res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(200));
});
router.post('/products', async (req, res) => {
  try {
    const p = await Product.create(productInput(req.body));
    res.status(201).json(p);
  } catch (e) { res.status(400).json({ message: e.message || 'Invalid product.' }); }
});
router.put('/products/:id', async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, productInput(req.body), { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    res.json(p);
  } catch (e) { res.status(400).json({ message: e.message || 'Invalid product.' }); }
});
router.delete('/products/:id', async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found.' });
  res.json({ message: 'Product deleted.' });
});
function productInput(b) {
  return { name: String(b.name || '').trim(), description: String(b.description || '').slice(0,4000),
    category: String(b.category || '').trim(), price: Number(b.price), image: String(b.image || ''),
    stock: Number(b.stock ?? 0) };
}
export default router;
