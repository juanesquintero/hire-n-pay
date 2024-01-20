const request = require('supertest');
const app = require('../src/app');


describe('GET /admin/best-profession', () => {
    it('should return the profession that earned the most', async () => {
        const res = await request(app)
            .get('/admin/best-profession?start=2020-01-01&end=2020-12-31')
            .set({ profile_id: 1 })
            .expect(200);

        expect(res.body).toHaveProperty('profession');
        expect(res.body).toHaveProperty('total');
    });
});

describe('GET /admin/best-clients', () => {
    it('should return the clients who paid the most for jobs', async () => {
        const res = await request(app)
            .get('/admin/best-clients?start=2020-01-01&end=2020-12-31&limit=3')
            .set({ profile_id: 1 }) // Assuming profile_id is used for authentication
            .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeLessThanOrEqual(3);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('fullName');
        expect(res.body[0]).toHaveProperty('paid');
    });
});