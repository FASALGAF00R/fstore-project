const mongoose =require('mongoose');
const  userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    block :{
        type:Boolean,
        default:false
    },
    otp :{
        type:String,

        },
        expiry:{
            type:Date //store expiry time
        },
        messages:[
        {
            senderEmail:String,
            message:String
        },
    ],
        address:[{
            name:{
                type:String,
    
            },
            phone:{
                type:String,
            },
            conutry:{
                type:String,
            },
            town:{
                type:String,
            },
            street: {
                type: String,
            },
            district:{
                type:String,
            },
            postcode:{
                type:String,
            },
        
        }],

            date:{
                type:String
            }
        }
    )
    
//populate
module.exports = mongoose.model('user',userSchema);
