const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const contracts = require('./routers/contracts')
const jobs = require('./routers/jobs')

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// Middlewares
// Get auth profile middleware
app.use(getProfile);

// Routers
app.use('/contracts', contracts)
app.use('/jobs', jobs)


module.exports = app;
