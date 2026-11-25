import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Load .env regardless of working directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Shopper } from '../models/Shopper.js';

async function checkDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  console.log('📡 Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected successfully to MongoDB.\n');

    const totalShoppers = await Shopper.countDocuments();
    console.log(`📊 TOTAL SHOPPERS IN DATABASE: ${totalShoppers}`);

    const batches = await Shopper.aggregate([
      {
        $group: {
          _id: '$batchId',
          targetAudience: { $first: '$targetAudience' },
          country: { $first: '$country' },
          count: { $sum: 1 },
          createdAt: { $first: '$createdAt' },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    console.log(`📦 TOTAL BATCHES IN DATABASE: ${batches.length}\n`);

    console.log('--- BATCH SUMMARY ---');
    batches.forEach((b, idx) => {
      console.log(
        `[Batch ${idx + 1}] ID: ${b._id}\n  Audience: "${b.targetAudience}"\n  Country: ${b.country || 'N/A'} | Count: ${b.count} Shoppers | Created: ${new Date(b.createdAt).toLocaleString()}\n`
      );
    });

    console.log('--- RECENT SHOPPERS ---');
    const recentShoppers = await Shopper.find().sort({ createdAt: -1 }).limit(5);
    recentShoppers.forEach((s, idx) => {
      console.log(
        `[#${idx + 1}] ${s.name} (${s.age} yrs) - ${s.occupation} in ${s.city}\n     Monthly Income: ₹${s.monthly_income} | Price Sensitivity: ${s.price_sensitivity}\n     Interests: ${s.interests.join(', ')}\n     Bio: "${s.bio}"\n     Doc ID: ${s._id} | Batch: ${s.batchId}\n`
      );
    });

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB. Verification complete.');
  } catch (err) {
    console.error('❌ MongoDB check failed:', err.message);
    process.exit(1);
  }
}

checkDatabase();
