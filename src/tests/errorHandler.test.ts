import { ServerResponse } from 'http';
import { errorHandler } from '../utils/errorHandler';

// Mock the ServerResponse object
const mockResponse = () => {
  const res: Partial<ServerResponse> = {};
  res.statusCode = 0; // Başlangıç değeri
  res.end = jest.fn(); // jest.fn() ile bir mock fonksiyon oluşturuyoruz
  return res as ServerResponse;
};

describe('errorHandler', () => {
  it('should set status code to 500 and send error message as JSON', () => {
    const res = mockResponse();
    const error = new Error('Test error message');

    errorHandler(res, error);

    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: 'Internal Server Error', error: 'Test error message' }));
  });

    it('should handle errors without messages gracefully', () => {
        const res = mockResponse();
        const error = new Error();

        errorHandler(res, error);

        expect(res.statusCode).toBe(500);
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: 'Internal Server Error', error: "" }));
    });

    it('should handle object errors', () => {
        const res = mockResponse();
        const error = {message: "Object error", code: 123};

        errorHandler(res, error);

        expect(res.statusCode).toBe(500);
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: 'Internal Server Error', error: "Object error" }));
    });
});