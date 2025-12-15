import express from 'express';
import Venue from '../../models/Venue';
import { AuthRequest } from '../../middleware/auth';

const router = express.Router();

// GET /api/admin/settings - Get venue settings
router.get('/', async (req: AuthRequest, res) => {
  try {
    const venue = await Venue.findById(req.user!.venueId);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({
      isOpen: venue.isOpen,
      operatingHours: venue.operatingHours,
      name_en: venue.name_en,
      name_ar: venue.name_ar,
      vatPercent: venue.vatPercent,
      deliveryFee: venue.deliveryFee,
      minOrder: venue.minOrder
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PATCH /api/admin/settings/toggle-shop - Toggle shop open/closed
router.patch('/toggle-shop', async (req: AuthRequest, res) => {
  try {
    const { isOpen } = req.body;
    
    const venue = await Venue.findByIdAndUpdate(
      req.user!.venueId,
      { isOpen },
      { new: true }
    );

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({ 
      success: true, 
      isOpen: venue.isOpen,
      message: `Shop is now ${venue.isOpen ? 'OPEN' : 'CLOSED'}`
    });
  } catch (error) {
    console.error('Toggle shop error:', error);
    res.status(500).json({ error: 'Failed to toggle shop status' });
  }
});

// PATCH /api/admin/settings/operating-hours - Update operating hours
router.patch('/operating-hours', async (req: AuthRequest, res) => {
  try {
    const { operatingHours } = req.body;
    
    const venue = await Venue.findByIdAndUpdate(
      req.user!.venueId,
      { operatingHours },
      { new: true }
    );

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    res.json({ 
      success: true, 
      operatingHours: venue.operatingHours,
      message: 'Operating hours updated successfully'
    });
  } catch (error) {
    console.error('Update operating hours error:', error);
    res.status(500).json({ error: 'Failed to update operating hours' });
  }
});

export default router;
