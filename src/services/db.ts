import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

const url = 'mongodb+srv://atakankaplayan:slu53oJ7WD1oY7ST@moviescluster.xj6lh.mongodb.net/?retryWrites=true&w=majority&appName=moviesCluster';
const client = new MongoClient(url);

// Create the Redis client
const redisClient = createClient();

// Connecting to Redis
redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

export const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

export { redisClient };
export const db = client.db('movieDb');