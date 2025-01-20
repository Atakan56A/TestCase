import { IncomingMessage, ServerResponse } from 'http';
import { db, redisClient } from '../services/db';
import { errorHandler } from '../utils/errorHandler';
import { sendResponse } from '../utils/responseHandler';
import directorRoutes from '../routes/directorRoutes';

jest.mock('../services/db', () => ({
    db: {
        collection: jest.fn().mockReturnValue({
            aggregate: jest.fn().mockReturnValue({
                toArray: jest.fn(),
            }),
            insertOne: jest.fn()
        }),
    },
    redisClient: {
        get: jest.fn(),
        setEx: jest.fn(),
    },
}));

jest.mock('../utils/errorHandler');
jest.mock('../utils/responseHandler');

const mockRequest = (method: string, url: string, body?: any) => {
    const req: Partial<IncomingMessage> = {
        method,
        url,
        on: jest.fn(function (event, callback) {
            if (event === 'end') {
                callback();
            } else if (event === 'data' && body) {
                callback(JSON.stringify(body));
            }
            return this;
        }),
    };
    return req as IncomingMessage;
};

const mockResponse = () => {
    const res: Partial<ServerResponse> = {
        statusCode: 0,
        end: jest.fn(),
        setHeader: jest.fn()
    };
    return res as ServerResponse;
};

describe('directorRoutes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch directors from Redis cache if available', async () => {
        const req = mockRequest('GET', '/directors');
        const res = mockResponse();
        const cachedDirectors = '[{"firstName": "Test Director"}]';
        (redisClient.get as jest.Mock).mockResolvedValue(cachedDirectors);

        await directorRoutes(req, res);

        expect(redisClient.get).toHaveBeenCalledWith('movies');
        expect(sendResponse).toHaveBeenCalledWith(res, {
            status: 200,
            message: 'Directors fetched successfully',
            data: cachedDirectors,
        });
        expect(db.collection).not.toHaveBeenCalled();
    });

    it('should fetch directors from MongoDB if not cached and cache the result', async () => {
        const req = mockRequest('GET', '/directors');
        const res = mockResponse();
        const directorsFromDb = [{ firstName: 'Test Director' }];
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        (db.collection as jest.Mock).mockReturnValue({
            aggregate: jest.fn().mockReturnValue({
                toArray: jest.fn().mockResolvedValue(directorsFromDb),
            }),
        });

        await directorRoutes(req, res);

        expect(redisClient.get).toHaveBeenCalledWith('movies');
        expect(db.collection).toHaveBeenCalledWith('directors');
        expect(redisClient.setEx).toHaveBeenCalledWith('directors', 60, JSON.stringify(directorsFromDb));
        expect(sendResponse).toHaveBeenCalledWith(res, {
            status: 200,
            message: 'Directory fetched successfully',
            data: directorsFromDb,
        });
    });

    it('should handle errors during fetching directors', async () => {
        const req = mockRequest('GET', '/directors');
        const res = mockResponse();
        const errorMessage = 'Database error';
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        (db.collection as jest.Mock).mockReturnValue({
            aggregate: jest.fn().mockReturnValue({
                toArray: jest.fn().mockRejectedValue(new Error(errorMessage)),
            }),
        });

        await directorRoutes(req, res);

        expect(errorHandler).toHaveBeenCalledWith(res, new Error(errorMessage));
    });

    it('should handle errors during director creation', async () => {
        const req = mockRequest('POST', '/directors', { firstName: "test" });
        const res = mockResponse();
        const errorMessage = "Insert error";
        (db.collection as jest.Mock).mockReturnValue({
            insertOne: jest.fn().mockRejectedValue(new Error(errorMessage))
        })

        await directorRoutes(req, res);

        expect(errorHandler).toHaveBeenCalledWith(res, new Error(errorMessage));
    });

    it('should return 404 for other routes', async () => {
        const req = mockRequest('GET', '/other');
        const res = mockResponse();

        await directorRoutes(req, res);

        expect(sendResponse).toHaveBeenCalledWith(res, { status: 404, message: 'Route not found' });
    });
});