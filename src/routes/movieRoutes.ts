import { IncomingMessage, ServerResponse } from 'http';
import { db } from '../services/db';
import { IMovie } from '../models/movie';
import { ObjectId, OptionalId } from 'mongodb';  // MongoDB'den ObjectId import ediyoruz

const movieRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'GET' && req.url === '/movies') {
    try {
      // Filmleri yönetmen ile birlikte çekiyoruz
      const movies = await db.collection('movies').aggregate([
        {
          $lookup: {
            from: 'directors', // yönetmen koleksiyonunu join ediyoruz
            localField: 'director',
            foreignField: '_id',
            as: 'director'  // sonucu 'director' olarak ekliyoruz
          }
        }
      ]).toArray();
      
      res.statusCode = 200;
      res.end(JSON.stringify(movies));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: 'Error fetching movies', error }));
    }
  } else if (req.method === 'POST' && req.url === '/movies') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const movieData = JSON.parse(body);

        // Gelen verideki director alanını ObjectId'ye çeviriyoruz
        const movie: IMovie = {
          ...movieData,
          director: new ObjectId(movieData.director),  // director alanını ObjectId yapıyoruz
        };

        // Filmi MongoDB'ye kaydediyoruz
        // await db.collection('movies').insertOne(movie);
        await db.collection('movies').insertOne(movie as OptionalId<IMovie>);

        res.statusCode = 201;
        res.end(JSON.stringify({ message: 'Movie created' }));
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Error creating movie', error }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
};

export default movieRoutes;