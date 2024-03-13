const redis = require("redis");
const logger = require('./pino')
const redisClient = redis.createClient();


(async () => {
    await redisClient.connect();
})();

redisClient.on("ready", () => {
    logger.info("Redis Connected Successfully!");
});

redisClient.on("error", (err) => {
    logger.error("Error in the Redis Connection", err);
});

module.exports = redisClient
