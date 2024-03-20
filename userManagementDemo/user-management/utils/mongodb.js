const { MongoClient } = require('mongodb');
const { mongoUrl, dbName } = require('../config');
const logger = require('./pino');

// ----------- constants 
const collectionName = 'user';
const indexField = 'email';


const client = new MongoClient(mongoUrl);

const connect = async () => {
    await client.connect();
    logger.info('Mongo Db Connected successfully to server');
}

const db = client.db(dbName);

(async () => {
    if (!(await db.listCollections({ name: collectionName }).hasNext())) {
        logger.info(`Collection '${collectionName}' does not exist. Creating it...`);
        await db.createCollection(collectionName);
    } else {
        if (!await db.collection(collectionName).indexExists(indexField)) {
            logger.warn(`Creating index on '${indexField}'...`);
            await db.collection(collectionName).createIndex({ [indexField]: 1 }, { unique: true });
        }
    }
})()

const collection = db.collection(collectionName);


module.exports = { collection, connect }

