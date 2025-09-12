const mongoose = require('mongoose')
require('dotenv').config({ path: '../.env.local' })

// Import the models
const Attendance = require('../src/models/Attendance').default
const connectDB = require('../src/lib/mongoose').default

async function resetAttendance() {
  try {
    console.log('Connecting to database...')
    await connectDB()

    console.log('Resetting attendance records...')
    const result = await Attendance.deleteMany({})

    console.log(`Successfully deleted ${result.deletedCount} attendance records`)
    console.log('Attendance reset completed')

    process.exit(0)
  } catch (error) {
    console.error('Error resetting attendance:', error)
    process.exit(1)
  }
}

resetAttendance()