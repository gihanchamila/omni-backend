import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    title : {type : String, required : true, minLength : 3},
    file : {type : mongoose.Types.ObjectId, ref : "file"},
    category : {type : mongoose.Types.ObjectId, ref : "category", required : true},
    updatedBy : {type : mongoose.Types.ObjectId, ref : "user", required : true}
}, {timestamps : true})

const Post = mongoose.model("post", postSchema)
export default Post