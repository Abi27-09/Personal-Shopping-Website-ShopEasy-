import { Router } from 'express';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/', async (req, res) => {
  const { q = '', category = '', sort = 'newest', min = '', max = '' } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: { $regex: String(q).slice(0,80), $options: 'i' } }, { description: { $regex: String(q).slice(0,80), $options: 'i' } }];
  if (category) filter.category = category;
  if (min !== '' || max !== '') filter.price = { ...(min !== '' ? { $gte: Number(min) } : {}), ...(max !== '' ? { $lte: Number(max) } : {}) };
  const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { ratingAverage: -1 }, newest: { createdAt: -1 } };
  res.json(await Product.find(filter).sort(sortMap[sort] || sortMap.newest).limit(100));
});
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ product, reviews });
});
router.post('/:id/reviews', requireAuth, async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1–5.' });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  try {
    await Review.findOneAndUpdate(
      { product: product._id, user: req.user._id },
      { product: product._id, user: req.user._id, name: req.user.name, rating, comment: String(req.body.comment || '').slice(0,1000) },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const stats = await Review.aggregate([{ $match: { product: product._id } }, { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }]);
    product.ratingAverage = Math.round((stats[0]?.avg || 0) * 10) / 10;
    product.ratingCount = stats[0]?.count || 0;
    await product.save();
    res.status(201).json({ message: 'Review saved.' });
  } catch { res.status(500).json({ message: 'Could not save review.' }); }
});
export default router;
