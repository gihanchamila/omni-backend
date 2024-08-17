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
                postId
            });

            await comment.save();

            const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name') // Replace 'name' with other fields if needed
            .exec();

            res.status(201).json({code : 201, status : true, message: 'Comment added', data : populatedComment });
        } catch (error) {
            next(error)
        }
    },

    replyToComment: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { commentId, postId } = req.params;
    
            // Find and populate the parent comment
            const parentComment = await Comment.findById(commentId)
                .populate('author', 'name')
                .populate({
                    path: 'replies',
                    populate: { path: 'author', select: 'name' }
                });
    
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
    
            // Find the parent author
            const parentAuthor = await User.findById(parentComment.author);
    
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.name}`;
    
            // Create a new reply
            const reply = new Comment({
                content: `${mention} ${content}`,
                author: req.user._id,
                postId,
                parentComment: commentId,
                mentions: [parentAuthor._id]
            });
    
            // Save the reply and add it to the parent comment
            await reply.save();
            parentComment.replies.push(reply._id);
            await parentComment.save();
    
            // Populate author for the reply before sending it
            const populatedReply = await Comment.findById(reply._id).populate('author', 'name');
    
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Reply added',
                data: { reply: populatedReply }
            });
        } catch (error) {
            next(error);
        }
    },

    replyToReply : async (req, res, next) => {
        try {
            const { content } = req.body;
            const { postId, commentId, replyId } = req.params;
    
            // Find and populate the parent reply
            const parentReply = await Comment.findById(replyId)
                .populate('author', 'name')
                .populate('replies')
                .populate({
                    path: 'replies',
                    populate: { path: 'author', select: 'name' }
                });
    
            if (!parentReply) {
                return res.status(404).json({ message: 'Parent reply not found' });
            }
    
            // Find the parent author
            const parentAuthor = await User.findById(parentReply.author);
    
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.name}`;
    
            // Create a new reply
            const reply = new Comment({
                content: `${mention} ${content}`,
                author: req.user._id,
                postId,
                parentComment: commentId,
                replies: [replyId], // Add the ID of the reply being replied to
                mentions: [parentAuthor._id]
            });
    
            // Save the reply and add it to the parent reply
            await reply.save();
            parentReply.replies.push(reply._id);
            await parentReply.save();
    
            // Populate author for the reply before sending it
            const populatedReply = await Comment.findById(reply._id).populate('author', 'name');
    
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Reply added',
                data: { reply: populatedReply }
            });
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

                })
                .sort({ createdAt: -1 });

                
    
            res.status(200).json({code : 200, status : true, message : "Comments loaded successfully", data : comments});
        } catch (error) {
            next(error)
        }
    },

    deleteComment : async (req, res) => {
        try{

            const {commentId} = req.params;
            
            const comment = await Comment.findById(commentId)

            if(!comment){
                return res.status(404).json({code : 404, status : false, message: "Comment not found"})
            }

            if (comment.parentComment) {
                await Comment.findByIdAndUpdate(comment.parentComment, {
                    $pull: { replies: comment._id }
                });
            }

            await Comment.deleteMany({ parentComment: comment._id });
            await comment.deleteOne();
            res.status(200).json({ code: 200, status: true, message: 'Comment deleted' });
        }catch(error){
            next(error)
        }
    }
}

export default commentController