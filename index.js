const mongoose =require('mongoose');
const express =require('express');
const  session=require('express-session')
const config =require('./config/config');
const bodyParser = require('body-parser');
require('dotenv').config();
//public folder
const path=require('path')


mongoose.connect(process.env.mongodb).then(()=>{
  console.log('database connected successfully!')
}).catch((e)=>{
  console.log(e)
})

const app = express();

app.use(session({
secret:config.sessionSecret,
resave:false,
saveUninitialized:true
}));

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'/views'))


//to import and use middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));


app.use(express.static('public'))

const userRoutes=require('./router/userRoutes');
app.use('/',userRoutes)

const adminRoutes=require('./router/adminRoutes');
app.use('/admin',adminRoutes);

// app.use((req, res, next) => {
//   res.status(404).render('404');
// });

// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).render('500');
// });

app.listen(process.env.port,function(){
    console.log('server is running in 3000 port');
})

// app.use((error,req,res,next)=>{
//   // 404 page....
// })
//serverside