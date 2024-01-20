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
 * FIX ME!
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

module.exports = app;
