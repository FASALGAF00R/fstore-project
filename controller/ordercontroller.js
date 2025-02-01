const Order = require("../models/ordermodels");
const User = require("../models/usermodel");
const productModel = require("../models/productmodel");



const getOrder = async (req, res) => {
    try {
        console.log(";;;;;;;;;;;;;");
      const page = parseInt(req.query.page) || 1; // Get the page number from query parameters
      const perPage = 5; // Set the number of orders per page
  
      // Find the total number of orders
      const totalOrders = await Order.countDocuments();
  
      const skip = (page - 1) * perPage;
  
      // Find orders for the current page
      const orderData = await Order.find()
        .skip(skip)
        .limit(perPage);
  
      res.render("admin/order", {
        data: orderData,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / perPage),
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  


const viewOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const orderData = await Order.findById(orderId).populate(
            "product.productID"
        );
        console.log(orderData,"hhhhh");
        const userId = orderData.user;
        const userData = await User.findById(userId);
        res.render("admin/singleorder", { orderData, userData });
    } catch (error) {
        console.log(error.message);
    }
};

const updatestatus = async (req, res) => {
    try {
        const status = req.body.status;
        const orderId = req.body.orderId;
        await Order.findByIdAndUpdate(orderId, { status: status });
        res.redirect("/admin/order");
    } catch (error) {
        console.log(error.message);
    }
};

const returnOrder = async (req, res) => {
    try {
        if (req.session.user_id) {
<<<<<<< HEAD
            const id = req.query.id;
            const orderData = await Order.findById(id);
            const amount = await User.findOne({ _id: req.session.user_id });
=======
            console.log("returned");
            
            const id = req.query.id;
            const orderData = await Order.findById(id);
            const amount = await User.findOne({ _id: req.session.user_id });
            console.log(amount,"kkk");
            
>>>>>>> c87bf14 (changed the usersignup issue ,user editprofile issue)
            const total = amount.wallet + orderData.totalAmount;
            if (
                orderData.paymentMethod == "cod" ||
                orderData.paymentMethod == "online"
            )
            {
                // Add the order total back to the user's wallet
                await User.findOneAndUpdate(
                    { _id: req.session.user_id },
                    {
                        $set: { wallet: total },
                    }
                ).then((value) => {
                    console.log(value);
                });            
            
                // Set the order status to "returned" and reset the wallet field to 0
                const orderDataa = await Order.findByIdAndUpdate(id, {
                    status: "returned",
                    wallet:0,
                });

                if (orderDataa) {
                    res.redirect("/order");
                }
            }
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
    }
};


const cancelOrder  = async (req, res) => {
    try {
<<<<<<< HEAD
=======
        console.log("canceled");
        
>>>>>>> c87bf14 (changed the usersignup issue ,user editprofile issue)
        const orderId = req.query.id
        const order = await Order.findById(orderId)
        order.status = 'cancelled'
        order.save()
        res.redirect('/order')
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}


const sales = async (req, res) => {
    try {
        let orderData = await Order.find();
        let SubTotal = 0;

        // calculate subtotal of all orders
        orderData.forEach(function (value) {
            SubTotal = SubTotal + value.totalAmount;
        });


        const status = await Order.find({ "product.status": { $exists: true } });
        const value = req.query.value || "ALL";

        if (value == "cod") {
            const data = await Order.find({ paymentMethod: "cod" });
            res.render("admin/sales", { data, message: "COD", status, value });
        } else if (value == "online") {
            const data = await Order.find({ paymentMethod: "online" });
            res.render("admin/sales", { data, message: "Online", status, value });
        }
else {
            const data = orderData;
            res.render("admin/sales", { data, status, value, total: SubTotal });
        }
    } catch (error) {
        console.log(error.message);
    }
}
const checkWallet = async (req, res) => {
    try {

        if (req.session.user_id) {

            const userData = await User.findOne({ _id: req.session.user_id });
            const walleta = userData.wallet;
            if (walleta > 0) {
                res.json({ success: true, walleta });
            }
        } else {
            res.redirect("/login");
        }
    } catch (error) {

        console.log(error.message);
    }
};





module.exports ={
    getOrder,  
    viewOrder,
    updatestatus,
     returnOrder ,
     cancelOrder,
     sales,
     checkWallet
  

}