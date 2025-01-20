import { ServerResponse } from "http";

type ResponseData = {
    status: number;
    message: string;
    data?: any;  // optional, for cases where we want to send additional data
  };
  
  export const sendResponse = (
    res: ServerResponse,
    { status, message, data }: ResponseData
  ) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(
        JSON.stringify({
          message,
          data: typeof data === 'string' ? JSON.parse(data) : data,
        }, null, 2)
      );
  };
  