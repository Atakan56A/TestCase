// __tests__/responseHandler.test.ts
import { sendResponse } from '../utils/responseHandler';
import { ServerResponse } from 'http';

describe('sendResponse', () => {
  let res: ServerResponse;

  beforeEach(() => {
    // Mock ServerResponse
    res = {
      statusCode: 0,
      setHeader: jest.fn(),
      end: jest.fn(),
    } as unknown as ServerResponse;
  });

  it('should send correct response with status 200 and message', () => {
    sendResponse(res, { status: 200, message: 'Success' });

    expect(res.statusCode).toBe(200);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ message: 'Success'}, null, 2)
    );
  });

  it('should send response with data', () => {
    const data = { title: 'Test Movie' };
    sendResponse(res, { status: 201, message: 'Created', data });

    expect(res.statusCode).toBe(201);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ message: 'Created', data }, null, 2)
    );
  });
});
