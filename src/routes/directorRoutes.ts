import { IncomingMessage, ServerResponse } from 'http';
import { db, redisClient } from '../services/db';
import { IDirector } from '../models/director';
import { ObjectId, OptionalId } from 'mongodb';
import { errorHandler } from '../utils/errorHandler';
import { sendResponse } from '../utils/responseHandler';

const directorRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  // Handle GET requests to '/directors' to fetch all directors and their movies
  if (req.method === 'GET' && req.url === '/directors') {
    try {
      // First we check if there is a cache in Redis
      const cachedDirectors = await redisClient.get('movies');

      if (cachedDirectors) {
        sendResponse(res, {
          status: 200,
          message: 'Directors fetched successfully',
          data: cachedDirectors,
        });
        return;
      }

      // Use MongoDB aggregation pipeline to join directors with their movies
      const directors = await db.collection('directors').aggregate([
        {
          $lookup: {
            from: 'movies',
            localField: '_id',
            foreignField: 'director',
            as: 'movies'
          }
        },
        {
          $unwind: {
            path: '$movies',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            firstName: { $first: '$firstName' },
            secondName: { $first: '$secondName' },
            birthDate: { $first: '$birthDate' },
            bio: { $first: '$bio' },
            movies: { $push: '$movies' }
          }
        }
      ]).toArray();

      // We cache the data in Redis (for example it will be stored for 60 seconds)
      await redisClient.setEx('directors', 60, JSON.stringify(directors));

      sendResponse(res, {
        status: 200,
        message: 'Directory fetched successfully',
        data: directors,
      });
    } catch (error) {
      console.error(error); // Log the error to the console for debugging
      errorHandler(res, error);
    }
  }
  // Handle POST requests to '/directors' to create a new director
  else if (req.method === 'POST' && req.url === '/directors') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const director: IDirector = JSON.parse(body) as IDirector;

        await db.collection('directors').insertOne(director as OptionalId<IDirector>);

        sendResponse(res, {
          status: 200,
          message: 'Director created'
        });
      } catch (error) {
        errorHandler(res, error);
      }
    });
  }
  // Handle other requests by returning 404 Not Found
  else {
    sendResponse(res, {
      status: 404,
      message: 'Route not found'
    });
  }
};

export default directorRoutes;