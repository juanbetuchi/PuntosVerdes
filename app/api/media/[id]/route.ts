import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Media from '@/lib/models/Media'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-pin') === process.env.ADMIN_PIN
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const item = await Media.findByIdAndUpdate(params.id, body, { new: true })
  if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  await connectDB()
  await Media.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
