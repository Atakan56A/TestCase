import { MongoClient } from 'mongodb';

const url = 'mongodb+srv://atakankaplayan:slu53oJ7WD1oY7ST@moviescluster.xj6lh.mongodb.net/?retryWrites=true&w=majority&appName=moviesCluster';
const client = new MongoClient(url);

export const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

export const db = client.db('movieDb');