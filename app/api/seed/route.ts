import { NextResponse } from 'next/server'
import { seedIfEmpty } from '@/lib/seed'
import { connectDB } from '@/lib/mongodb'
import Media from '@/lib/models/Media'
import Mapa from '@/lib/models/Mapa'
import Pin from '@/lib/models/Pin'

export async function GET() {
  await connectDB()
  await seedIfEmpty()
  return NextResponse.json({
    media: await Media.countDocuments(),
    mapas: await Mapa.countDocuments(),
    pins:  await Pin.countDocuments(),
  })
}
