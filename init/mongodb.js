import mongoose from "mongoose";
import { connectionUrl } from "../config/kyes.js";

// connect mongodb
const connectMongodb = async () => {
    try{
        await mongoose.connect(connectionUrl)
        console.log("Database connection successfull")
    }catch(error){
        console.log(error.message)
    }
}

export default connectMongodb