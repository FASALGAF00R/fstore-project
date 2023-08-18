const product =require('../models/productmodel')
const user=require('../models/usermodel');
const category=require('../models/categorymodel')
const bcrypt =require('bcrypt');
const loadsignin =async(req,res)=>{
    try{
        res.render('admin/signin');
    }catch(error){
        console.log(error.message);
    }
};
const signinVerify =async(req,res)=>{
    try{
        const email =req.body.email;
        const password = req.body.password;
        console.log('hhbhbh',req.body,'env',process.env.admin,process.env.password);
        if(email == process.env.admin && password == process.env.password){
            console.log('fghjk');
            res.redirect('/admin/home')
        }else{  
            res.render('admin/signin')
        }
    }catch(error){
        console.log(error.message);
    }
}

const adminhome = async (req,res)=>{
    try {
        console.log('home');
        res.render('admin/home');
    } catch (err) {
        console.log(err.message)
    }
}

const userlist = async(req,res) =>{
    try {
        const data = await user.find({});
        res.render('admin/usermanagement',{users : data});       
    } catch (error) {
        console.log(error.message);       
    }
}

// blocking user
const unblockuser= async (req, res) => {          
    try {
        const id = req.query.id
        console.log(id);
         await user.findByIdAndUpdate({ _id: id}, { $set: { block:false } })
            res.redirect('/admin/usermanagement')
    } catch (error) {
        console.log(error);
    }
}


// unblock User
const blockuser = async (req, res) => {
    try{
        console.log('jj');
    const id = req.query.id
    console.log(id);
    await user.findByIdAndUpdate({ _id: id }, { $set: { block: true } })
        res.redirect('/admin/usermanagement')
    }catch(err){
        console.log(err);
    }
}



module.exports={
    loadsignin,
    signinVerify,
    adminhome,
    userlist,
    blockuser,
    unblockuser,
    
}

