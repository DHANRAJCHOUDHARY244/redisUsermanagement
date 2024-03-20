require('dotenv').config()
const config = {
    port: process.env.PORT,
    key: process.env.JWTSECRET,
    mongoUrl: process.env.MONGO_URI,
    dbName: process.env.DATABASE,
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL,
    redisUserPrefix: process.env.REDISUSERPREFIX,
    redisPermPrefix: process.env.REDISPERMISSIONPREFIX
}
module.exports = config 