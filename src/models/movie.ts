import { ObjectId } from 'mongodb';
import mongoose, { Document, Schema} from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  releaseDate: Date;
  genre: string;
  rating: number;
  imdbId: string;
  director: ObjectId | ObjectId[];
}

const MovieSchema: Schema<IMovie> = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  imdbId: { type: String, required: true },
  director: [{ type: Schema.Types.ObjectId, ref: 'Director', required: true }] // Yönetmen referansları dizisi
}, { timestamps: true });

export default mongoose.model<IMovie>('Movie', MovieSchema);
