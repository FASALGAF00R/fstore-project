
const Coupon = require('../models/coupanmodel')

const loadcoupan = async (req, res) => {

    try {
        const coupon = await Coupon.find();
        res.render("admin/coupan", { data: coupon });
    } catch (error) {
        console.log(error.message);
    }
}; 



const addcoupan = async (req, res) => {
    try {
        res.render("admin/addcoupan",{
            formData: {},    
        });
    } catch (error) {
        console.log(error.message);
    }
};

const postaddcoupon = async (req, res) => {
    try {
        // Validate coupon name length
        const minCouponNameLength = 5;
        if (req.body.name.length < minCouponNameLength) {
            return res.render("admin/addcoupan", {
                message: 'Coupon name minimum length needed',
                // Pass the valid input values back to the form
                formData: req.body,
            });
        }

        let coupons = Coupon({
            couponcode: req.body.name,
            couponamounttype: req.body.coupontype,
            couponamount: req.body.amount,
            mincartamount: req.body.mincart,
            maxredeemamount: req.body.maxredeem,
            expiredate: req.body.date,
            limit: req.body.limit,
        });

        console.log("coupon saved");
        await coupons.save();
        res.redirect("/admin/coupan");
    } catch (error) {
        console.log(error.message);
    }
};



const deletecoupan = async (req, res) => {
    try {
        const code = req.query.code;
        await Coupon.findOneAndDelete({ couponcode: code });
        res.redirect("/admin/coupan");
    } catch (error) {
        console.log(error.message);
    }
};



module.exports ={
    loadcoupan,
    addcoupan,
    postaddcoupon,
    deletecoupan

}