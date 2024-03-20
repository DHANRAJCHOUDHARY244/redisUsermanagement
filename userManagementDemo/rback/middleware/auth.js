const jwt = require('jsonwebtoken')
const { key,redisUserPrefix,redisPermPrefix } = require('../config')
const redisClient = require('../utils/redis')
const {collection} =require('../utils/mongodb');
const logger = require('../utils/pino');
// generate token

function generateToken(payload) {
    return jwt.sign(payload, key, { expiresIn: '1h' });
}

// verify token

function verifyToken(token) {
    return jwt.verify(token, key);
}


function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}


function authenticateAdmin(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = verifyToken(token);
        if(decoded.role !='admin'){
            throw new Error('Unauthorized! You are not a admin user!!')
        }
        else{
            req.user = decoded;
            console.log(decoded);
            next();
        }
    } catch (error) {
        return res.status(401).json({ message: `Invalid token ${error}` });
    }
} 




const authenticateModuleRoute= (moduleName,route)=>{
    return async (req, res, next) => {
        try {
          await redisClient.hGet(`${redisUserPrefix}`, req.user.email)
          .then(async (data) => {
            let permissions = {};
            let role=JSON.parse(data).role

            await redisClient.hGetAll(`${redisPermPrefix}`).then(reply => {
              Object.entries(reply).forEach(([field, value]) => {
                permissions[field] = JSON.parse(value);
              });
            });
          let actions= role.map((item)=> (
           permissions[item].module[moduleName].action.includes(route)
          ))
         if (actions.includes(true)) {
            next()
         }else{
            throw new Error('You are not authenticated to access this route');
         }
          })
          .catch(async(err)=>{
            console.log(err);
            const user=   await collection.aggregate([
                {
                 $match: {
                   email: req.user.email
                 }
               },
               {
                $lookup: {
                  from: "roles",
                  localField: "role",
                  foreignField: "role_name",
                  as: "result"
                }
              },{
                $unwind:"$result"
              },
              {
                $unwind:"$result.modules"
              },{
                $match: {
                  "result.modules.Name":moduleName,
                  "result.modules.permissions.url":route
                }
              },
              { $count: "permissionCount" }
             ]).toArray();
             if (user.length > 0 && user[0].permissionCount > 0) {
               next(); 
             } else {
               logger.error(`not authenticated `);
               throw new Error('You are not authenticated')
             }
          })
        } catch (error) {
          console.log('====================================');
          console.log(error);
          res.json({error:`${error}`})
        }
      }
      
}

module.exports = { generateToken, verifyToken, authenticate,authenticateAdmin,authenticateModuleRoute };

