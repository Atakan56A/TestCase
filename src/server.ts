import http, { IncomingMessage, ServerResponse } from 'http';
import movieRoutes from './routes/movieRoutes';
import directorRoutes from './routes/directorRoutes';
import { connectToDatabase } from './services/db';
import { sendResponse } from './utils/responseHandler';

// Create the HTTP server
const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  // Route requests based on URL path
  if (req.url?.startsWith('/movies')) {
    // Handle requests starting with '/movies' using the movie routes handler
    movieRoutes(req, res);
  } else if (req.url?.startsWith('/directors')) {
    // Handle requests starting with '/directors' using the director routes handler
    directorRoutes(req, res);
  } else {
    // Handle all other requests by returning a 404 Not Found error
    sendResponse(res, {
      status: 404,
      message: 'Route not found'
    });
  }
});

const PORT = 3000;

connectToDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});