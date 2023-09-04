const category = require('../models/categorymodel');
const product = require('../models/productmodel');


const loadproducts = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; // Convert page parameter to an integer
      const perPage = 5;
      
      // Calculate total count of products
      const totalCount = await product.countDocuments({});
      
      // Calculate the total number of pages based on the desired number of products per page
      const totalPages = Math.ceil(totalCount / perPage);

      // Ensure that the total number of pages is capped at 2
      const actualTotalPages = Math.min(totalPages, 2);

      const skip = (page - 1) * perPage;

      const productData = await product.find({}).populate('category').skip(skip).limit(perPage);

      res.render('admin/product', { products: productData, currentPage: page, totalPages: actualTotalPages });
  } catch (error) {
      console.log(error.message);
      res.status(500).send('Error fetching products');
  }
}



const addProduct = async (req, res) => {
    try {    
        const categories= await category.find({is_block:false})
        res.render('admin/addproduct',{category:categories})
        console.log(categories);
        
    } catch (error) {
        console.log(error.message)
    }
}
const prodectadd = async (req, res) => {
    console.log("helloeeeee");
    try {
       const { productname, brand, price, description, quantity, category } = req.body;
  
      // Validate price and quantity
      
      const img = req.files.map((image)=> image.filename);
      const products = new product({
        productname:productname,
        brand: brand,
        price:price,
        description: description,
        quantity: quantity,
        category: category,
        image: img,
    
      });
  
      const productdata = await products.save();

      if (productdata) {
        res.redirect("/admin/product");
      }
    } catch (error) {
      console.log(error);
    }
  };

 const editproduct =async (req,res)=>{
    try {
        const id = req.query.id;
        console.log(id);
        const productData=await product.findOne({_id:id}).lean();
        const categories = await category.find({is_block:false});
        console.log(productData);
        if (productData) {
          res.render('admin/editproduct', { products:productData, category: categories });
        }else{
          res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message);
    }
 }
//  const prodeditpost = async (req, res) => {
//     try {
//       const  id = req.body.Id;
//       const { productname, brand, price, description, quantity, categoryId } = req.body;
//       let img=[];
//       console.log(req.body);
//       if (req.files && req.files.length >0) {
//         const existingProduct = await product.findById(id);
//         let images = existingProduct ?existingProduct.image :[];
//         req.files.forEach((file) => {
//           if (images.length < 5) {
//           images.push(file.filename);
//           }
//         });
//          img = images;
//       } 
//  await product.findByIdAndUpdate(
//   {_id:req.query.id},
//         {
//             productname:productname,
//             brand:brand,
//             price: price,
//             description: description,
//             quantity:quantity,
//             category:categoryId, // Use the correct field name for category ID
//             image:img
//           },
//         );
//       res.redirect("/admin/product");
//     } catch (error) {
//       console.log(error.message);
//     }
//   };

const prodeditpost = async (req, res) => {
  try {
    console.log(req.body);

    if (req.files) {
      const existingProduct = await product.findById(req.query.id);
      let images = existingProduct.image;
      req.files.forEach((file) => {
        images.push(file.filename);

      });
      var img = images;
    }

    await product.updateOne(
      { _id: req.query.id },
      {
        $set: {
          productname: req.body.productname,
          brand: req.body.brand,
          price: req.body.price,
          description: req.body.description,
          quantity: req.body.quantity,
          category: req.body.categoryId, // Use the correct field name for category ID
          image: img,
        },
      }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};



const deleteproduct =async(req,res)=>{
    const id =req.query.id
    console.log(id);
   const data =await product.deleteOne({_id:id}) 
   if(data){
    res.redirect('/admin/product')
   }else{
    console.log('error');
   }
}

const searchproduct=async(req,res)=>{
    try {
        const search =req.query.search;
        if(!search || search.trim().length ===0){
            const products = await product.find().populate('category');
            return res.render('admin/searchproduct', { products, errormessage: 'Please enter a search term.'});    
        }
        const products =await product.find({productname:{$regex:search,$options:'i'}}).populate('category');     

            res.render('admin/searchproduct',{products})
            console.log(products);

    } catch (error) {
        console.log(error.message);
    }
}
 
const showproduct = async (req,res)=>{
    const id =req.query.id;
    const productData = await product .findById({_id:id});
    if (productData.status == true){
        await product.findOneAndUpdate({_id:id},{$set:{status:false}})
    }else{
    await product.findOneAndUpdate({ _id: id },{ $set: { status: true } } );
}
res.redirect('/admin/product')
}


const removeimage = async(req, res) => {
  const {id,position}=req.body;
  try {
     const productData = await product.findById(id);
     productData.image.splice(position,1);
  await productData.save();
  res.send('image removed')
  } catch (error) {
      console.log( error.message);
  }

}




module.exports = {
    loadproducts,
    addProduct,
    prodectadd,
    editproduct,
    prodeditpost,
    deleteproduct,
    searchproduct,
    showproduct,
    removeimage
}