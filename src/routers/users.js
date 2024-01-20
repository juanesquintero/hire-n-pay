const express = require('express')
const router = express.Router()

/**
 * POST balances/deposit/:userId
 * @returns
 */
router.post('/balances/deposit/:id', async (req, res, next) => {
    const { Job, Contract } = req.app.get('models')
    const sequelize = req.app.get('sequelize')

    // Get deposit ammount from body payload and the id of user
    const [id, amount] = [req.params.id, req.body.amount];
    if (!id || !amount) {
        return res.status(400).send('Missing user id or amount to deposit');
    }

    const client = req.profile

    // Check if the user logged in is a client and owns the balance to deposit
    if (client?.id !== parseInt(id) || client?.type !== 'client') {
        return res.status(403).send('Forbidden');
    }

    // Start the transaction
    const transaction = await sequelize.transaction();

    try {
        const jobsToPay = await Job.sum('price', {
            where: { paid: null },
            include: [{
                model: Contract,
                where: { ClientId: id, status: 'in_progress' }
            }]
        });

        const limit = (jobsToPay ?? 0) * 0.25;
        if (amount > limit) {
            return res.status(403).send('Deposit is more than 25% of your total jobs to pay.');
        }

        client.balance += amount;
        await client.save({ transaction });

        // Commit transaction
        await transaction.commit();
        return res.send('Deposit has been added successfully!');
    } catch (error) {
        // Rollback transaction if an error occurred
        await transaction.rollback();
        next(error);
    }
});

module.exports = router