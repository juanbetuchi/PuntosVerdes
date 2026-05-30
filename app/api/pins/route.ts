export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Pin from '@/lib/models/Pin'

export async function GET(req: NextRequest) {
  await connectDB()
  try {
    const { searchParams } = new URL(req.url)
    const mapaId = searchParams.get('mapaId')
    const query = mapaId ? { mapaId } : {}
    const pins = await Pin.find(query).lean()
    return NextResponse.json(pins)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-pin') !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  try {
    const body = await req.json()
    const pin = await Pin.create(body)
    return NextResponse.json(pin, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear pin'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
