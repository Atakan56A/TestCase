import { ServerResponse } from 'http';

export const errorHandler = (res: ServerResponse, error: any) => {
  res.statusCode = 500;
  res.end(JSON.stringify({ message: 'Internal Server Error', error: error.message }));
};