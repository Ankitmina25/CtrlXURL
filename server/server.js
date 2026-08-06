const dotenv= require('dotenv');
dotenv.config();
const app = require('./app');
const connectDB= require('./db/connectDB');
const port =  process.env.PORT || 5000;
connectDB();
app.listen(port,()=>{
    console.log(`Server is running on the ${port}`);
})

