import express from 'express';
import Venue from '../models/Venue';
import Category from '../models/Category';
import Item from '../models/Item';
import AddonGroup from '../models/AddonGroup';

const router = express.Router();

// GET /api/menu/:venueSlug - Get full menu
router.get('/:venueSlug', async (req, res) => {
  try {
    const { venueSlug } = req.params;
    const lang = (req.query.lang as string) || 'en';

    const venue = await Venue.findOne({ slug: venueSlug });
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Get categories (non-hidden, sorted)
    const categories = await Category.find({
      venueId: venue._id,
      isHidden: false,
    }).sort({ sortOrder: 1 });

    // Get items (non-hidden, non-unavailable)
    const items = await Item.find({
      venueId: venue._id,
      isHidden: false,
      isUnavailable: false,
    });

    // Get addon groups
    const addonGroups = await AddonGroup.find({ venueId: venue._id });

    // Group items by category
    const categoriesWithItems = categories.map((cat) => ({
      key: cat.key,
      name: lang === 'ar' && cat.name_ar ? cat.name_ar : cat.name_en,
      imageUrl: cat.imageUrl,
      items: items
        .filter((item) => item.categoryId.toString() === cat._id.toString())
        .map((item) => ({
          key: item.key,
          name: lang === 'ar' && item.name_ar ? item.name_ar : item.name_en,
          price: item.price,
          imageUrl: item.imageUrl,
          ingredients: lang === 'ar' && item.ingredients_ar?.length ? item.ingredients_ar : item.ingredients_en,
          tags: item.tags,
          addons: item.addons,
          nutrition: {
            ...item.nutrition,
            micros: lang === 'ar' && item.nutrition.micros_ar ? item.nutrition.micros_ar : item.nutrition.micros_en,
          },
        })),
    }));

    const addonGroupsFormatted = addonGroups.map((group) => ({
      key: group.key,
      name: lang === 'ar' && group.name_ar ? group.name_ar : group.name_en,
      min_select: group.min_select,
      max_select: group.max_select,
      options: group.options.map((opt) => ({
        key: opt.key,
        name: lang === 'ar' && opt.name_ar ? opt.name_ar : opt.name_en,
        price: opt.price,
      })),
    }));

    res.json({
      venue: {
        name: lang === 'ar' && venue.name_ar ? venue.name_ar : venue.name_en,
        currency: venue.currency,
        delivery_enabled: venue.delivery_enabled,
        member_discount_percent: venue.member_discount_percent,
        member_discount_note: lang === 'ar' && venue.member_discount_note_ar ? venue.member_discount_note_ar : venue.member_discount_note_en,
        loyalty_note: lang === 'ar' && venue.loyalty_note_ar ? venue.loyalty_note_ar : venue.loyalty_note_en,
      },
      categories: categoriesWithItems,
      addonGroups: addonGroupsFormatted,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// GET /api/menu/:venueSlug/search - Search menu
router.get('/:venueSlug/search', async (req, res) => {
  try {
    const { venueSlug } = req.params;
    const { q, lang } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const venue = await Venue.findOne({ slug: venueSlug });
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    // Text search on items
    const items = await Item.find({
      venueId: venue._id,
      isHidden: false,
      isUnavailable: false,
      $text: { $search: q },
    }).limit(20);

    const categories = await Category.find({
      _id: { $in: items.map((i) => i.categoryId) },
    });

    const results = items.map((item) => {
      const category = categories.find((c) => c._id.toString() === item.categoryId.toString());
      return {
        key: item.key,
        name: lang === 'ar' && item.name_ar ? item.name_ar : item.name_en,
        category: category ? (lang === 'ar' && category.name_ar ? category.name_ar : category.name_en) : '',
        categoryKey: category?.key,
        price: item.price,
        tags: item.tags,
      };
    });

    res.json({ results });
  } catch (error) {
    console.error('Error searching menu:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
