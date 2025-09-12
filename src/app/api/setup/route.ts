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
        message: 'Setup already completed! Users already exist.',
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

    // Create test student users
    const testStudents = [
      { name: "Walid", email: "walid@xi2.sch.id" },
      { name: "Ciki", email: "ciki@xi2.sch.id" },
      { name: "Kevin", email: "kevin@xi2.sch.id" },
      { name: "Mutia", email: "mutia@xi2.sch.id" },
      { name: "Yasni", email: "yasni@xi2.sch.id" }
    ]

    const createdStudents = []

    for (const student of testStudents) {
      const studentData = {
        name: student.name,
        email: student.email,
        password: await bcrypt.hash("test123", 12),
        role: "siswa",
        class: "XI-2"
      }

      const studentUser = new User(studentData)
      await studentUser.save()

      createdStudents.push({
        name: student.name,
        email: student.email,
        password: "test123"
      })
    }

    return NextResponse.json({
      message: 'Setup completed successfully! Admin and test students created.',
      admin: {
        name: adminData.name,
        email: adminData.email,
        password: "admin123"
      },
      students: createdStudents,
      instructions: [
        "🎓 SISWA LOGIN:",
        "Walid: walid@xi2.sch.id / test123",
        "Ciki: ciki@xi2.sch.id / test123",
        "Kevin: kevin@xi2.sch.id / test123",
        "Mutia: mutia@xi2.sch.id / test123",
        "Yasni: yasni@xi2.sch.id / test123",
        "",
        "👨‍🏫 ADMIN LOGIN:",
        "admin@xi2.sch.id / admin123",
        "",
        "📱 Cara test:",
        "1. Login sebagai siswa",
        "2. Login sebagai admin untuk generate QR",
        "3. Siswa scan QR untuk absensi"
      ]
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create users. Check MongoDB connection.' },
      { status: 500 }
    )
  }
}