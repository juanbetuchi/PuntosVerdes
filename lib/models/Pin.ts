import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IPin extends Document {
  mapaId: Types.ObjectId
  x: number
  y: number
  titulo: string
  descripcion: string
  imagenes: string[]
  videoUrl: string
  audioUrl: string
  direccion: string
  color: 'green' | 'yellow' | 'red' | 'blue'
  materiales: string[]
  lat: number | null
  lng: number | null
}

const PinSchema = new Schema<IPin>({
  mapaId:      { type: Schema.Types.ObjectId, required: true, ref: 'Mapa' },
  x:           { type: Number, required: true },
  y:           { type: Number, required: true },
  titulo:      { type: String, required: true },
  descripcion: { type: String, default: '' },
  imagenes:    [{ type: String }],
  videoUrl:    { type: String, default: '' },
  audioUrl:    { type: String, default: '' },
  direccion:   { type: String, default: '' },
  color:       { type: String, default: 'green', enum: ['green', 'yellow', 'red', 'blue'] },
  materiales:  [{ type: String }],
  lat:         { type: Number, default: null },
  lng:         { type: Number, default: null },
}, { timestamps: true })

const Pin: Model<IPin> =
  mongoose.models.Pin || mongoose.model<IPin>('Pin', PinSchema)

export default Pin
