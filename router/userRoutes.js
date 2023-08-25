const express =require('express');
const userRoutes=express.Router();


const usercontroller =require('../controller/usercontroller');
const ordercontroller =require('../controller/ordercontroller');

const session =require('express-session')
const config=require('../config/config');


userRoutes.use(session({
secret:config.sessionSecret,
resave:false,
saveUninitialized:true
}))
const auth=require('../middleware/auth')


userRoutes.get('/',usercontroller.loadhomepage)
userRoutes.get('/signup',auth.isLogout,usercontroller.loadsignup);
userRoutes.post('/signup',usercontroller.insertuser);
userRoutes.get('/login',auth.isLogout,usercontroller.loadlogin)
userRoutes.post('/login',usercontroller.verifylogin)
userRoutes.get('/home',auth.isLogin,auth.checkblockedstatus,usercontroller.loadhomepage)
userRoutes.get('/logout',usercontroller.logout)

userRoutes.get('/otpverify',usercontroller.otpverifysignup)
userRoutes.post('/otpverify',usercontroller.otpverifysignup)

userRoutes.get('/resendOTP',usercontroller.resendOTP);
userRoutes.get('/forgotpassword',usercontroller.forgotpassword);
userRoutes.post('/forgotpassword',usercontroller.verifyforgotpassword);
userRoutes.post('/verifyforgototp',usercontroller.verifyforgototp)
userRoutes.get('/resetpassword',usercontroller.resetpassword)
userRoutes.post('/resetpassword', usercontroller.resetpassword);




userRoutes.get('/shop',auth.checkblockedstatus,usercontroller.loadshop)
userRoutes.get('/singleproduct',usercontroller.singleproduct)
userRoutes.get('/cart',auth.checkblockedstatus,usercontroller.loadcart)
userRoutes.get('/addcart',usercontroller.addingtocart)
userRoutes.post('/changeproductquantity',usercontroller.changeQuantity)
userRoutes.get('/removecart',usercontroller.removefromcart)
userRoutes.get('/wishlist',auth.checkblockedstatus,usercontroller.loadwishlist)
userRoutes.get('/addwishlist',usercontroller.addtowishlist)

userRoutes.get('/checkout',usercontroller.loadcheckout)
userRoutes.post('/addAddress', usercontroller.postAddress);
userRoutes.get('/editaddress',usercontroller.editaddress)
userRoutes.post("/posteditaddress",usercontroller.editpostaddress)
userRoutes.get("/deleteaddress", usercontroller.deleteAddress);
userRoutes.post('/applycoupan', usercontroller.applycoupan)
userRoutes.post("/placeorder", usercontroller.postplaceorder);
userRoutes.get("/orderplaced", usercontroller.confirmorder);
userRoutes.post("/verifyPayment", usercontroller.verifyPayment);

userRoutes.get("/order",auth.isLogin, usercontroller.loadorder);
userRoutes.get("/singleOrder", usercontroller.singleOrder);
userRoutes.get("/returnOrder", ordercontroller.returnOrder)
userRoutes.get('/cancelOrder', ordercontroller.cancelOrder)

userRoutes.get("/about",usercontroller.loadabout)
userRoutes.get("/contact",usercontroller.loadcontact)

module.exports= userRoutes
