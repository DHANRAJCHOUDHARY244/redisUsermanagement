const { getAllUsers, getSingleUser, changeUserRoleOrRestrict, removeUser } = require('../controllers/admin');
const { authenticateModuleRoute, authenticate } = require('../middleware/auth');

const router=require('express').Router();

//  get all user
router.get('/users',authenticate,authenticateModuleRoute('admin','/users'),getAllUsers);

// get single user
router.get('/user',authenticate,authenticateModuleRoute('admin','/user'),getSingleUser);

//change the user role or restrict it
router.put('/user-role-update',authenticate,authenticateModuleRoute('admin','/user-role-update'),changeUserRoleOrRestrict);

//  remove user 
router.delete('/del-user',authenticate,authenticateModuleRoute('admin','/users'),removeUser);

module.exports=router