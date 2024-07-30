import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    comment: { type: mongoose.Types.ObjectId, ref: 'comment', required: true }
})

const Like = mongoose.model("like", likeSchema)
export default Like