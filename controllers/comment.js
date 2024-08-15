import User from "../models/User.js";
import Comment from "../models/Comment.js";

const commentController = {

    addComment : async(req, res, next) => {
        try {
            //Request content from body and postId from params
            const { content } = req.body;
            const { postId } = req.params;

            const comment = new Comment({
                content,
                author: req.user._id,
                postId,
                author : req.user._id
            });

            await comment.save();

            res.status(201).json({code : 201, status : true, message: 'Comment added', data : comment });
        } catch (error) {
            next(error)
        }
    },

    replyToComment: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { commentId, postId } = req.params;
    
            const parentComment = await Comment.findById(commentId).populate({
                path: 'replies',
                populate: { path: 'author', select: 'name' }
            });
    
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
    
            const parentAuthor = await User.findById(parentComment.author);  // Fetch the author details
    
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.name}`;
    
            const reply = new Comment({
                content: `${mention} ${content}`,
                author: req.user._id,  // Use 'author' instead of 'user'
                postId,
                parentComment: commentId,
                mentions: [parentAuthor._id]
            });
    
            parentComment.replies.push(reply._id);
            await parentComment.save();
            await reply.save();
    
            res.status(201).json({ code: 201, status: true, message: 'Reply added', data: { reply } });
        } catch (error) {
            next(error);
        }
    },

    getComments : async (req, res) => {
        try {
            const { postId } = req.params;
            const comments = await Comment.find({postId, parentComment: null })
                .populate('author', 'name')
                .populate({
                    path: 'replies',
                    populate: { path: 'author', select: 'name' }
                });
    
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default commentController