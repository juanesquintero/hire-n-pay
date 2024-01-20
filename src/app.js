const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const contracts = require('./routers/contracts')
const jobs = require('./routers/jobs')
const users = require('./routers/users')

const app = express();

app.use(bodyParser.json());

// App Globas
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// Middlewares
app.use(getProfile);

// Routers
app.use('/contracts', contracts)
app.use('/jobs', jobs)
app.use('/', users)


module.exports = app;
