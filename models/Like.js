import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    post : {type : mongoose.Types.ObjectId, ref : "post"},
    comment: { type: mongoose.Types.ObjectId, ref: "comment"}
})

const Like = mongoose.model("like", likeSchema)
export default Like