const { Register, Login, ForgetPass, OtpVerify, getAllUsers } = require('../controllers/user')
const { authenticate } = require('../middleware/auth')

const router = require('express').Router()

// register route
router.post('/reg', Register)

// login route
router.post('/login', Login)

// forget password route
router.post('/forget-pass', ForgetPass)


// otp verify and update password route
router.post('/verify-otp', OtpVerify)


// protected routes
router.post('/users', authenticate, getAllUsers)

module.exports = router