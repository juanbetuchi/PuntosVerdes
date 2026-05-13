import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Mapa from '@/lib/models/Mapa'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const categoria = searchParams.get('categoria')
  const activo    = searchParams.get('activo')

  const query: Record<string, unknown> = {}
  if (categoria) query.categoria = categoria
  if (activo !== null) query.activo = activo === 'true'

  const mapas = await Mapa.find(query).lean()
  return NextResponse.json(mapas)
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-pin') !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const body = await req.json()
  const mapa = await Mapa.create(body)
  return NextResponse.json(mapa, { status: 201 })
}
