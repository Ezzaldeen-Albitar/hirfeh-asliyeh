import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';

export async function search(req, res, next) {
  try {
    const { q, limit = 5 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ products: [], artisans: [] });
    }
    const searchTerm = q.trim();
    const parsedLimit = parseInt(limit);
    const [products, artisans] = await Promise.all([
      Product.find(
        { $text: { $search: searchTerm }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(parsedLimit)
        .select('title images price rating reviewCount category artisan')
        .populate('artisan', 'craftName region profileImage isVerified')
        .lean(),
      ArtisanProfile.find({
        isActive: true,
        $or: [
          { craftName: { $regex: searchTerm, $options: 'i' } },
          { bio: { $regex: searchTerm, $options: 'i' } },
          { specialties: { $regex: searchTerm, $options: 'i' } },
        ],
      })
        .limit(Math.ceil(parsedLimit / 2))
        .select('craftName profileImage region isVerified rating reviewCount specialties')
        .populate('user', 'name avatar')
        .lean(),
    ]);
    return res.json({ products, artisans });
  } catch (err) {
    next(err);
  }
}
