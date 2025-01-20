import { IncomingMessage, ServerResponse } from 'http';
import { db, redisClient } from '../services/db';
import { IMovie } from '../models/movie';
import { ObjectId, OptionalId } from 'mongodb';
import { errorHandler } from '../utils/errorHandler';
import { sendResponse } from '../utils/responseHandler';

const movieRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  // Handle GET requests to '/movies' endpoint to fetch movies
  if (req.method === 'GET' && req.url === '/movies') {
    try {

      // First we check if there is a cache in Redis
      const cachedMovies = await redisClient.get('movies');

      if (cachedMovies) {
        sendResponse(res, {
          status: 200,
          message: 'Movies fetched successfully',
          data: cachedMovies,
        });
        return;
      }

      // Perform aggregation to join movies with director details
      const movies = await db.collection('movies').aggregate([
        {
          $lookup: {
            from: 'directors',
            localField: 'director',
            foreignField: '_id',
            as: 'director'
          }
        }
      ]).toArray();

      // We cache the data in Redis (for example it will be stored for 60 seconds)
      await redisClient.setEx('movies', 60, JSON.stringify(movies));

      sendResponse(res, {
        status: 200,
        message: 'Movies fetched successfully',
        data: movies,
      });
    } catch (error) {
      console.error(error); // Log error for debugging
      errorHandler(res, error);
    }
  }
  // Handle POST requests to '/movies' endpoint to create new movies
  else if (req.method === 'POST' && req.url === '/movies') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const movie: IMovie = JSON.parse(body) as IMovie;

        // Handle potential 'director' field conversion to ObjectId if needed
        if (movie.director && typeof movie.director === 'string') {
          movie.director = new ObjectId(movie.director);
        } else if (Array.isArray(movie.director) && movie.director.every(item => typeof item === 'string')) {
          movie.director = movie.director.map(directorId => new ObjectId(directorId))
        }

        await db.collection('movies').insertOne(movie as OptionalId<IMovie>); // Insert the new movie
        sendResponse(res, {
          status: 201,
          message: 'Movie created successfully'
        });
      } catch (error) {
        console.error(error); // Log error for debugging
        errorHandler(res, error);
      }
    });
  }
  // Handle DELETE requests to '/movies/:id' endpoint to delete movies
  else if (req.method === 'DELETE' && req.url && req.url.startsWith('/movies/')) {
    const movieId = req.url.split('/')[2];

    // Check for valid ObjectId format
    if (!ObjectId.isValid(movieId)) {
      sendResponse(res, {
        status: 400,
        message: 'Invalid movie ID'
      });
      return;
    }

    try {
      const deletionResult = await db.collection('movies').deleteOne({ _id: new ObjectId(movieId) });

      if (deletionResult.deletedCount === 1) {
        sendResponse(res, {
          status: 200,
          message: 'Movie deleted successfully'
        });
      } else {
        sendResponse(res, {
          status: 404,
          message: 'Movie not found'
        });
      }
    } catch (error) {
      console.error(error); // Log error for debugging     
      errorHandler(res, error);
    }
  }
  // Handle PUT requests to '/movies/:id' endpoint to update movies
  else if (req.method === 'PUT' && req.url && req.url.startsWith('/movies/')) {
    const movieId = req.url.split('/')[2];

    // Check for valid ObjectId format
    if (!ObjectId.isValid(movieId)) {
      sendResponse(res, {
        status: 400,
        message: 'Invalid movie ID'
      });
      return;
    }

    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const movieUpdate: IMovie = JSON.parse(body) as IMovie;

        // Handle potential 'director' field conversion to ObjectId if needed
        if (movieUpdate.director) {
          if (typeof movieUpdate.director === 'string') {
            movieUpdate.director = new ObjectId(movieUpdate.director);
          } else if (Array.isArray(movieUpdate.director) && movieUpdate.director.every(item => typeof item === 'string')) {
            movieUpdate.director = movieUpdate.director.map((directorId) => new ObjectId(directorId));
          }
        }

        const updateResult = await db.collection('movies').updateOne(
          { _id: new ObjectId(movieId) },
          { $set: movieUpdate }
        );

        if (updateResult.modifiedCount === 1) {
          sendResponse(res, {
            status: 200,
            message: 'Movie updated successfully'
          });
        } else {
          sendResponse(res, {
            status: 404,
            message: 'Movie not found'
          });
        }
      } catch (error) {
        console.error(error); // Log error for debugging
        errorHandler(res, error);
      }
    });
  } else {
    sendResponse(res, {
      status: 404,
      message: 'Route not found'
    });
  }
};

export default movieRoutes;