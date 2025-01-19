import http, { IncomingMessage, ServerResponse } from 'http';
import movieRoutes from './routes/movieRoutes';
import directorRoutes from './routes/directorRoutes';
import { connectToDatabase } from './services/db';

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url?.startsWith('/movies')) {
    movieRoutes(req, res);
  } else if (req.url?.startsWith('/directors')) {
    directorRoutes(req, res);
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

const PORT = 3000;

connectToDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});