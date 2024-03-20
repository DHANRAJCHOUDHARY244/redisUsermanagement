const { passHash, verifyPassHash } = require('../utils/bcrypt');
const logger = require('../utils/pino');
const { collection } = require('../utils/mongodb');
const { generateToken } = require('../middleware/auth');
const generateOtp = require('../utils/otpGen')
const sendEmail = require('../utils/email')
const redisClient = require('../utils/redis')
const { redisUserPrefix} = require('../config')

// ---------------- Register controller  ------------------------

const Register = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            logger.error('email and password are required');
            throw new Error('email and password are required');
        }
        const redisUserExist = await redisClient.hGet(`${redisUserPrefix}`, email);
        if (!redisUserExist) {
            const userExist = await collection.find({ email }).toArray()
            if (userExist.length) {
                throw new Error('User Already Exist');
            }
            else {
                let insertedId=''
                const HashPassword = await passHash(password);
                await collection.insertOne({ email, password: HashPassword, role: ['user'] }).then(async(data) => {
                   insertedId=data.insertedId.toString();
                    await redisClient.hSet(`${redisUserPrefix}`, email, JSON.stringify({ email: email, password: HashPassword, role: ['user'],id:insertedId })).then(data=>console.log(data))
                    .catch(err=>console.log(err))
                    console.log(data);
                }).catch(err => {
                    logger.error(err)
                    throw new Error(err)
                })
                const token = generateToken({ email, password: HashPassword,id:insertedId })
                res.status(201).json({ message: "user Registered Successfully", token })
            }
        }

    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: `email and password are required or ${error}` });
    }
}

// ---------------- login controller  ------------------------

const Login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            logger.error('email and password are required');
            throw new Error('email and password are required');
        } else {
            const redisUserExist = await redisClient.hGet(`${redisUserPrefix}`, email);
            if (!!redisUserExist) {
                const redisUser = JSON.parse(redisUserExist)
                if (await verifyPassHash(password, redisUser.password)) {
                    logger.info('user logged in successfully');
                    const token = generateToken({ email, password: redisUser.password })
                    res.status(201).json({ message: "user logged in Successfully from redis", token })
                } else {
                    throw new Error('Please Provide Correct details')
                }
            }
            else if (!redisUserExist) {
                const userExist = await collection.find({ email }).toArray();
                if (await verifyPassHash(password, userExist[0].password)) {
                    logger.info('user logged in successfully');
                    const token = generateToken({ email: userExist[0].email, password: userExist[0].password })
                    res.status(201).json({ message: "user logged in Successfully  FOM MONGODB ", token })
                } else {
                    throw new Error('Please Provide Correct details')
                }
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(404).json({ message: `user not found ${error}` });
    }
}

// ---------------- forget password controller  ------------------------

const ForgetPass = async (req, res) => {
    const email = req.body.email;
    console.log(email, ' ---------');
    try {
        const otp = generateOtp();
        const options = { email, otp };
        const emailResponse = await sendEmail(options);
        if (emailResponse.success) {
            await redisClient.setEx(email, 60, `${otp}`);
            console.log('----------------TTL VALUE:', await redisClient.ttl(email), email, 's OF ', email);
            logger.info(emailResponse.message);
            res.json({ message: emailResponse.message });
        } else {
            throw new Error(emailResponse.error)
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: `Internel Server Error ${error}` });
    }
}

// ---------------- otp-verify & password-change controller  ------------------------

const OtpVerify = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const storedOTP = await redisClient.get(email);
        if (!storedOTP) {
            throw new Error('Otp is invalid or expired');
        }
        else if (storedOTP == otp) {
            await redisClient.hGet(`${redisUserPrefix}`, email).then(async (data) => {
                const redisUser = JSON.parse(data)
                await redisClient.hSet(`${redisUserPrefix}`, email, JSON.stringify({ email: email, password: hashpass, role: redisUser.role }));
            }).catch(err => {
                console.log('redis user not exist');
            })

            await collection.findOneAndUpdate({ email }, { $set: { password: hashpass } }).then((data) => {
                logger.info('otp verified and password changed');
                res.status(201).json({ message: "otp verified and password changed" })
            })
        }
    } catch (error) {
        logger.error(error);
        res.status(400).json({ message: `Bad Request ${error}` });
    }
}


// ---------------- get all users controller  ------------------------

const getAllUsers = async (req, res) => {
    try {
        let users;
        usersRedis = await redisClient.hGetAll(redisUserPrefix);
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


module.exports = { Register, Login, ForgetPass, OtpVerify, getAllUsers }