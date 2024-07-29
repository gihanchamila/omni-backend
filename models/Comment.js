import mongoose from "mongoose"

const commentSchema = mongoose.Schema({
    content: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    post: { type: mongoose.Types.ObjectId, ref: 'post', required: true },
    parentComment: { type: mongoose.Types.ObjectId, ref: 'comment', default: null },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'like' }],
    replies: [{ type: mongoose.Types.ObjectId, ref: 'comment' }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
}, { timestamps: true });

const Comment = mongoose.model("comment", commentSchema)
export default Comment;