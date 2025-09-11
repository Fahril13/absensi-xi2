import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import QRSession from '@/models/QRSession'
import Attendance from '@/models/Attendance'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'siswa') {
    return NextResponse.json({ error: 'Unauthorized - Student only' }, { status: 401 })
  }

  try {
    const { qrData } = await request.json()

    if (!qrData) {
      return NextResponse.json({ error: 'No QR data provided' }, { status: 400 })
    }

    const { token, date, expires } = JSON.parse(qrData)

    await connectDB()

    const qrSession = await QRSession.findOne({ token })

    if (!qrSession || !qrSession.isActive) {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 })
    }

    if (new Date(expires) < new Date()) {
      qrSession.isActive = false
      await qrSession.save()
      return NextResponse.json({ error: 'QR code expired' }, { status: 400 })
    }

    if (qrSession.date !== date || date !== new Date().toISOString().split('T')[0]) {
      return NextResponse.json({ error: 'QR code not for today' }, { status: 400 })
    }

    const studentId = session.user.id

    if (qrSession.usedBy.includes(studentId)) {
      return NextResponse.json({ error: 'Already attended today' }, { status: 400 })
    }

    // Mark attendance
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      date: new Date(date)
    })

    if (existingAttendance) {
      return NextResponse.json({ error: 'Already marked attendance today' }, { status: 400 })
    }

    const attendance = new Attendance({
      student: studentId,
      date: new Date(date),
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