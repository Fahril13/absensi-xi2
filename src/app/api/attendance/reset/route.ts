import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import Attendance from '@/models/Attendance'

export async function POST() {
  try {
    await connectDB()

    // Delete all attendance records (this will reset everyone to absent)
    await Attendance.deleteMany({})

    return NextResponse.json({
      success: true,
      message: 'Attendance reset successfully'
    })
  } catch (error) {
    console.error('Error resetting attendance:', error)
    return NextResponse.json({
      error: 'Failed to reset attendance'
    }, { status: 500 })
  }
}