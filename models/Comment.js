import mongoose from "mongoose"

const commentSchema = mongoose.Schema({
    content: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Types.ObjectId, ref: 'Post', required: true },
    parentComment: { type: mongoose.Types.ObjectId, ref: 'Comment', default: null },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'Like' }],
    replies: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

const Comment = mongoose.model("comment", commentSchema)
export default Comment;