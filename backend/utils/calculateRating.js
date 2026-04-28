import Review from '../models/Review.js';

export async function recalculateProductRating(Product, productId) {
    const result = await Review.aggregate([
        { $match: { product: productId, isVisible: true } },
        {
            $group: {
                _id: '$product',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);
    const avgRating = result[0] ? parseFloat(result[0].avgRating.toFixed(2)) : 0;
    const reviewCount = result[0] ? result[0].count : 0;
    await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        reviewCount,
    });
    return { avgRating, reviewCount };
}
export async function recalculateArtisanRating(ArtisanProfile, artisanId) {
    const result = await Review.aggregate([
        { $match: { artisan: artisanId, isVisible: true } },
        {
            $group: {
                _id: '$artisan',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]);
    const avgRating = result[0] ? parseFloat(result[0].avgRating.toFixed(2)) : 0;
    const reviewCount = result[0] ? result[0].count : 0;
    await ArtisanProfile.findByIdAndUpdate(artisanId, {
        rating: avgRating,
        reviewCount,
    });
    return { avgRating, reviewCount };
}