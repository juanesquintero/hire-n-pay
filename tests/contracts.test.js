const request = require('supertest');
const app = require('../src/app');

describe('GET /contracts/:id', () => {
    it('should return a specific contract if it exists and belongs to the profile', async () => {
        const res = await request(app)
            .get('/contracts/1')
            .set({ profile_id: 1 })
            .expect(200);

        expect(res.body).toHaveProperty('id', 1);
        expect(res.body).toHaveProperty('ClientId', 1);
    });

    it('should return a 404 if the contract does not exist or does not belong to the profile', async () => {
        await request(app)
            .get('/contracts/999')
            .set({ profile_id: 1 })
            .expect(404);
    });
});

describe('GET /contracts', () => {
    it('should return a list of non-terminated contracts for the authenticated user', async () => {
        const res = await request(app)
            .get('/contracts')
            .set({ profile_id: 1 })
            .expect(200);

        expect(res.body).toBeInstanceOf(Array);
    });
});
