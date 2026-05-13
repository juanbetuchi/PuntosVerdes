import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMedia extends Document {
  type: 'video' | 'image'
  url: string
  orden: number
}

const MediaSchema = new Schema<IMedia>({
  type: { type: String, enum: ['video', 'image'], required: true },
  url:  { type: String, required: true },
  orden: { type: Number, default: 0 },
}, { timestamps: true })

const Media: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)

export default Media
