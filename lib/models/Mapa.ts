import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMapa extends Document {
  nombre: string
  descripcion: string
  imageUrl: string
  categoria: 'local' | 'provincial'
  activo: boolean
}

const MapaSchema = new Schema<IMapa>({
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: '' },
  imageUrl:    { type: String, required: true },
  categoria:   { type: String, enum: ['local', 'provincial'], required: true },
  activo:      { type: Boolean, default: true },
}, { timestamps: true })

const Mapa: Model<IMapa> =
  mongoose.models.Mapa || mongoose.model<IMapa>('Mapa', MapaSchema)

export default Mapa
