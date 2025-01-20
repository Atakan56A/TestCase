import mongoose, { Schema, Document } from 'mongoose';

export interface IDirector extends Document {
  firstName: string;
  lastName: string;
  birthDate: Date;
  bio: string;
}

const DirectorSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  bio: { type: String, required: true }
});

export default mongoose.model<IDirector>('Director', DirectorSchema);