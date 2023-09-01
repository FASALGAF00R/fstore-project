const product =require('../models/productmodel')
const user=require('../models/usermodel');
const category=require('../models/categorymodel')
const Order = require("../models/ordermodels");
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
//home----------------------------------------------------
const adminhome = async (req, res) => {
    const orderData = await Order.find({ status: { $ne: "cancelled" } });

    let SubTotal = 0;
    orderData.forEach(function (value) {
      SubTotal = SubTotal + value.totalAmount;
    });
    const cod = await Order.find({ paymentMethod: "cod" }).count();
    const online = await Order.find({ paymentMethod: "online" }).count();
    const totalOrder = await Order.find({ status: { $ne: "cancelled" } }).count();
    const totalUser = await user.find().count();
    const totalProducts = await product.find().count();
    const date = new Date();
    const year = date.getFullYear();
    const currentYear = new Date(year, 0, 1);
    const salesByYear = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentYear },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  
    let sales = [];
    for (i = 1; i < 13; i++) {
      let result = true;
      for (j = 0; j < salesByYear.length; j++) {
        result = false;
        if (salesByYear[j]._id == i) {
          sales.push(salesByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) {
        sales.push({ _id: i, total: 0, count: 0 });
      }
    }
  
    let yearChart = [];
    for (let i = 0; i < sales.length; i++) {
      yearChart.push(sales[i].total);
    }
  
    res.render("admin/home", {
      data: orderData,
      total: SubTotal,
      cod,
      online,
      totalOrder,
      totalUser,
      totalProducts,
      yearChart,
    });
  };



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


//getSales Report
const getSalesReport = async (req, res) => {
  try {
    let start;
    let end;
    req.query.start ? (start = new Date(req.query.start)) : (start = "ALL");
    req.query.end ? (end = new Date(req.query.end)) : (end = "ALL");
    if (start != "ALL" && end != "ALL") {
      const data = await Order.aggregate([
        {
          $match: {
            $and: [
              { Date: { $gte: start } },
              { Date: { $lte: end } },
              { status: { $eq: "Delivered" } },
            ],
          },
        },
      ]);
      let SubTotal = 0;
      data.forEach(function (value) {
        SubTotal = SubTotal + value.totalAmount;
      });
      res.render("admin/salesReport", { data, total: SubTotal });
    } else {
      const orderData = await Order.find({ status: { $eq: "Delivered" } });
      let SubTotal = 0;
      orderData.forEach(function (value) {
        SubTotal = SubTotal + value.totalAmount;
      });
      res.render("admin/salesReport", { data: orderData, total: SubTotal });
    }
  } catch (error) {
    console.log(error.message);
  }
};











module.exports={
    loadsignin,
    signinVerify,
    adminhome,
    userlist,
    blockuser,
    unblockuser,
    getSalesReport
    
}

