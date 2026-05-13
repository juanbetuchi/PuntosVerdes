export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Pin from '@/lib/models/Pin'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const mapaId = searchParams.get('mapaId')
  const query = mapaId ? { mapaId } : {}
  const pins = await Pin.find(query).lean()
  return NextResponse.json(pins)
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-pin') !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const body = await req.json()
  const pin = await Pin.create(body)
  return NextResponse.json(pin, { status: 201 })
}
