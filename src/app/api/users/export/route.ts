import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import User from '@/models/User'

export async function GET() {
  await connectDB()
  const users = await User.find({ class: 'XI-2' }).select('-password')
  
  const headers = ['Name', 'Email', 'Role', 'Class']
  const csvRows = [
    headers.join(','),
    ...users.map(user => [
      `"${user.name.replace(/"/g, '""')}"`,
      `"${user.email.replace(/"/g, '""')}"`,
      user.role,
      user.class
    ].join(','))
  ]
  
  const csv = csvRows.join('\n')
  
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="users-xi2.csv"'
    }
  })
}