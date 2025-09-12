import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import Attendance from '@/models/Attendance'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isTeacher = session.user.role === 'guru'
  const isStudent = session.user.role === 'siswa'

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
      .populate('student', 'name email class')
      .sort({ timestamp: 1 })

    let attendance = allAttendance
  
    if (status) {
      attendance = allAttendance.filter(a => a.status === status)
    }
  
    if (isStudent) {
      // Students see only their own
      attendance = attendance.filter(a => a.student._id.toString() === session.user.id)
    }

    // Calculate stats only for teachers
    let stats = {}
    if (isTeacher) {
      const totalStudents = await User.countDocuments({ role: 'siswa', class: 'XI-2' })
      stats = {
        hadir: allAttendance.filter(a => a.status === 'hadir').length,
        izin: allAttendance.filter(a => a.status === 'izin').length,
        sakit: allAttendance.filter(a => a.status === 'sakit').length,
        alfa: totalStudents - allAttendance.length,
        total: totalStudents,
        attendanceRate: ((allAttendance.length / totalStudents) * 100).toFixed(2)
      }
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