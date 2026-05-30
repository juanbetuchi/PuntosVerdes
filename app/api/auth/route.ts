export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PIN) {
    return NextResponse.json({ error: 'No configurado' }, { status: 500 })
  }
  const { pin } = await req.json()
  if (pin && pin === process.env.ADMIN_PIN) {
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
}
