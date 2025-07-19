const user=require('../models/usermodel');
const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
        } else {
            return res.redirect('/login');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

const isLoginorder = async (req, res, next) => {
    try {
     
        if (!req.session.user_id) {
            return res.render('user/order',{userid:null ,message:"No user found..",name:null,isloggedin:false,data:null})
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

     if((req.url === '/home' || req.url === '/shop' || req.url === '/cart' || req.url ==='/wishlist')) {
        const userId = req.session.user_id;
        const userData = await user.findById(userId);
        if (userData && userData.block) {
            req.session.destroy();
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
    isLoginorder

}