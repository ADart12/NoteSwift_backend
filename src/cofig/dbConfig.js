import mongoose from 'mongoose';


const URL = process.env.MONGO_DB;

export const connectDB = async() => {
    if(!URL){
        console.log("please Set environment varibale before continue");
    }
    try{
        await mongoose.connect(URL);
        console.log("mongoDB connected Successfully");

    }catch(error){
        console.log("MongoDB connection failed", error.message)
    }
}

