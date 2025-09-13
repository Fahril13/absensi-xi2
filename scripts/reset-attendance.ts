import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Import the models
import Attendance from '../src/models/Attendance'
import connectDB from '../src/lib/mongoose'

async function resetAttendance() {
  try {
    console.log('Connecting to database...')
    await connectDB()

    console.log('Resetting attendance records...')
    const result = await Attendance.deleteMany({})

    console.log(`Successfully deleted ${result.deletedCount} attendance records`)
    console.log('Attendance reset completed')

    return { success: true, deletedCount: result.deletedCount }
  } catch (error) {
    console.error('Error resetting attendance:', error)
    throw error
  }
}

export { resetAttendance }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetAttendance().then(() => process.exit(0)).catch(() => process.exit(1))
}