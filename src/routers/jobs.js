const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')

/**
 *
 * @returns jobs unpaid (client or contractor) for active contracts
 */
router.get('/unpaid', async (req, res) => {
    const { Job, Contract } = req.app.get('models')
    const { id, type } = req.profile;
    const userColumn = {
        'client': 'ClientId',
        'contractor': 'ContractId',
    }[type];


    const jobs = await Job.findAll({
        where: { paid: null },
        include: [{
            model: Contract,
            where: {
                status: 'in_progress',
                [userColumn]: id,
            }
        }]
    });

    if (!jobs) return res.status(404).end()
    res.json(jobs)
})

module.exports = router