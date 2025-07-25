const user=require('../models/usermodel');

// middlwares to protect routes

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
        } else {
            return res.render('user/login',{ message: 'Pls login' });
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};


const isLoginorder = async (req, res, next) => {
    try {
     
        if (!req.session.user_id) {
            return res.render('user/order',{userid:null ,message:"Please login and start purchasing",name:null,isloggedin:false,data:null})
        }
        if(req.session.user_id){
        } else {
            return res.redirect('/login');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};


const islogincart=async (req,res,next)=>{
    try {
        if(req.session.user_id){
        }else{
            console.log("else");
          return res.render('user/cart',{message:"please login..!",name:'',isloggedin:'',count:''})
        }
     next()   
    } catch (error) {
           console.log(error.message);

    }

}





const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

/////////

const checkblockedstatus = async (req,res,next)=>{
    try {
console.log("blocked");

     if((req.url === '/home' || req.url === '/shop' || req.url === '/cart' || req.url ==='/wishlist'|| req.url == "/checkout" ||req.url == "/editaddress" || req.url =="/orderplaced"
        || req.url == "/about" || req.url == "/contact" || req.url == "/userprofile" || req.url == "/order"
     )) {
        const userId = req.session.user_id;
        const userData = await user.findById(userId);
        if (userData && userData.block) {
          req.session.destroy((err) => {
                  if (err) {
                        console.log('Error destroying session:', err);
                        return res.status(500).send('Something went wrong');
                  }
            })
            res.clearCookie('connect.sid');
              return res.render('user/login', { message: 'You are blocked' });
        }
    }
    next();   
    } catch (error) {
        console.log(error.message);      
    }
}



module.exports = {
    isLogin,
    isLogout,
    checkblockedstatus,
    isLoginorder,
    islogincart

}