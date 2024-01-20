const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { Op } = require('sequelize')
const { getProfile } = require('./middleware/getProfile')

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)


app.use(getProfile);

/**
 *
 * @returns contract by id
 */
app.get('/contracts/:id', async (req, res) => {
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
 *
 * @returns non terminated contracts of user (client or contractor)
 */
app.get('/contracts', async (req, res) => {
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

/**
 *
 * @returns jobs unpaid (client or contractor) for active contracts
 */
app.get('/jobs/unpaid', async (req, res) => {
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

module.exports = app;
