const express = require('express')
const adminRoutes = express.Router();
const admincontroller =require('../controller/admincontroller')
const productcontroller = require('../controller/productcontroller')
const categorycontroller =require('../controller/categorycontroller')
const coupancontroller =require('../controller/coupancontroller')
const ordercontroller = require('../controller/ordercontroller');

const auth=require('../middleware/auth')
const upload=require("../middleware/multer")


//user
adminRoutes.get('/signin',admincontroller.loadsignin)
adminRoutes.post('/signin',admincontroller.signinVerify)
adminRoutes.get('/home',admincontroller.adminhome)
adminRoutes.get('/usermanagement',admincontroller.userlist);
adminRoutes.get('/blockuser',admincontroller.unblockuser);
adminRoutes.get('/unblockuser',admincontroller.blockuser)

//product
adminRoutes.get('/product',productcontroller.loadproducts)
adminRoutes.post('/product',productcontroller.addProduct)
adminRoutes.get('/editproduct',productcontroller.editproduct)
adminRoutes.post('/editproduct',upload.array("image",3),productcontroller.prodeditpost)

adminRoutes.get('/deleteproduct',productcontroller.deleteproduct)
adminRoutes.get('/addproduct',upload.array("image",3),productcontroller.addProduct)
adminRoutes.post('/addproduct',upload.array("image",3),productcontroller.prodectadd)
adminRoutes.get('/searchproduct',productcontroller.searchproduct)
adminRoutes.get('/showproduct',productcontroller.showproduct)
adminRoutes.post('/removeimage', productcontroller.removeimage);


//category
adminRoutes.get('/category',categorycontroller.loadcategory)
adminRoutes.post('/Category',categorycontroller.addcategory)
adminRoutes.get('/editcategory',categorycontroller.editcategory);
adminRoutes.post('/editcategory',categorycontroller.cateditPost);
adminRoutes.get('/blockcategory',categorycontroller.blockcategory)

// coupan
adminRoutes.get("/coupan", coupancontroller.loadcoupan);
adminRoutes.get("/addcoupan", coupancontroller.addcoupan);
adminRoutes.post('/addcoupan',coupancontroller.postaddcoupon)
adminRoutes.get("/deletecoupan", coupancontroller.deletecoupan);

// order 
adminRoutes.get('/order', ordercontroller.getOrder);
adminRoutes.get('/singleorder',ordercontroller.viewOrder);
adminRoutes.post("/updateStatus",ordercontroller.updatestatus)

// sales
adminRoutes.get('/sales',ordercontroller.sales)

module.exports=adminRoutes
