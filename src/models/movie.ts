import mongoose, { Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  releaseDate: Date;
  genre: string;
  rating: number;
  imdbId: string;
  director: mongoose.Types.ObjectId;  // Director, ObjectId olarak tanımlı
}

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  imdbId: { type: String, required: true },
  director: { type: mongoose.Types.ObjectId, ref: 'Director', required: true }  // Director referansı
});

export default mongoose.model<IMovie>('Movie', MovieSchema);
