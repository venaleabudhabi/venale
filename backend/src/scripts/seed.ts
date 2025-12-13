import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import Venue from '../models/Venue';
import Category from '../models/Category';
import Item from '../models/Item';
import AddonGroup from '../models/AddonGroup';
import User from '../models/User';
import menuData from './menu-data.json';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seed...');

    // Check if venue already exists
    let venue = await Venue.findOne({ slug: menuData.venue.slug });
    
    if (!venue) {
      // Create venue
      venue = new Venue(menuData.venue);
      await venue.save();
      console.log('✅ Venue created:', venue.name_en);
    } else {
      console.log('ℹ️  Venue already exists:', venue.name_en);
    }

    // Create addon groups (if provided)
    const addonGroups = (menuData as any).addon_groups || [];
    for (const addonData of addonGroups) {
      const existing = await AddonGroup.findOne({ venueId: venue._id, key: addonData.key });
      if (!existing) {
        const addon = new AddonGroup({
          venueId: venue._id,
          ...addonData,
        });
        await addon.save();
        console.log(`✅ Addon group created: ${addonData.name_en}`);
      }
    }

    // Create categories and items
    for (let i = 0; i < menuData.categories.length; i++) {
      const catData = menuData.categories[i];
      
      let category = await Category.findOne({ venueId: venue._id, key: catData.key });
      
      if (!category) {
        category = new Category({
          venueId: venue._id,
          key: catData.key,
          name_en: catData.name_en,
          name_ar: catData.name_ar,
          sortOrder: i,
        });
        await category.save();
        console.log(`✅ Category created: ${catData.name_en}`);
      }

      // Create items for this category
      for (const itemData of catData.items) {
        const existing = await Item.findOne({ venueId: venue._id, key: itemData.key });
        if (!existing) {
          const item = new Item({
            venueId: venue._id,
            categoryId: category._id,
            ...itemData,
          });
          await item.save();
          console.log(`  ✅ Item created: ${itemData.name_en}`);
        }
      }
    }

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@revive.ae';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
      adminUser = new User({
        venueId: venue._id,
        role: 'admin',
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        isActive: true,
      });
      await adminUser.save();
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
    }

    console.log('\n🎉 Database seed completed successfully!');
    console.log(`\n�� Summary:`);
    console.log(`   Venue: ${venue.name_en}`);
    console.log(`   Categories: ${menuData.categories.length}`);
    console.log(`   Items: ${menuData.categories.reduce((sum, cat) => sum + cat.items.length, 0)}`);
    console.log(`   Addon Groups: ${addonGroups.length}`);
    console.log(`\n🔐 Admin Login:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
