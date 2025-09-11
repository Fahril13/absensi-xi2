import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import QRSession from '@/models/QRSession'


export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'guru') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const today = new Date().toISOString().split('T')[0]
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 min validity

    const qrSession = new QRSession({
      token,
      date: today,
      expiresAt,
      usedBy: []
    })

    await qrSession.save()

    const qrData = JSON.stringify({
      token,
      date: today,
      expires: expiresAt.toISOString()
    })

    const qrSvg = await QRCode.toString(qrData, {
      type: 'svg',
      width: 200,
      margin: 2,
    })

    return NextResponse.json({
      qrCode: qrSvg,
      token,
      expiresAt: expiresAt.toISOString()
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 })
  }
}