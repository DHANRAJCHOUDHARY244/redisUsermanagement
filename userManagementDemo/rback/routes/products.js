const { test, DeleteProducts, UpdateProduct, CreateProduct, GetSingleProduct, GetAllProducts } = require('../controllers/products');
const {  authenticateModuleRoute, authenticate } = require('../middleware/auth');

const router=require('express').Router();

//  get all products
router.get('/products',authenticate,authenticateModuleRoute('products','/products'),GetAllProducts);

// get single product
router.get('/product/:id',authenticate,authenticateModuleRoute('products','/product:id'),GetSingleProduct);


// create product
router.post('/create',authenticate,authenticateModuleRoute('products','/create'),CreateProduct);

 
// update product
router.put('/update/:id',authenticate,authenticateModuleRoute('products','/update:id'),UpdateProduct);

//  remove product
router.delete('/del/:id',authenticate,authenticateModuleRoute('products','/del:id'),DeleteProducts);


module.exports=router 