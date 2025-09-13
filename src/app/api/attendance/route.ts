import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import mongoose from 'mongoose'
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

    const query: Record<string, unknown> = {}
    if (dateStr) {
      const date = new Date(dateStr)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      query.date = { $gte: date, $lt: nextDay }
    }
  
    if (isStudent) {
      query.student = new mongoose.Types.ObjectId(session.user.id)
    }
  
    // Get all students
    const allStudents = await User.find({ role: 'siswa', class: 'XI-2' })

    // Get attendance records for the specified date
    const attendanceRecords = await Attendance.find(query)
      .populate('student', 'name email class')
      .sort({ timestamp: 1 })

    // Create attendance map for quick lookup
    const attendanceMap = new Map()
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.student._id.toString(), record)
    })

    // Combine students with their attendance status
    let attendance = allStudents.map(student => {
      const record = attendanceMap.get(student._id.toString())
      if (record) {
        return {
          _id: record._id,
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            class: student.class
          },
          date: record.date,
          status: record.status,
          timestamp: record.timestamp
        }
      } else {
        // Student hasn't scanned QR yet - mark as absent
        return {
          _id: `absent-${student._id}`,
          student: {
            _id: student._id,
            name: student.name,
            email: student.email,
            class: student.class
          },
          date: dateStr ? new Date(dateStr) : new Date(),
          status: 'alfa',
          timestamp: null
        }
      }
    })

    // Filter by status if specified
    if (status) {
      attendance = attendance.filter(a => a.status === status)
    }

    // Calculate stats only for teachers and only if date is specified
    let stats = {}
    if (isTeacher && dateStr) {
      const totalStudents = await User.countDocuments({ role: 'siswa', class: 'XI-2' })
      const dateQuery = query.date || { $gte: new Date(new Date().setHours(0,0,0,0)), $lt: new Date(new Date().setDate(new Date().getDate() + 1)) }
      const dayAttendance = await Attendance.find({ date: dateQuery }).populate('student', 'name email class')
      stats = {
        hadir: dayAttendance.filter(a => a.status === 'hadir').length,
        izin: dayAttendance.filter(a => a.status === 'izin').length,
        sakit: dayAttendance.filter(a => a.status === 'sakit').length,
        alfa: totalStudents - dayAttendance.length,
        total: totalStudents,
        attendanceRate: ((dayAttendance.length / totalStudents) * 100).toFixed(2)
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