import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import Attendance from '@/models/Attendance'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'guru') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const status = searchParams.get('status')

    if (!dateStr) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    const allAttendance = await Attendance.find({
      date: {
        $gte: date,
        $lt: nextDay
      }
    })
      .populate('student', 'name email')
      .sort({ timestamp: 1 })

    let attendance = allAttendance

    if (status) {
      attendance = allAttendance.filter(a => a.status === status)
    }

    // Calculate stats on all attendance for the day
    const totalStudents = await User.countDocuments({ role: 'siswa', class: 'XI-2' })
    const stats = {
      hadir: allAttendance.filter(a => a.status === 'hadir').length,
      izin: allAttendance.filter(a => a.status === 'izin').length,
      sakit: allAttendance.filter(a => a.status === 'sakit').length,
      alfa: totalStudents - allAttendance.length,
      total: totalStudents,
      attendanceRate: ((allAttendance.length / totalStudents) * 100).toFixed(2)
    }

    return NextResponse.json({
      attendance,
      stats,
      date: dateStr
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}