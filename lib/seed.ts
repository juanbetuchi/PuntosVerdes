import { connectDB } from './mongodb'
import Media from './models/Media'
import Mapa from './models/Mapa'
import Pin from './models/Pin'

export async function seedIfEmpty() {
  await connectDB()

  const mapaCount = await Mapa.countDocuments()
  if (mapaCount > 0) return

  await Media.insertMany([
    { type: 'image', url: 'https://picsum.photos/seed/pv1/1200/500', orden: 0 },
    { type: 'image', url: 'https://picsum.photos/seed/pv2/1200/500', orden: 1 },
    { type: 'image', url: 'https://picsum.photos/seed/pv3/1200/500', orden: 2 },
  ])

  const mapaLocal = await Mapa.create({
    nombre: 'Centro de Reciclaje — Laboulaye',
    descripcion: 'Red de puntos verdes en el área urbana de Laboulaye',
    imageUrl: 'https://picsum.photos/seed/mapa-local/900/600',
    categoria: 'local',
    activo: true,
  })

  const mapaProvincial = await Mapa.create({
    nombre: 'Red Provincial de Residuos — Córdoba Sur',
    descripcion: 'Puntos de gestión de residuos a escala provincial',
    imageUrl: 'https://picsum.photos/seed/mapa-prov/900/600',
    categoria: 'provincial',
    activo: true,
  })

  await Pin.insertMany([
    {
      mapaId: mapaLocal._id,
      x: 28, y: 38,
      titulo: 'Punto Verde Norte',
      descripcion: 'Contenedores para papel, plástico y vidrio. Lunes a sábado 7-19 h.',
      imagenes: ['https://picsum.photos/seed/pin1/400/300'],
      videoUrl: '',
    },
    {
      mapaId: mapaLocal._id,
      x: 62, y: 55,
      titulo: 'Centro de Acopio Central',
      descripcion: 'Punto principal de acopio y clasificación de materiales reciclables.',
      imagenes: [
        'https://picsum.photos/seed/pin2/400/300',
        'https://picsum.photos/seed/pin3/400/300',
      ],
      videoUrl: '',
    },
    {
      mapaId: mapaLocal._id,
      x: 45, y: 72,
      titulo: 'Punto Verde Sur',
      descripcion: 'Aceite vegetal usado, pilas y electrónicos.',
      imagenes: ['https://picsum.photos/seed/pin4/400/300'],
      videoUrl: '',
    },
    {
      mapaId: mapaProvincial._id,
      x: 38, y: 42,
      titulo: 'Centro Regional Córdoba Sur',
      descripcion: 'Planta de procesamiento regional para la zona sur de la provincia.',
      imagenes: ['https://picsum.photos/seed/pin5/400/300'],
      videoUrl: '',
    },
    {
      mapaId: mapaProvincial._id,
      x: 65, y: 30,
      titulo: 'Nodo de Transferencia',
      descripcion: 'Punto de transferencia y logística entre municipios.',
      imagenes: ['https://picsum.photos/seed/pin6/400/300'],
      videoUrl: '',
    },
  ])
}
