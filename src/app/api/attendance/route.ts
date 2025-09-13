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

    // Calculate stats for teachers (use today's date if no date specified)
    let stats = {}
    if (isTeacher) {
      const totalStudents = await User.countDocuments({ role: 'siswa', class: 'XI-2' })

      // Use provided date or default to today
      const targetDate = dateStr ? new Date(dateStr) : new Date()
      targetDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      const dateQuery = { $gte: targetDate, $lt: nextDay }

      // Get unique attendance records (one per student per day)
      const dayAttendance = await Attendance.aggregate([
        {
          $match: {
            date: dateQuery,
            status: { $in: ['hadir', 'izin', 'sakit'] }
          }
        },
        {
          $group: {
            _id: '$student',
            status: { $first: '$status' },
            count: { $sum: 1 }
          }
        }
      ])

      const hadirCount = dayAttendance.filter(a => a.status === 'hadir').length
      const izinCount = dayAttendance.filter(a => a.status === 'izin').length
      const sakitCount = dayAttendance.filter(a => a.status === 'sakit').length
      const presentCount = hadirCount + izinCount + sakitCount

      stats = {
        hadir: hadirCount,
        izin: izinCount,
        sakit: sakitCount,
        alfa: Math.max(0, totalStudents - presentCount),
        total: totalStudents,
        attendanceRate: totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(2) : '0.00'
      }
    }

    // Calculate attendance trends for the last 7 days (only for teachers)
    let trends = {}
    if (isTeacher) {
      const trendsData = []
      const totalStudents = await User.countDocuments({ role: 'siswa', class: 'XI-2' })

      // Get data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        // Count unique students who attended that day
        const dayAttendance = await Attendance.aggregate([
          {
            $match: {
              date: { $gte: date, $lt: nextDay },
              status: 'hadir'
            }
          },
          {
            $group: {
              _id: '$student'
            }
          },
          {
            $count: 'uniqueStudents'
          }
        ])

        const presentCount = dayAttendance.length > 0 ? dayAttendance[0].uniqueStudents : 0

        trendsData.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          present: presentCount,
          absent: totalStudents - presentCount,
          percentage: totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0.0'
        })
      }

      // Calculate weekly average
      const weeklyTotal = trendsData.reduce((sum, day) => sum + parseFloat(day.percentage), 0)
      const weeklyAverage = (weeklyTotal / 7).toFixed(1)

      // Get top/bottom performers (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Get unique attendance days per student to avoid counting duplicates
      const studentStats = await Attendance.aggregate([
        {
          $match: {
            date: { $gte: thirtyDaysAgo },
            status: 'hadir'
          }
        },
        {
          $group: {
            _id: {
              student: '$student',
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$date'
                }
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id.student',
            attendanceCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $unwind: '$student'
        },
        {
          $project: {
            name: '$student.name',
            attendanceCount: 1,
            percentage: {
              $multiply: [
                { $divide: ['$attendanceCount', 30] },
                100
              ]
            }
          }
        },
        {
          $sort: { attendanceCount: -1 }
        }
      ])

      const topPerformers = studentStats.slice(0, 3)
      const bottomPerformers = studentStats.slice(-3).reverse()

      trends = {
        last7Days: trendsData,
        weeklyAverage: weeklyAverage,
        topPerformers,
        bottomPerformers
      }
    }

    return NextResponse.json({
      attendance,
      stats,
      trends,
      date: dateStr
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}