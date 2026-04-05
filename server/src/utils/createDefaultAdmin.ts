import User from '../models/User.js';
import { env } from '../config/env.js';

export const createDefaultAdmin = async (): Promise<void> => {
  try {
    if (!env.SHOULD_SEED_DEFAULT_ADMIN || !env.ADMIN_SEED_EMAIL || !env.ADMIN_SEED_PASSWORD) {
      return;
    }

    const adminEmail = env.ADMIN_SEED_EMAIL;
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      const passwordMatches = await existingAdmin.comparePassword(env.ADMIN_SEED_PASSWORD);

      if (!passwordMatches) {
        existingAdmin.password = env.ADMIN_SEED_PASSWORD;
        await existingAdmin.save();
        console.log(`✅ Seed admin password reset: ${adminEmail}`);
        return;
      }

      console.log(`✅ Seed admin user already exists: ${adminEmail}`);
      return;
    }

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: env.ADMIN_SEED_PASSWORD,
      role: 'admin',
    });

    console.log(`✅ Seed admin user created: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};
