// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    postId: { type: mongoose.Types.ObjectId, ref: 'post', required: true },
    parentComment: { type: mongoose.Types.ObjectId, ref: 'comment', default: null },
    parentReply: { type: mongoose.Types.ObjectId, ref: 'comment', default: null },
    replies: [{ type: mongoose.Types.ObjectId, ref: 'comment'}],
    mentions: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
},{
    timestamps : true
});

const Comment = mongoose.model('comment', commentSchema);
export default Comment 
