const express = require('express')
const router = express.Router()

/**
 * GET /unpaid
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

router.post('/:job_id/pay', async (req, res, next) => {
    const { Job, Contract, Profile } = req.app.get('models')
    const sequelize = req.app.get('sequelize')
    const jobId = req.params.job_id;
    const client = req.profile;

    if (client?.type !== 'client') {
        return res.status(403).send('Forbidden');
    }

    const job = await Job.findByPk(jobId, { include: [Contract] });
    if (!job || job?.Contract?.status !== 'in_progress') {
        return res.status(404).send('Job not found or not active');
    }
    if (job?.paid) {
        return res.status(400).send('Job already paid');
    }

    const contractor = await Profile.findByPk(job?.Contract?.ContractorId);
    if (!contractor) {
        return res.status(404).send('Contrator not found');
    }

    if (client.balance < job.price) {
        return res.status(400).send('Insufficient balance');
    }

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
        client.balance -= job.price;
        contractor.balance += job.price;
        job.paid = true;
        job.paymentDate = new Date();

        await client.save({ transaction });
        await contractor.save({ transaction });
        await job.save({ transaction });

        // Commit the transaction
        await transaction.commit();
        res.send('Job has been paid successfully!');
    } catch (error) {
        // rollback the transaction if an error occurred
        await transaction.rollback();
        throw error;
    }

});

module.exports = router