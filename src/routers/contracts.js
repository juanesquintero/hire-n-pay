const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')

/**
 * GET /contracts/:id
 * @returns contract by id
 */
router.get('/:id', async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id: contractId, } = req.params
    const profileId = req.profile.id;

    const contract = await Contract.findOne({
        where: {
            id: parseInt(contractId),
            [Op.or]: [{ ClientId: profileId }, { ContractorId: profileId }]
        }
    });

    if (!contract) return res.status(404).end()
    res.json(contract)
})

/**
 * GET /contracts
 * @returns non terminated contracts of user (client or contractor)
 */
router.get('/', async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id, type } = req.profile;
    const userColumn = {
        'client': 'ClientId',
        'contractor': 'ContractId',
    }[type];

    const contracts = await Contract.findAll({
        where: {
            [userColumn]: id,
            status: { [Op.ne]: 'terminated' },
        }
    });

    if (!contracts) return res.status(404).end()
    res.json(contracts)
})

module.exports = router