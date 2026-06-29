import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../schemas/user.schema';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@epiclanka.lk',
    password: 'Admin@1234',
    role: 'admin' as const,
    customerSegment: 'premium' as const,
  },
  {
    name: 'Operations Staff',
    email: 'ops@epiclanka.lk',
    password: 'Ops@1234',
    role: 'ops' as const,
    customerSegment: 'standard' as const,
  },
  {
    name: 'Branch Manager',
    email: 'manager@epiclanka.lk',
    password: 'Manager@1234',
    role: 'manager' as const,
    customerSegment: 'premium' as const,
  },
  {
    name: 'Demo Customer',
    email: 'customer@epiclanka.lk',
    password: 'Customer@1234',
    role: 'customer' as const,
    customerSegment: 'standard' as const,
  },
];

async function seedUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-pfm');
    console.log('Connected.\n');

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(u.password, salt);

      if (existing) {
        // Keep demo accounts aligned with the documented credentials
        existing.name = u.name;
        existing.role = u.role;
        existing.passwordHash = passwordHash;
        existing.customerSegment = u.customerSegment;
        existing.pfmOptIn = true;
        existing.preferences = { language: 'en', notifications: true };
        await existing.save();
        console.log(`  ↺ Updated existing user: ${u.email} (${u.role})`);
        continue;
      }

      await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        customerSegment: u.customerSegment,
        pfmOptIn: true,
        preferences: { language: 'en', notifications: true },
      });
      console.log(`  ✓ Created: ${u.email} (${u.role}) — password: ${u.password}`);
    }

    console.log('\n✅ Seed complete!\n');
    console.log('Login credentials:');
    console.log('──────────────────────────────────────────────────────');
    console.log('ADMIN     → admin@epiclanka.lk     / Admin@1234');
    console.log('OPS       → ops@epiclanka.lk       / Ops@1234');
    console.log('MANAGER   → manager@epiclanka.lk   / Manager@1234');
    console.log('CUSTOMER  → customer@epiclanka.lk  / Customer@1234');
    console.log('──────────────────────────────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedUsers();
