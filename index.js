require('dotenv').config();
const mongoose =require('mongoose');
const express =require('express');
const  session=require('express-session')
const config =require('./config/config');
const bodyParser = require('body-parser');
//public folder
const path=require('path')

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Database connected successfully!');
})
.catch((e) => {
  console.error('MongoDB connection error:', e);
});


// mongoose.connect('mongodb://localhost:27017/ecommerce', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
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

app.use((req, res, next) => {
  res.status(500).render('500');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500');
});

app.listen(process.env.PORT,function(){
    console.log('server is running in 3000 port');
})


//serverside