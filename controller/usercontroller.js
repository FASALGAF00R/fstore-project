const user = require('../models/usermodel');
const bcrypt = require('bcrypt');
const category = require('../models/categorymodel')
const product = require('../models/productmodel')
const cart = require('../models/cartmodel')
const Wishlist = require('../models/wishlistmodel')
const Coupon = require('../models/coupanmodel')
const Order = require("../models/ordermodels");
const validator = require('validator')
const passwordvalidator = require("password-validator")
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay')
const crypto = require('crypto')

const { ObjectId } = require("mongodb");
const { default: mongoose } = require('mongoose');

var instance = new Razorpay({
      key_id: 'rzp_test_zGl9okssXiNDIF',
      key_secret: 'rONi6z4Gugvm1CasMid2uhFP',
});





//password
const securepassword = async (password) => {
      try {
            const passwordwordHash = await bcrypt.hash(password, 10);
            return passwordwordHash;
      } catch (error) {
            console.log(error.message);
      }
}


//login
const loadlogin = async (req, res) => {
      try {
            res.render('user/login');
      } catch (error) {
            console.log(error.message);
      }
};

const verifylogin = async (req, res) => {
      try {
            const { email, password } = req.body;
            const userData = await user.findOne({ email: email });
            console.log(userData);
            if (userData) {
                  const passwordMatch = await bcrypt.compare(password, userData.password);
                  if (passwordMatch) {
                        if (userData.is_verified === 1) {
                              if (userData.block === false) {
                                    // Check if OTP reset process was completed
                                    req.session.user_id = userData._id
                                    if (userData.otp === undefined && userData.expiry === undefined) {
                                          res.redirect('/home');
                                    } else {
                                          res.render('user/login', { message: "Please complete the OTP reset process before logging in." });
                                    }
                              } else {
                                    res.render('user/login', { message: "You are blocked" });
                              }
                        } else {
                              res.render('user/login', { message: "Incorrect password" });
                        }
                  } else {
                        res.render('user/login', { message: "Incorrect password" });
                  }
            } else {
                  res.render('user/login', { message: "User not found" });
            }
      } catch (error) {
            console.log(error.message);
      }
};

//forgotpassword
const forgotpassword = async (req, res) => {
      try {
            res.render('user/forgotpassword', { showOTPForm: false, message: 'enter valid email' })
      } catch (error) {
            console.log(error.message);
      }
}

const verifyforgotpassword = async (req, res) => {
      try {
            const { email } = req.body;

            const userData = await user.findOne({ email: email });

            if (userData) {
                  const otp = generateOTP(); // Generate OTP
                  await sendOTPEmail(email, otp); // Send OTP email with the dynamically generated OTP

                  // Save the OTP and expiry time in the user's data
                  userData.otp = otp;
                  userData.expiry = new Date(Date.now() + 1 * 60 * 1000); // OTP will be valid for 1 minute
                  await userData.save();

                  // Define showOTPForm here and set it to true


                  res.render('user/forgotpassword', {
                        showOTPForm: true,
                        message: 'OTP sent to your email. Please enter the OTP. Only 1 minute left'
                  });
            } else {
                  console.log("tncorrect");
                  res.render('user/forgotpassword', { showOTPForm: false, message: 'Invalid email. Please enter a registered email address.' });
            }
      } catch (error) {
            console.log(error.message);
      }
};



const verifyforgototp = async (req, res) => {
      try {
            const { otp } = req.body;

            if (!otp) {
                  return res.render('user/forgotpassword', {
                        showOTPForm: false,
                        message: 'Please enter the OTP.'
                  });
            }


            const storedotp = await user.findOne({ otp: otp });

            if (storedotp) {
                  if (storedotp.expiry > Date.now()) {
                        res.render('user/resetpassword', { userId: storedotp._id }); // Pass the userId
                  } else {
                        res.render('user/forgotpassword', {
                              showOTPForm: false,
                              message: 'OTP has expired. Please request a new OTP.'
                        });
                  }
            } else {
                  res.render('user/forgotpassword', {
                        showOTPForm: false,
                        message: 'Invalid OTP. Please enter the correct OTP.'
                  });
            }
      } catch (error) {
            console.log(error.message);
      }
};


const resetpassword = async (req, res) => {
      try {
            const { userId, password, confirmPassword } = req.body;
            console.log(userId);
            // validate password
            if (!Schema.validate(confirmPassword)) {
                  return res.render('user/resetpassword', { userId: userId, message: 'Your password must be strong.' });
            }
            if (password !== confirmPassword) {
                  return res.render('user/resetpassword', {
                        userId: userId,
                        message: 'Passwords do not match. Please enter the passwords again.'
                  });
            }

            const userData = await user.findById(userId);
            console.log(userId);

            if (userData) {

                  const hashedPassword = await bcrypt.hash(password, 10);

                  // Update the user's password
                  userData.password = hashedPassword; // You should hash and salt the password before saving it

                  // Clear OTP and expiry fields
                  userData.otp = undefined;
                  userData.expiry = undefined;

                  await userData.save();

                  res.render('user/login', { message: 'Password reset successful. Please login with your new password.' });
            } else {
                  res.render('user/resetpassword', { userId: userId, message: 'User not found.' });
            }
      } catch (error) {
            console.log(error.message);
      }
};






const otpverifysignup = async (req, res) => {
      try {
            const enteredOTP = req.body.otp;
            const userId = req.session.user_id;
            let userDetial = await user.findOne({ _id: userId, otp: enteredOTP, expiry: { $gt: new Date() } })
            if (!userDetial) {
                  res.render('user/otpverify', {
                        admin: false,
                        user: false,
                        message: 'Invalid OTP',
                  });
            } else {
                  const userId = req.session.user_id;
                  await user.updateOne({ _id: userId }, { $set: { is_verified: 1 }, $unset: { otp: '', expiry: '' } });
                  res.redirect('/login');
            }
      } catch (error) {
            console.log(error.message);
      }
};


const resendOTP = async (req, res) => {
      try {
            console.log(req.session, 'entering...............');
            const userId = req.session.user_id;
            const userData = await user.findById({ _id: userId });
            console.log(userData, userId);
            if (userData) {
                  const otp = generateOTP(); // Generate a new OTP
                  const email = userData.email;
                  await sendOTPEmail(email, otp); // Send the new OTP via email
                  const exp = new Date()
                  exp.setMinutes(exp.getMinutes() + 1)
                  userData.otp = otp;
                  userData.expiry = exp;
                  await userData.save()
                  res.redirect('/otpverify')
            }
      } catch (error) {
            console.log(error.message);
      }
};


//genereate otp
const generateOTP = () => {
      const otp = Math.floor(100000 + Math.random() * 900000);
      return otp;
};


//send otp to email

const sendOTPEmail = async (email, otp) => {
      try {
            const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                        user: 'fasalgafoor2080@gmail.com',
                        pass: 'ebgj vwvw qdhc ousv',
                  },
            });
            const mailOptions = {
                  from: 'fasalgafoor2080@gmail.com',
                  to: email,
                  subject: 'OTP Verification',
                  text: `Your OTP: ${otp}`,
            };
            await transporter.sendMail(mailOptions);
            console.log('OTP email sent successfully!');
      } catch (error) {
            console.log(error.message);
      }
};


const Schema = new passwordvalidator();
Schema
      .is().min(5)
      .is().max(10)
// .has().uppercase()
// .has().lowercase()
// .has().digits()
// .has().not().spaces();

//signup
const loadsignup = async (req, res) => {
      try {
            res.render('user/signup');
      } catch (error) {
            console.log(error.message);
      }
};


//to handle user signup and send otp
const insertuser = async (req, res) => {
      try {
            const { email, password, confirmpassword, number } = req.body;

            // Validate email
            if (!validator.isEmail(email)) {
                  return res.render('user/signup', { message: 'Invalid email address.' });
            }

            // Validate password
            if (!Schema.validate(password)) {
                  return res.render('user/signup', { message: 'Your password must be strong.' });

            }

            if (password !== confirmpassword) {
                  return res.render('user/signup', { message: "Password and Confirm Password don't match." });
            }

            const spassword = await bcrypt.hash(password, 10);
            const User = new user({
                  name: req.body.name,
                  email: req.body.email,
                  password: spassword,
                  number: req.body.number,
                  is_verified: 0
            });

            const userData = await User.save();

            if (userData) {
                  const otp = generateOTP();
                  await sendOTPEmail(email, otp);
                  req.session.user_id = userData._id;  // Store the user's ID in the session
                  const expiry = new Date();
                  expiry.setSeconds(expiry.getSeconds() + 60); // Set expiry time to 60 seconds from now


                  userData.otp = otp;
                  userData.expiry = expiry;
                  await userData.save();
                  // Set timer for OTP expiration
                  setTimeout(async () => {
                        const userWithExpiredOTP = await user.updateOne({ _id: userData._id, otp: otp }, { $unset: { otp: '', expiry: '' } }, { new: true });
                        if (userWithExpiredOTP) {
                              console.log('OTP has expired for user:', userWithExpiredOTP._id);
                        }
                  }, 60000);
                  res.render('user/otpverify', { message: 'Please enter your OTP.', otp: otp });
            } else {
                  res.render('user/signup', { message: 'Your registration has failed.' });
            }
      } catch (error) {
            console.log(error.message);
            return res.render('user/signup', { message: 'already registered email' });
      }
};



//user logout
const logout = async (req, res) => {
      try {
            req.session.destroy((err) => {
                  if (err) {
                        console.log('Error destroying session:', err);
                        return res.status(500).send('Something went wrong');
                  }
            })
            res.clearCookie('connect.sid');
            res.redirect('/login')
      } catch (error) {
            console.log(error.message);
      }
}

const loadhomepage = async (req, res, next) => {
      try {
            let userid = req.session.user_id
            let name
            const finduser = await user.findById(userid)
            if (finduser) {
                  name = finduser.name
            }
            const isloggedin = req.session.user_id ? true : false;
            res.render('user/home', { isloggedin, name });
      } catch (error) {
            console.log(error.message);
            next(error)
      }
}




const loadshop = async (req, res) => {
      try {

            let userid = req.session.user_id
            let name
            const finduser = await user.findById(userid)
            if (finduser) {
                  name = finduser.name
            }

            const baseCategory = await category.find()

            let search = req.query.search || "";

            let filter2 = req.query.filter || "ALL";
            let categoryId = req.query.categoryId;

            var minPrice = req.query.minPrice || 0;
            var maxPrice = req.query.maxPrice || 100000;
            var sortValue = 1

            if (req.query.minPrice) {
                  minPrice = req.query.minPrice
            }

            if (req.query.maxPrice) {
                  maxPrice = req.query.maxPrice
            }

            var sortValue = 1;
            if (req.query.sortValue) {
                  sortValue = req.query.sortValue
            }



            if (categoryId) {
                  query.category = categoryId

            }

            let sort = req.query.sort || "0";
            const pageNO = parseInt(req.query.page) || 1;
            const perpage = 6;
            const skip = perpage * (pageNO - 1);
            const catData = await category.find({ is_block: false });
            let cat = catData.map((category) => category._id);



            let filter = filter2 === "ALL" ? [...cat] : req.query.filter.split(",");
            if (filter2 !== "ALL") {
                  filter = filter.map((filterItem) => new ObjectId(filterItem));
            }
            sort = req.query.sort == "High" ? -1 : 1;

            minPrice = Number(minPrice)
            maxPrice = Number(maxPrice)
            const data = await product.aggregate([
                  {
                        $match:
                        {
                              productname: { $regex: search, $options: "i" },
                              category: { $in: filter },
                              price: { $gte: minPrice, $lt: maxPrice },
                              status: false
                        }
                  },
                  { $sort: { price: sort } },
                  { $skip: skip },
                  { $limit: perpage },
            ]);

            const productCount = await product.find({ productname: { $regex: search, $options: "i" }, category: { $in: filter }, price: { $gte: minPrice, $lt: maxPrice } }).countDocuments();

            const totalPage = Math.ceil(productCount / perpage);

            let cartCount = 0;
            if (req.session.user) {
                  const countCart = await cart.findOne({ user: req.session.userId });
                  if (countCart && countCart.products) {
                        cartCount = countCart.products.length;
                  }
            }

            const isloggedin = req.session.user_id ? true : false;


            res.render("user/shop", {
                  user: data,
                  data2: catData,
                  total: totalPage,
                  previousPage: totalPage - 1,
                  currentPage: totalPage,
                  filter: filter,
                  sort: sort,
                  search: search,
                  cartCount: cartCount,
                  categoryId: categoryId,
                  baseCategory,
                  minPrice,
                  maxPrice,
                  sortValue,
                  isloggedin,
                  name


            });
      } catch (error) {
            console.log(error);
      }
};









const singleproduct = async (req, res) => {
      try {
            const userData = req.session.user_id;
            console.log(userData, "userdata");
            let name
            const finduser = await user.findById(userData)
            if (finduser) {
                  name = finduser.name
            }
            const userCart = await cart.findOne({ userID: req.session.user_id });
            const wishlist = await Wishlist.findOne({ userID: req.session.user_id });
            if (wishlist) {
                  const userProducts = wishlist.products;
                  var wishlistExist = userProducts.find(obj => obj.productID == req.query.id);
            }

            // Change the variable name 'singleproduct' to 'productData'
            const productData = await product.findById(req.query.id).populate('category')
            const productsData = await product.find();

            if (productData) {
                  res.render('user/singleproduct', { product: productData, productsData, userData, userCart, wishlist, wishlistExist, name });
            }
      } catch (error) {
            res.status(500).render('500')
      }
};


const loadcart = async (req, res) => {
      try {
            const userId = req.session.user_id;

            // CASE 1: User not logged in
            if (!userId) {
                  return res.render("user/cart", {
                        products: [],
                        usercart: null,
                        count: 0,
                        isloggedin: false,
                        name: null
                  });
            }

            // Find user by ID
            const findUser = await user.findById(userId);
            if (!findUser) {
                  return res.render("user/cart", {
                        products: [],
                        usercart: null,
                        count: 0,
                        isloggedin: false,
                        name: null
                  });
            }

            const name = findUser.name;
            const usercart = await cart.findOne({ userID: userId });
            let products = [];
            let count = 0;

            // CASE 2: User logged in, but cart is empty or doesn't exist
            if (!usercart || usercart.products.length === 0) {
                  return res.render("user/cart", {
                        products: [],
                        usercart: null,
                        count: 0,
                        isloggedin: true,
                        name
                  });
            }

            // CASE 3: User logged in, cart has products
            const cartProducts = usercart.products;
            const userCartProductsId = cartProducts.map(item => item.productID);

            products = await product.aggregate([
                  {
                        $match: {
                              _id: { $in: userCartProductsId }
                        }
                  },
                  {
                        $project: {
                              name: 1,
                              image: 1,
                              price: 1,
                              cartOrder: { $indexOfArray: [userCartProductsId, '$_id'] }
                        }
                  },
                  { $sort: { cartOrder: 1 } }
            ]);

            count = products.length;

            res.render("user/cart", {
                  products,
                  usercart,
                  count,
                  isloggedin: true,
                  name,
                  
            });

      } catch (error) {
            console.log("Cart loading error:", error.message);
            res.status(500).send("Internal Server Error");
      }
};



const addingtocart = async (req, res) => {
      try {
            let userid = req.session.user_id
            let name
            const finduser = await user.findById(userid)
            if (finduser) {
                  name = finduser.name
            }
            const singleproduct = await product.findOne({ _id: req.query.id });
            const usercart = await cart.findOne({ userID: req.session.user_id });

            const newproduct = {
                  productID: req.query.id,
                  name: singleproduct.name,
                  price: singleproduct.price,
                  quantity: 1,
            };

            let wishExist = await Wishlist.findOne({ userID: req.session.user_id, 'products.productID': req.query.id });

            if (wishExist) {
                  await Wishlist.findOneAndUpdate(
                        { userID: req.session.user_id },
                        {
                              $pull: { products: { productID: req.query.id } },
                        }
                  );
            }

            if (singleproduct.quantity > 0) {
                  if (usercart) {
                        let proExist = usercart.products.findIndex((product) => product.productID == req.query.id);
                        if (proExist !== -1) {
                              const checkProduct = await cart.updateOne(
                                    { userID: req.session.user_id, 'products.productID': req.query.id },
                                    {
                                          $inc: { 'products.$.quantity': 1, 'products.$.price': singleproduct.price, Total: singleproduct.price },
                                    }
                              );
                              res.redirect('/cart');
                        } else {
                              const newCart = await cart.findByIdAndUpdate(
                                    { _id: usercart._id },
                                    { $push: { products: newproduct } }
                              );
                              const total = await cart.findByIdAndUpdate(
                                    { _id: usercart._id }, {
                                    $inc:
                                          { Total: usercart.Total + singleproduct.price }
                              }
                              );

                              res.redirect('/cart');
                        }
                  } else {
                        const newCart = new cart({
                              products: newproduct,
                              userID: req.session.user_id,
                              Total: singleproduct.price,
                        });
                        const cartData = await newCart.save();
                        if (cartData) {
                              res.redirect('/cart');
                        } else {
                              res.sendStatus(404);
                        }
                  }
            } else {
                  res.redirect('/shop', name);
            }
      } catch (error) {
            console.log("add to cart", error.message);
      }
};

const changeQuantity = async (req, res) => {
      try {
            const productData = await product.findOne({ _id: req.body.product });
            const count = parseInt(req.body.count);
            const quantity = parseInt(req.body.quantity);
            let currentTotal = parseInt(req.body.currentTotal);
            let empty = false;

            if (count === -1 && quantity === 1) {
                  // Remove the product from the cart
                  await cart.updateOne({ _id: req.body.cart },
                        {
                              $pull: { products: { productID: req.body.product } }
                        });
                  empty = true;
            } else {
                  // Update product quantity
                  await cart.updateOne({ _id: req.body.cart, 'products.productID': req.body.product },
                        {
                              $inc: { 'products.$.quantity': count }
                        });

                  // Update product price
                  const priceChange = count === 1 ? productData.price : -productData.price;
                  currentTotal += priceChange;
                  await cart.updateOne({ _id: req.body.cart, 'products.productID': req.body.product },
                        {
                              $set: { 'products.$.price': currentTotal }
                        });

                  empty = false;
            }

            // Recalculate cart total
            const userCart = await cart.findOne({ _id: req.body.cart });
            const sum = userCart.products.reduce((acc, cur) => acc + cur.price, 0);

            // Update cart total price
            await cart.findByIdAndUpdate({ _id: req.body.cart },
                  {
                        $set: { Total: sum }
                  });

            res.json({ empty, currentTotal, sum });
      } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'An error occurred.' });
      }
};


const removefromcart = async (req, res) => {
      try {
            const userCart = await cart.findOne({ userID: req.session.user_id })
            const removedProduct = userCart.products.find(item => item.productID == req.query.id)
            const updateCart = await cart.findByIdAndUpdate(
                  { _id: userCart._id },
                  {
                        $pull:
                        {
                              products:
                                    { productID: req.query.id }
                        },
                        $inc: {
                              Total: -removedProduct.price,
                        }
                  })
            res.redirect('/cart')
      } catch (error) {
            console.log(error.message)
      }
}

const loadwishlist = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const User = await user.findOne({ _id: req.session.user_id });
                  console.log(User, "user");

                  const id = User._id;
                  const name = User.name
                  const wish = await Wishlist.findOne({ user: id });
                  if (wish) {
                        const wishData = await Wishlist.findOne({ user: id })
                              .populate("product.productId")
                              .lean();

                        if (wishData) {
                              // console.log(cartData);
                              let total;
                              if (wishData.product.length) {
                                    const total = await Wishlist.aggregate([
                                          {
                                                $match: { user: id },
                                          },
                                          {
                                                $unwind: "$product",
                                          },
                                          {
                                                $project: {
                                                      price: "$product.price",
                                                      quantity: "$product.quantity",
                                                      image: "$product.image",
                                                },
                                          },
                                          {
                                                $group: {
                                                      _id: null,
                                                      total: {
                                                            $sum: {
                                                                  $multiply: ["$quantity", "$price"],
                                                            },
                                                      },
                                                },
                                          },
                                    ]).exec();
                                    // console.log(total);
                                    const Total = total[0].total;
                                    wishData.product.forEach((element) => { });
                                    res.render("user/wishlist", {
                                          // user: req.session.name,
                                          name,
                                          data: wishData.product,
                                          userId: id,
                                          total: Total,

                                          // cartData: cartData,
                                    });
                              } else {
                                    res.render("user/wishlist", { name, data2: "hi" });
                              }
                        } else {
                              res.render("user/wishlist", { name, data2: "hi" });
                        }
                  } else {
                        res.render("user/wishlist", {
                              name,
                              data2: "hi",
                        });
                  }
            } else {
                  res.redirect("/login");
            }
      } catch (error) {
            console.log(error);
      }
};


// add to whish list
const addtowishlist = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const productId = req.query.id;
                  const userName = req.session.user_id;
                  const userdata = await user.findOne({ _id: userName });
                  const userId = userdata._id;

                  const productData = await product.findById(productId);

                  const userwish = await Wishlist.findOne({ user: userId });

                  if (userwish) {
                        const productExistIndex = userwish.product.findIndex(
                              (product) => product.productId == productId
                        );

                        if (productExistIndex !== -1) {
                              res.json({ status: false, message: "Product already exists in the wishlist." });
                        } else {
                              await Wishlist.findOneAndUpdate(
                                    { user: userId },
                                    {
                                          $push: {
                                                product: {
                                                      productId: productId,
                                                      price: productData.price,
                                                      productname: productData.productname,
                                                },
                                          },
                                    }
                              );
                              res.json({ status: true, message: "Product added to the wishlist." });
                        }
                  } else {
                        // Wishlist doesn't exist, create a new one and add the product
                        const data = new Wishlist({
                              user: userId,
                              product: [
                                    {
                                          productId: productId,
                                          price: productData.price,
                                          productname: productData.productname,
                                    },
                              ],
                        });
                        await data.save();
                        res.json({ status: true, message: "Product added to the wishlist." });
                  }
            } else {
                  res.json({ status: false, message: "Please log in to your account." });
            }
      } catch (error) {
            console.log(error.message);
            res.json({ status: false, error: error.message });
      }
};



const addtocart = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const productId = req.query.id;
                  const userdata = await user.findById(req.session.user_id);
                  const userId = userdata._id;
                  const productData = await product.findById(productId);
                  const userCart = await cart.findOne({ userID: userId }); // Use 'userID' as per your schema
                  console.log(userCart, "gggg");

                  if (userCart) {
                        console.log("User cart exists:", userCart);

                        const productExist = userCart.products.findIndex(
                              (product) => product.productID == productId
                        );

                        if (productExist != -1) {
                              console.log("Product exists in the cart. Updating quantity...");

                              await cart.findOneAndUpdate(
                                    { userID: userId, "products.productId": productId }, // Use 'userID' as per your schema
                                    { $inc: { "products.$.quantity": 1 } }
                              );

                              console.log("Quantity updated successfully.");
                        } else {
                              console.log("Product does not exist in the cart. Adding a new product...");

                              await cart.findOneAndUpdate(
                                    { userID: userId }, // Use 'userID' as per your schema
                                    {
                                          $push: {
                                                products: {
                                                      productID:
                                                            productId,
                                                      price: productData.price,
                                                      quantity: 1, // Initialize quantity to 1 for a new product
                                                },
                                          },
                                    }
                              );

                              console.log("New product added to the cart.");
                        }
                  } else {
                        console.log("User cart does not exist. Creating a new cart...");

                        const data = new cart({
                              userID: userId, // Use 'userID' as per your schema
                              products: [
                                    {
                                          productID:
                                                productId,
                                          price: productData.price,
                                          quantity: 1, // Initialize quantity to 1 for a new product
                                    },
                              ],
                        });

                        await data.save();

                        console.log("New cart created.");
                  }

                  res.json({ success: true, message: "Item added to cart successfully" });
            } else {
                  res.json({ success: false, message: "User not authenticated" });
            }
      } catch (error) {
            console.log("Error:", error.message);
            res.status(500).json({ success: false, message: "Internal server error" });
      }
};



const removewish = async (req, res) => {
      try {
            const id = req.body.id;
            console.log(id, "uiiioi");

            const data = await Wishlist.findOneAndUpdate(
                  { "product.productId": id },
                  { $pull: { product: { productId: id } } }
            );
            console.log(data, "data");

            if (data) {
                  res.json({ success: true });
            }
      } catch (error) {
            console.log(error.message);
      }
};



const loadcheckout = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const User = await user.findOne({ _id: req.session.user_id });
                  const id = User._id;
                  const name = User.name
                  console.log(name, "namedddddddddddddd");

                  const cartData = await cart.findOne({ userID: id }).populate(
                        "products.productID"
                  );
                  if (cartData.products != 0) {
                        let total = 0;
                        if (cartData.products.length) {
                              const Total = cartData.Total;
                              req.session.total = Total
                              //pass the data to front
                              const User = await user.findOne({
                                    _id: req.session.user_id,
                              });
                              res.render("user/checkout", {
                                    address: User.address,
                                    total: Total,
                                    wallet: User.wallet,
                                    name
                              });
                        }
                  }
            } else {
                  res.redirect("/");
            }
      } catch (error) {
            console.log(error.message);
      }
};


const postAddress = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const { name, country, town, address, postcode, phone } = req.body;
                  const id = req.session.user_id;
                  const data = await user.findOneAndUpdate(
                        { _id: id },
                        {
                              $push: {
                                    address: {
                                          name: name,
                                          country: country,
                                          town: town,
                                          address: address,
                                          postcode: postcode,
                                          phone: phone,
                                    },
                              },
                        },
                        { new: true }
                  );
                  res.redirect("/checkout");
            } else {
                  res.redirect("/");
            }
      } catch (error) {
            console.log(error.message);
      }
};

const editaddress = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const data = await user.findOne({
                        _id: req.session.user_id,
                        "address._id": req.query.id,
                  }).lean();
                  const User = await user.findOne({ _id: req.session.user_id });
                  const name = User.name
                  res.render("user/editaddress", { user: data.address ,name});
            }
      } catch (error) {
            console.log(error);
      }
};


const editpostaddress = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const addressId = req.body.id;
                  console.log("🚀 ~ file: userController.js:963 ~ editpostaddress ~ addressId:", addressId)
                  const userId = req.session.user_id;



                  await user.updateOne(
                        { _id: userId, " address._id": addressId },

                        {
                              $set: {
                                    "address.$.name": req.body.name,
                                    "address.$.town": req.body.town,
                                    "address.$.street": req.body.street,
                                    "address.$.postcode": req.body.postcode,
                                    "address.$.phone": req.body.phone,
                              },
                        },
                  );
                  res.redirect("/checkout");
            }
      } catch (error) {
            console.log(error.message);
      }
};


const deleteAddress = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const userId = req.session.user_id;
                  const addressId = req.query.id;
                  console.log(addressId);
                  await user.findByIdAndUpdate(
                        { _id: userId },
                        {
                              $pull: {
                                    address: {
                                          _id: addressId,
                                    },
                              },
                        }
                  );
                  res.redirect("/checkout");
            } else {
                  res.redirect("/");
            }
      } catch (error) {
            console.log(error.message);
      }
};


const applycoupan = async (req, res) => {
      try {
            let code = req.body.code;
            let amount = req.body.amount;
            let userData = await user.find({ name: req.session.name });
            let userexist = await Coupon.findOne({
                  couponcode: code,
                  used: { $in: [userData._id] },
            });
            if (userexist) {
                  const couponData = await Coupon.findOne({ couponcode: code });
                  if (couponData) {
                        if (couponData.expiredate >= new Date()) {
                              if (couponData.limit != 0) {
                                    if (couponData.mincartamount <= amount && amount >= couponData.couponamount) {
                                          let discountvalue1 = couponData.couponamount;
                                          let distotal = Math.round(amount - discountvalue1);
                                          let percentagevalue = (discountvalue1 / amount) * 100;
                                          const discountvalue = parseFloat(percentagevalue.toFixed(2));
                                          let couponId = couponData._id;
                                          req.session.couponId = couponId;
                                          res.json({
                                                couponokey: true,
                                                distotal,
                                                discountvalue,
                                                code,
                                          });
                                    } else {
                                          res.json({ cartamount: true });
                                    }
                              } else {
                                    res.json({ limit: true });
                              }
                        } else {
                              res.json({ expire: true });
                        }
                  } else {
                        res.json({ invalid: true });
                  }
            } else {
                  res.json({ user: true });
            }
      } catch (error) {
            console.log(error.message);
      }
};

//cash on deivery--------
const postplaceorder = async (req, res) => {
      try {
            if (req.session.user_id) {
                  const { address, payment, total, wallet } = req.body;
                  console.log(wallet);
                  const users = await user.findById(req.session.user_id);
                  if (address === null) {
                        res.json({ codFailed: true });
                  }
                  const cartData = await cart.findOne({ userID: users._id });
                  const products = cartData.products;
                  const status = payment == "cod" ? "placed" : "pending";
                  const orderNew = new Order({
                        deliveryDetails: address,
                        totalAmount: total,
                        status: status,
                        user: users._id,
                        paymentMethod: payment,
                        product: products,
                        wallet: wallet,
                        discount: 0,
                        Date: new Date(),
                        couponCode: "",
                  });
                  await orderNew.save();
                  let orderId = orderNew._id;
                  if (orderNew.status == "placed") {
                        const couponData = await Coupon.findById(req.session.couponId);
                        if (couponData) {
                              let newLimit = couponData.limit - 1;
                              await Coupon.findByIdAndUpdate(couponData._id, {
                                    limit: newLimit,
                              });
                        }

                        const result = await user.findByIdAndUpdate(users._id, { $inc: { wallet: -total } })
                        console.log(result, "result");
                        await cart.deleteOne({ user: user._id });
                        for (i = 0; i < products.length; i++) {
                              const productId = products[i].productID;
                              const quantity = Number(products[i].quantity);
                              await product.findByIdAndUpdate(productId, {
                                    $inc: { quantity: -quantity },
                              });
                        }


                        res.json({ codSuccess: true });
                  } else {
                        var options = {
                              amount: total * 100,
                              currency: "INR",
                              receipt: "" + orderId,
                        };

                        instance.orders.create(options, function (err, order) {
                              console.log(order);
                              if (err) {
                                    console.log(err);
                              }
                              res.json({ order });
                        });
                  }
            } else {
                  res.redirect("/");
            }
      } catch (error) {
            console.log("place order ", error.message);
      }
};

//confermation after checkout
const confirmorder = async (req, res) => {
      try {
            const orderData = await Order.findOne().sort({ Date: -1 }).limit(1).populate('product.productID');
            const userId = orderData.user;
            const User = await user.findOne({ _id: req.session.user_id });
            const name = User.name
            console.log(name, "name");


            res.render("user/confirmorder", { user: orderData, name });

      } catch (error) {
            console.log(error.message);
      }
};

// online payment 
const verifyPayment = async (req, res) => {
      try {
            const cartData = await cart.findOne({ user: req.session.userId });
            console.log(cartData, "cartdata");
            const products = cartData.products;
            const details = req.body;
            console.log(details);
            const hmac = crypto.createHmac("sha256", 'rONi6z4Gugvm1CasMid2uhFP');

            console.log(details);
            hmac.update(
                  details.payment.razorpay_order_id +
                  "|" +
                  details.payment.razorpay_payment_id
            );
            const hmacValue = hmac.digest("hex");

            if (hmacValue === details.payment.razorpay_signature) {
                  for (let i = 0; i < products.length; i++) {
                        const pro = products[i].productID;
                        const count = products[i].quantity;
                        await product.findByIdAndUpdate(
                              pro,
                              { $inc: { quantity: count } }
                        );
                  }
                  await Order.findByIdAndUpdate(
                        { _id: details.order.receipt },
                        { $set: { status: "placed" } }
                  );
                  await Order.findByIdAndUpdate(
                        { _id: details.order.receipt },
                        { $set: { paymentId: details.payment.razorpay_payment_id } }
                  );
                  await cart.deleteOne({ user: req.session.userId });
                  const orderid = details.order.receipt;
                  res.json({ onlineSuccess: true, orderid });
            } else {
                  await Order.findByIdAndRemove(details.order.receipt)

                  res.json({ success: false });
            }
      } catch (error) {
            console.log(error.message);
      }
};


// order

const loadorder = async (req, res) => {
      try {
            console.log("ethi");
            const User = await user.findOne({ _id: req.session.user_id });
            const name = User.name
        const isloggedin = req.session.user_id ? true : false;

            if (req.session.user_id) {
                  const userData = await user.findOne({ _id: req.session.user_id });
                  const page = parseInt(req.query.page) || 1;
                  const perPage = 5;
                  const skip = (page - 1) * perPage;

                  const totalOrders = await Order.countDocuments({ user: userData._id });
                  if (totalOrders) {
                        const orderData = await Order.find({ user: userData._id })
                              .skip(skip)
                              .limit(perPage);

                        res.render("user/order", {
                              _id: userData._id,
                              data: orderData,
                              currentPage: page,
                              totalPages: Math.ceil(totalOrders / perPage),
                              name: name,
                              isloggedin,
                               message: ""
                        });



                  } else {
                      return  res.render("user/order",{name,isloggedin,data:null,message:""});
                  }
            } else {
                  res.redirect("/login");
            }
      } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server Error");

      }
};


const singleOrder = async (req, res) => {
      try {
            let userid = req.session.user_id
            let name
            const finduser = await user.findById(userid)
            name = finduser.name
            if (req.session.user_id) {
                  const id = req.query.id;
                  const orderData = await Order.findById(id).populate(
                        "product.productID"
                  );
                  if (orderData) {
                        res.render("user/singleorder", {
                              data: orderData.product,
                              orderData,
                              name
                        });
                  }

            } else {
                  res.redirect("/login");
            }
      } catch (error) {
            console.log(error.message);
      }
};


const loadabout = async (req, res) => {
      const isloggedin = req.session.user_id ? true : false;
      let userid = req.session.user_id
      let name
      const finduser = await user.findById(userid)
      if (finduser) {
            name = finduser.name
      }
      res.render("user/about", { isloggedin, name })
}

const loadcontact = async (req, res) => {
      const isloggedin = req.session.user_id ? true : false;
      let userid = req.session.user_id
      let name
      const finduser = await user.findById(userid)
      if (finduser) {
            name = finduser.name
      }
      res.render("user/contact", { isloggedin, name })
}


//  contact message

const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
            user: "fasalgafoor2080@gmail.com",
            pass: "qtap pzez uruo dggk",
      }
});


function sendEmail(email, message) {
      const mailOptions = {
            from: email,
            to: 'fasalgafoor2080@gmail.com',
            subject: "Contact message",
            text: `message: ${message}`,

      };
      transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                  console.log("Error sending email: " + error);
            } else {
                  console.log("Email sent: " + info.response);
            }
      });
}



const contactpost = async (req, res) => {
      try {
            console.log("postttttttttt");
            const { email, message } = req.body
            console.log(email, message);
            const User = await user.findOne({ email });

            if (!User) {
                  return res.status(404).json({ error: "User not found." });
            }
            sendEmail(email, message);
            res.send("message send succesfully")
            User.messages.push({
                  senderEmail: email,
                  message: message
            })

            await User.save();
      } catch (error) {
            return res.status(500).json({ error: error.message });
      }
}


const userprofile = async (req, res) => {
      try {
            if (req.session.user_id) {
                  let userdata = await user.findOne({ _id: req.session.user_id });
                  const name = userdata.name
                  let datawallet = await user.find({ _id: req.session.user_id })
                  const [{ wallehistory }] = datawallet
                  res.render("user/userprofile", { data: userdata, wallet: wallehistory, name })
            } else {
                  res.redirect("/login")
            }
      } catch (error) {
            console.log(error.message);

      }
}


const verifyuserprofile = async (req, res) => {
      try {
            console.log("---------");
            const name = req.body.name;
            const email = req.body.email;
            const mobile = req.body.number;
            const id = req.body.id;
            const data = await user.findByIdAndUpdate(id, {
                  $set: { name: name, email: email, number: mobile },
            })

            if (data) {
                  res.redirect("/userprofile")
            }
      } catch (error) {
            console.log(error.message);
      }
}









module.exports = {
      loadlogin,
      loadsignup,
      insertuser,
      verifylogin,
      loadhomepage,
      securepassword,
      otpverifysignup,
      resendOTP,
      loadshop,
      forgotpassword,
      verifyforgotpassword,
      verifyforgototp,
      logout,
      singleproduct,
      loadcart,
      addingtocart,
      changeQuantity,
      removefromcart,
      loadwishlist,
      addtowishlist,
      removewish,
      addtocart,
      loadcheckout,
      postAddress,
      editaddress,
      editpostaddress,
      deleteAddress,
      applycoupan,
      postplaceorder,
      confirmorder,
      resetpassword,
      verifyPayment,
      loadorder,
      singleOrder,
      loadabout,
      loadcontact,
      contactpost,
      sendEmail,
      userprofile,
      verifyuserprofile,





}


