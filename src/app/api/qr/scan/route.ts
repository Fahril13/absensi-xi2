import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import QRSession from '@/models/QRSession'
import Attendance from '@/models/Attendance'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized - Student only' }, { status: 401 })
  }

  try {
    const { qrData: token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const email = session.user.email

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const studentId = user._id

    const qrSession = await QRSession.findOne({ token })

    if (!qrSession || !qrSession.isActive) {
      return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 })
    }

    if (qrSession.expiresAt < new Date()) {
      qrSession.isActive = false
      await qrSession.save()
      return NextResponse.json({ error: 'QR code expired' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    if (qrSession.date !== today) {
      return NextResponse.json({ error: 'QR code not for today' }, { status: 400 })
    }


    if (qrSession.usedBy.includes(studentId)) {
      return NextResponse.json({ error: 'Already attended today' }, { status: 400 })
    }

    // Mark attendance
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      date: new Date(today)
    })

    if (existingAttendance) {
      return NextResponse.json({ error: 'Already marked attendance today' }, { status: 400 })
    }

    const attendance = new Attendance({
      student: studentId,
      date: new Date(today),
      status: 'hadir',
      timestamp: new Date()
    })

    await attendance.save()

    // Update QR session
    qrSession.usedBy.push(studentId)
    await qrSession.save()

    return NextResponse.json({ success: true, message: 'Attendance marked successfully' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 })
  }
}