const express = require('express');
const bodyParse = require('body-parser');
const app = express();
const { port, redisPermPrefix} = require('./config')
const logger = require('./utils/pino');
const { connect } = require('./utils/mongodb');
const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')
const productRoutes = require('./routes/products');
const { permission } = require('./data/data');
const redisClient = require('./utils/redis');

app.use(bodyParse.json());
(async () => {
    await connect()
})()


// create redis permission collection
const dataInsert = async () => {
    const { user, admin, contentAdmin } = permission;
    await redisClient.hSetNX(`${redisPermPrefix}`, 'user', JSON.stringify(user), 'admin', JSON.stringify(admin), 'contentAdmin', JSON.stringify(contentAdmin)).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })
    await redisClient.hSetNX(`${redisPermPrefix}`, 'admin', JSON.stringify(admin), 'contentAdmin', JSON.stringify(contentAdmin)).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })
    await redisClient.hSetNX(`${redisPermPrefix}`, 'contentAdmin', JSON.stringify(contentAdmin)).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })
    // await redisClient.hGetAll(`${redisPermPrefix}`).then(reply=>{
    //     Object.entries(reply).forEach(([field, value]) => {
    //         console.log(`Field: ${field}, Value: ${value}`,'\n');
    //       })
    // }) 
} 

dataInsert()

//  routes
app.use('/admin', adminRoutes)
app.use('/auth', userRoutes)
app.use('/product', productRoutes)


app.listen(port, () => {
    logger.info(`express server is running on ${port}`);
})