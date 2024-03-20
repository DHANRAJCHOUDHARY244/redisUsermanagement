const express = require('express');
const bodyParse = require('body-parser');
const app = express();
const { port } = require('./config')
const logger = require('./utils/pino');
const { connect } = require('./utils/mongodb');
const userRoutes = require('./routes/user')

app.use(bodyParse.json());
(async () => {
    await connect()
})()


app.use('/auth', userRoutes)

app.listen(port, () => {
    logger.info(`express server is running on ${port}`);
})