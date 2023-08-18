const category =require('../models/categorymodel');
const product =require('../models/productmodel');

const loadcategory = async(req,res)=>{ 
    try{
        console.log('h');
        const data= await category.find();
        res.render('admin/category',{data})
        console.log(data);
    }catch(err){
        console.log(err);
    }
}

const addcategory = async(req,res)=>{
    console.log('ll');
    try {
        const name =req.body.name;
        console.log(typeof name);
        if (!name) {
            res.render('admin/category', { message: 'Category name cannot be empty.' });
            return;
          }
        if(name){
            const already = await category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });    
            if(already){
                    console.log('aaaaa');
                    const categories = await category.find();
                    res.render('admin/category',{message:'this is already taken',data:categories});
                }else{
                    console.log('bbbb');
                    const categorydata =new category({name:name})
                    const savedcategory = await categorydata.save()
                    if(savedcategory){
                        res.redirect('/admin/category')
                    }else{
                        res.render('admin/category',{message:'something went wrong'})
                    }
                }            
        }
    } catch (error) {
        console.log(error.message);
        
    }
}
//category edit
const  editcategory = async(req,res)=>{
    try {
        const id=req.query.id;
        console.log(id,"hai");
        const editdata=await category.findById({_id:id})
        res.render ('admin/editcategory',{data:editdata,}) 
        console.log(editdata);
    } catch (error) {
        console.log(error.message);
        res.status(500).send('servor error')
    }
}

const cateditPost=async(req,res)=>{
    try{
        const name = req.body.categoryName;
        const id = req.body.id;
        console.log(req.body);

        const editdata=await category.findById({_id:id})

        if (name.trim().length == 0) {
            res.redirect('/admin/editcategory')
        } else {
            const already = await category.findOne({
                name: { $regex: name, $options: "i" },
            })
            if (already) {
                res.render('admin/editcategory', { message: 'This category is already taken' , data : editdata })
            } else {
                       
        const data=await category.findOneAndUpdate({ _id : id },{$set:{name:name}})
        res.redirect('/admin/category')
            }
        }
    }catch(error){
        console.log(error.message)
    }
}

//blocking
const blockcategory = async(req,res)=>{
    try {
        const id = req.query.id
        console.log('jj');
        const catdata = await category.findById({_id:id})
        if (catdata.is_block ==false){
            await category.updateOne({_id:id},{$set:{is_block:true}})
            res.redirect('/admin/category')
        }else{
            await category.updateOne({_id:id},{$set:{is_block:false}})
            res.redirect('/admin/category')
        }

        
    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports={
    loadcategory,
    addcategory,
    editcategory,
    cateditPost,
    blockcategory
    
}
