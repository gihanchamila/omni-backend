import mongoose from "mongoose";

const commentSchema = new Schema({
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

const Comment = mongoose.model("comment", commentSchema)
export default Comment;