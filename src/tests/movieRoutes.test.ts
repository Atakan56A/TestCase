import request from 'supertest';
import http from 'http';
import movieRoutes from '../routes/movieRoutes';
import { db, redisClient } from '../services/db';
import { ObjectId } from 'mongodb';
import { IMovie } from '../models/movie';
import { createClient } from 'redis';

// Mocking Redis client and MongoDB database services
jest.mock('../services/db', () => ({
    db: {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn(),
        insertOne: jest.fn(),
        deleteOne: jest.fn(),
        updateOne: jest.fn(),
    },
    redisClient: jest.fn().mockReturnValue({
        get: jest.fn(),
        setEx: jest.fn(),
    }),
}));

// Creating a mock server to simulate HTTP requests
const createMockServer = (handler: http.RequestListener) => {
    return http.createServer(handler);
};

describe('Movie Routes', () => {
    let server: http.Server;

    beforeEach(() => {
        server = createMockServer(movieRoutes);
    });

    afterEach(() => {
        server.close();
        jest.clearAllMocks();
    });

    it('should delete a movie (DELETE /movies/:id)', async () => {
        const movieId = new ObjectId().toHexString();

        (db.collection('movies').deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

        const response = await request(server).delete(`/movies/${movieId}`);

        expect(db.collection('movies').deleteOne).toHaveBeenCalledWith({ _id: new ObjectId(movieId) });
        expect(response.status).toBe(200);
    });

    it('should update a movie (PUT /movies/:id)', async () => {
        const movieId = new ObjectId().toHexString();
        const updatedMovie = {
            title: 'The Matrix Reloaded',
        };

        (db.collection('movies').updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

        const response = await request(server)
            .put(`/movies/${movieId}`)
            .send(updatedMovie);

        expect(db.collection('movies').updateOne).toHaveBeenCalledWith(
            { _id: new ObjectId(movieId) },
            { $set: updatedMovie }
        );
        expect(response.status).toBe(200);
    });

    it('should return 404 for unknown routes', async () => {
        const response = await request(server).get('/unknown');

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Route not found');
    });
});
