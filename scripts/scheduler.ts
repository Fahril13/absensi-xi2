import cron from 'node-cron'
import { resetAttendance } from './reset-attendance'

// Schedule to run at 22:00 UTC daily (6:00 AM Asia/Makassar time, UTC+8)
cron.schedule('0 22 * * *', async () => {
  console.log('Running scheduled attendance reset...')
  try {
    const result = await resetAttendance()
    console.log('Scheduled reset completed:', result)
  } catch (error) {
    console.error('Scheduled reset failed:', error)
  }
}, {
  timezone: "UTC"
})

console.log('Attendance reset scheduler started. Will run daily at 22:00 UTC (6:00 AM local time).')

// Keep the process running
process.on('SIGINT', () => {
  console.log('Scheduler stopped.')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Scheduler stopped.')
  process.exit(0)
})