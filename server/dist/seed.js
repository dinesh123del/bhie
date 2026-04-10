import { createDefaultAdmin } from './utils/createDefaultAdmin.js';
import { connectDB } from './config/db.js';
async function seed() {
    try {
        console.log('🌱 Starting database seeding...');
        // Connect to database
        await connectDB();
        // Create default admin user
        await createDefaultAdmin();
        console.log('✅ Database seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
}
seed();
