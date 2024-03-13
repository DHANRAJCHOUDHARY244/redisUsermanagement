const { passHash, verifyPassHash } = require('../utils/bcrypt');
const logger = require('../utils/pino');
const { collection } = require('../utils/mongodb');
const { generateToken } = require('../middleware/auth');
const generateOtp = require('../utils/otpGen')
const sendEmail = require('../utils/email')
const redisClient = require('../utils/redis')
const Register = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            logger.error('email and password are required');
            throw new Error('email and password are required');
        }
        const userExist = await collection.find({ email }).toArray()
        if (userExist.length) {
            throw new Error('User Already Exist')
        }
        else {
            const HashPassword = await passHash(password);
            await collection.insertOne({ email, password: HashPassword }).then((data) => {
                console.log(data);
            }).catch(err => {
                logger.error(err)
                throw new Error(err)
            })
            const token = generateToken({ email, password: HashPassword })
            res.status(201).json({ message: "user Registered Successfully", token })
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: `email and password are required or ${error}` });
    }
}
const Login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            logger.error('email and password are required');
            throw new Error('email and password are required');
        } else {
            const userExist = await collection.find({ email }).toArray();
            if (await verifyPassHash(password, userExist[0].password)) {
                logger.info('user logged in successfully');
                const token = generateToken({ email, password: userExist[0].password })
                res.status(201).json({ message: "user logged in Successfully", token })
            } else {
                throw new Error('Please Provide Correct details')
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(404).json({ message: `user not found ${error}` });
    }
}
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
const OtpVerify = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const storedOTP = await redisClient.get(email);
        if (!storedOTP) {
            throw new Error('Otp is invalid or expired');
        }
        else if (storedOTP == otp) {
            const hashpass = await passHash(password)
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

const getAllUsers = async (req, res) => {
    try {
        const users = await collection.find().toArray()
        res.json({ users: users })
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: `${error}` })
    }
}

module.exports = { Register, Login, ForgetPass, OtpVerify, getAllUsers }