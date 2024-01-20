const express = require('express')
const router = express.Router()
const { Op, fn, col } = require('sequelize')

/**
 * GET /admin/best-profession?start=<date>&end=<date>
 * @returns profession that earned the most money between 2 given dates
 */
router.get('/best-profession', async (req, res) => {
    const { Job, Contract, Profile } = req.app.get('models')
    let { start, end } = req.query;

    try {
        [start, end] = [new Date(start), new Date(end)]
    } catch (err) {
        return res.status(400).send('Missing or wrong start or end dates');
    }

    const professionRanking = await Job.findAll({
        where: {
            paid: true,
            paymentDate: {
                [Op.between]: [start, end]
            }
        },
        include: [{
            model: Contract,
            include: [{
                model: Profile,
                as: 'Contractor',
                attributes: ['profession']
            }]
        }],
        attributes: [
            [fn('sum', col('price')), 'total'],
            [col('Contract.Contractor.profession'), 'profession']
        ],
        group: ['Contract.Contractor.profession'],
        order: [[fn('sum', col('price')), 'DESC']],
        limit: 1
    });

    if (professionRanking.length === 0) {
        return res.status(404).send('No jobs found, in given date range');
    }

    const bestProfession = {
        total: professionRanking[0]?.dataValues?.total,
        profession: professionRanking[0]?.dataValues?.profession,
    }

    res.json(bestProfession);

});

/**
 * GET /admin/best-clients
 * @returns
 */
router.get('/best-clients', async (req, res) => {
    const { Job, Contract, Profile } = req.app.get('models')
    let { limit, start, end } = req.query;

    try {
        [start, end] = [new Date(start), new Date(end)]
        limit = limit ? parseInt(limit) : 2;
    } catch (err) {
        return res.status(400).send('Missing or worng dates and limit');
    }

    const clientsRanking = await Job.findAll({
        where: {
            paid: true,
            paymentDate: {
                [Op.between]: [start, end]
            }
        },
        include: [{
            model: Contract,
            attributes: [],
            include: [{
                model: Profile,
                as: 'Client',
                attributes: ['id', 'firstName', 'lastName']
            }]
        }],
        attributes: [
            [fn('sum', col('price')), 'paid'],
            [col('Contract.Client.id'), 'id'],
            [fn('concat', col('Contract.Client.firstName'), ' ', col('Contract.Client.lastName')), 'fullName']
        ],
        group: ['Contract.Client.id'],
        order: [[fn('sum', col('price')), 'DESC']],
        limit: limit
    });
    res.json(clientsRanking);
});

module.exports = router