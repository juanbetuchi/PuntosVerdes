import { connectDB } from '@/lib/mongodb'
import Mapa from '@/lib/models/Mapa'
import Pin from '@/lib/models/Pin'
import { seedIfEmpty } from '@/lib/seed'
import PublicPage from '@/components/PublicPage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    await connectDB()
    await seedIfEmpty()

    const mapasRaw = await Mapa.find({ activo: true }).lean()
    const mapaIds  = mapasRaw.map(m => m._id)
    const pinsRaw  = await Pin.find({ mapaId: { $in: mapaIds } }).lean()

    const mapas = JSON.parse(JSON.stringify(mapasRaw))
    const pins  = JSON.parse(JSON.stringify(pinsRaw))

    const pinsMap: Record<string, typeof pins> = {}
    for (const pin of pins) {
      if (!pinsMap[pin.mapaId]) pinsMap[pin.mapaId] = []
      pinsMap[pin.mapaId].push(pin)
    }

    return <PublicPage mapas={mapas} pinsMap={pinsMap} />
  } catch {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center p-8">
          <div className="text-[#4caf50] text-5xl mb-4">🌿</div>
          <h1 className="text-xl font-bold text-white mb-2">Puntos Verdes</h1>
          <p className="text-white/50 text-sm">
            Configurá <code className="text-[#4caf50]">MONGODB_URI</code> en <code className="text-[#4caf50]">.env.local</code> para conectar la base de datos.
          </p>
        </div>
      </div>
    )
  }
}
