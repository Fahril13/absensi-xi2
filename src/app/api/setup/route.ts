import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    await connectDB()

    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ role: 'guru' })
    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists!',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      })
    }

    // Create default admin user
    const adminData = {
      name: "Administrator XI2",
      email: "admin@xi2.sch.id",
      password: await bcrypt.hash("admin123", 12),
      role: "guru",
      class: "XI-2"
    }

    const adminUser = new User(adminData)
    await adminUser.save()

    return NextResponse.json({
      message: 'Admin user created successfully!',
      admin: {
        name: adminData.name,
        email: adminData.email,
        password: "admin123" // Plain text for display only
      },
      instructions: [
        "1. Login dengan email: admin@xi2.sch.id",
        "2. Password: admin123",
        "3. Setelah login, klik 'Admin Panel' di dashboard",
        "4. Buat akun siswa melalui interface admin"
      ]
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}