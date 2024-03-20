const { collection } = require("../utils/mongodb");
const logger = require("../utils/pino");
const redisClient = require("../utils/redis");
const { redisUserPrefix } = require('../config')
const getAllUsers = async (req, res) => {
    try {
        let users;
        usersRedis = await redisClient.hGetAll(`${redisUserPrefix}`);
       
        users = { ...usersRedis }
        if (!usersRedis) {
            users = await collection.find().toArray()
        }
        res.json({ Users: users })
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: `${error}` })
    }
}

const getSingleUser = async (req, res) => {
    const email = req.body.email;
    try {
        if (!email) {
            logger.error('email  are required');
            throw new Error('email  are required');
        }
        else {
            const redisUserExist = await redisClient.hGet(`${redisUserPrefix}`, email);
            if (!!redisUserExist) {
                const redisUser = JSON.parse(redisUserExist);
                res.status(201).json({ message: `details of ${email}  from redis`, redisUser })
            }
            else if (!redisUserExist) {
                const userExist = await collection.find({ email }).toArray();

                if (!userExist.length) {
                    throw new Error('User not found')
                } else {
                    res.status(201).json({ message: `details of ${email}  from redis`, redisUser })
                }
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: `${error}` })
    }
}


const changeUserRoleOrRestrict = async (req, res) => {
    const { email, role } = req.body;
    try {
        if (!email && !role.length) {
            logger.error('email and role  are required');
            throw new Error('email and role  are required');
        }
        else {
            const user = await collection.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }
            else {
                await redisClient.hGet(`${redisUserPrefix}`, email).then(async (data) => {
                    const redisUser = JSON.parse(data)
                    const newRoleArray = [...role]
                    await redisClient.hSet(`${redisUserPrefix}`, email, JSON.stringify({ email: email, password: user.password, role: newRoleArray })).then(data => {
                        console.log(data);
                    }).catch(err => console.log(err));
                })
                await collection.findOneAndUpdate({ email }, { $set: { role: role } }).then((data) => {
                    logger.info(`user ${email} role changed`);
                    res.status(201).json({ message: `user ${email} role changed` })
                })
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(400).json({ message: `Bad Request ${error}` });
    }
}

const removeUser = async (req, res) => {
    const email = req.body.email;
    try {
        if (!email) {
            throw new Error('Email field is required');
        }
        else {
            const user = await collection.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            } else {
                await redisClient.hDel(`${redisUserPrefix}`, email);
                await collection.findOneAndDelete({ email }).then((data) => {
                    logger.info(`user ${email} removed successfully`);
                    res.status(201).json({ message: `user ${email} removed successfully` })
                }).catch(err => {
                    throw new Error(err)
                })
            }
        }

    } catch (error) {
        logger.error(error);
        res.status(400).json({ message: `Bad Request ${error}` });
    }
}


module.exports = { getAllUsers, getSingleUser, changeUserRoleOrRestrict, removeUser }