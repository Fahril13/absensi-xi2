require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema (copy dari models/User.ts)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guru', 'siswa'], required: true },
  class: { type: String, default: 'XI-2' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUsers() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user first
    const adminUser = {
      name: "Administrator",
      email: "admin@xi2.sch.id",
      password: "admin123",
      role: "guru",
      class: "XI-2"
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log(`Admin user ${adminUser.email} already exists!`);
      console.log('Login credentials:');
      console.log('Email: admin@xi2.sch.id');
      console.log('Password: admin123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminUser.password, 12);

    // Create admin user
    const user = new User({
      ...adminUser,
      password: hashedPassword
    });

    await user.save();
    console.log(`✅ Created admin user: ${adminUser.name} (${adminUser.email})`);
    console.log('\n🚀 Admin Panel Access:');
    console.log('================================');
    console.log('🌐 URL: http://localhost:3000/admin');
    console.log('👤 Email: admin@xi2.sch.id');
    console.log('🔑 Password: admin123');
    console.log('================================');
    console.log('\n📝 Instructions:');
    console.log('1. Login dengan akun admin di atas');
    console.log('2. Buka http://localhost:3000/admin');
    console.log('3. Klik "Tambah User" untuk buat akun siswa');
    console.log('4. Siswa bisa login dan scan QR untuk absensi');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Pastikan MONGODB_URI di .env.local sudah benar');
    console.log('2. Pastikan MongoDB Atlas network access sudah allow all (0.0.0.0/0)');
    console.log('3. Check database user credentials di MongoDB Atlas');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedUsers();