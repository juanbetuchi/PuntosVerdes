export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI not set' }, { status: 503 })
  }

  const { connectDB } = await import('@/lib/mongodb')
  const { seedIfEmpty } = await import('@/lib/seed')
  const Media = (await import('@/lib/models/Media')).default
  const Mapa  = (await import('@/lib/models/Mapa')).default
  const Pin   = (await import('@/lib/models/Pin')).default

  await connectDB()
  await seedIfEmpty()
  return NextResponse.json({
    media: await Media.countDocuments(),
    mapas: await Mapa.countDocuments(),
    pins:  await Pin.countDocuments(),
  })
}
