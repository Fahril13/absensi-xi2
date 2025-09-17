import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import csv from 'csv-parser'
import { Readable } from 'stream'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'guru') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const formData = await req.formData()
    const file = formData.get('csvfile') as File

    if (!file || file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Please upload a valid CSV file' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const stream = Readable.from(buffer)
    const results: Record<string, string>[] = []

    return new Promise((resolve) => {
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          let successCount = 0
          let errorCount = 0
          const errors: string[] = []

          for (const row of results) {
            try {
              const { name, email, role = 'siswa', class: cls = 'XI-2' } = row

              if (!name || !email) {
                errors.push(`Row missing name or email: ${JSON.stringify(row)}`)
                errorCount++
                continue
              }

              // Check if user exists
              let user = await User.findOne({ email })

              if (user) {
                // Update existing
                user.name = name
                user.role = role as 'guru' | 'siswa'
                user.class = cls
                await user.save()
              } else {
                // Create new
                const defaultPassword = 'password123'
                const hashedPassword = await bcrypt.hash(defaultPassword, 12)

                user = new User({
                  name,
                  email,
                  password: hashedPassword,
                  role: role as 'guru' | 'siswa',
                  class: cls
                })
                await user.save()
              }

              successCount++
            } catch (err: unknown) {
              errors.push(`Error processing row ${JSON.stringify(row)}: ${(err as Error).message}`)
              errorCount++
            }
          }

          const responseData = {
            success: successCount,
            errors: errorCount,
            total: results.length,
            details: errors.length > 0 ? errors : null,
            message: `Import completed: ${successCount} successful, ${errorCount} errors. Default password for new users: password123`
          }

          resolve(NextResponse.json(responseData, { status: 200 }))
        })
        .on('error', () => {
          resolve(NextResponse.json({ error: 'Failed to parse CSV' }, { status: 500 }))
        })
    })
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Server error during import' }, { status: 500 })
  }
}