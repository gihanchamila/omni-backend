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
                user: req.user._id,
                post: postId
            });

            await comment.save();

            res.status(201).json({code : 201, status : true, message: 'Comment added', data : comment });
        } catch (error) {
            next(error)
        }
    },

    replyToComment : async (req, res, next) => {
        try {
            const { content } = req.body;
            const { commentId, postId } = req.params;

            // Find the parent comment
            const parentComment = await Comment.findById(commentId).populate("user", "name")
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }

            // Find the author of the parent comment
            const parentAuthor = parentComment.user;
            const mention = `@${parentAuthor.name}`;

            // Create the reply
            const reply = new Comment({
                content: `${mention} ${content}`,
                user: req.user._id,
                post: postId,
                parentComment: commentId,
                mentions: [parentAuthor._id]
            });

            // Save the reply and update the parent comment
            parentComment.replies.push(reply._id);
            await parentComment.save();
            await reply.save();

            res.status(201).json({ code : 201, status : true,  message: 'Reply added', data : {reply} });
        } catch (error) {
            next(error)
        }
    },

    getComments : async (req, res) => {
        try {
            const { postId } = req.params;
            const comments = await Comment.find({ post: postId, parentComment: null })
                .populate('user', 'username')
                .populate({
                    path: 'replies',
                    populate: { path: 'user', select: 'username' }
                });
    
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default commentController