export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Mapa from '@/lib/models/Mapa'
import Pin from '@/lib/models/Pin'

function authorized(req: NextRequest) {
  return req.headers.get('x-admin-pin') === process.env.ADMIN_PIN
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  await connectDB()
  const body = await req.json()
  const mapa = await Mapa.findByIdAndUpdate(params.id, body, { new: true })
  if (!mapa) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(mapa)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!authorized(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  await connectDB()
  await Pin.deleteMany({ mapaId: params.id })
  await Mapa.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
