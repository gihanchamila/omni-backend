// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true }
},{
    timestamps : true
});

const Comment = mongoose.model('comment', commentSchema);
export default Comment 
