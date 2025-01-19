import { IncomingMessage, ServerResponse } from 'http';
import { db } from '../services/db';
import { Director } from '../models/director';

const directorRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === 'POST' && req.url === '/directors') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const director: Director = JSON.parse(body);
      await db.collection('directors').insertOne(director);
      res.statusCode = 201;
      res.end(JSON.stringify({ message: 'Director created' }));
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
};

export default directorRoutes;