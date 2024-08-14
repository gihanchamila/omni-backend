import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    title : {type : String, required : true},
    description : {type : String, required : true},
    updatedBy : {type : mongoose.Types.ObjectId, ref : "user", required : true}
},{timestamps : true});

const Category = mongoose.model("category", categorySchema)
export default Category;