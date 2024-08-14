import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    title : {type : String, required : true, minLength : 3},
    description : {type : String},
    file : {type : mongoose.Types.ObjectId, ref : "file"},
    likesCount: { type: Number, default: 0 },
    comment : {type : mongoose.Types.ObjectId, ref : "comment"},
    category : {type : mongoose.Types.ObjectId, ref : "category", required : true},
    updatedBy : {type : mongoose.Types.ObjectId, ref : "user", required : true}
}, {timestamps : true})

const Post = mongoose.model("post", postSchema)
export default Post