import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Media from '@/lib/models/Media'

export async function GET() {
  await connectDB()
  const items = await Media.find().sort({ orden: 1 }).lean()
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-pin') !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const body = await req.json()
  const last = await Media.findOne().sort({ orden: -1 }).lean()
  const orden = last ? last.orden + 1 : 0
  const item = await Media.create({ ...body, orden })
  return NextResponse.json(item, { status: 201 })
}
