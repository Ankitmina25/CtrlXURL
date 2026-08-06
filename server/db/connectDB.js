const mongoose= require('mongoose');
const connectDB = async function(req,res){
         await mongoose.connect(process.env.MONGO_URI);
         console.log("Mongo-DB is connected successfully....");
} 

module.exports=connectDB;