
const redisClient = require("../utils/redis");

const GetAllProducts = async(req,res)=>{
  return res.json('success')
}

const GetSingleProduct = async(req,res)=>{
  return res.json('success')
}
const CreateProduct = async(req,res)=>{
  return res.json('success')
}
const UpdateProduct = async(req,res)=>{
  return res.json('success')
}
const DeleteProducts = async(req,res)=>{
  return res.json('success')
}

module.exports = { GetAllProducts,GetSingleProduct,CreateProduct,UpdateProduct,DeleteProducts}