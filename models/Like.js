import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    comment: { type: mongoose.Types.ObjectId, ref: 'Comment', required: true }
})

const Like = mongoose.model("like", likeSchema)
export default Like