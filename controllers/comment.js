import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { getIO } from "../utils/socket.js";
import { populate } from "dotenv";
import Notification from "../models/Notification.js";
import formatDate from "../utils/time.js";

const commentController = {

    addComment: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { postId } = req.params;
            const io = getIO();
    
            const comment = new Comment({
                content,
                author: req.user._id,
                postId
            });

            const date = new Date();
            const formattedTime = formatDate(date)

            const commentNotification = new Notification({
                userId: req.user._id,
                message: `Comment added successfully`,
                isRead: false,
                Time : formattedTime
            })
            
            await commentNotification.save();
            await comment.save();
    
            // Populating the author and their profile picture (key) in one step
            const populatedComment = await Comment.findById(comment._id)
                .populate({
                    path: 'author',
                    select: 'firstName lastName',
                    populate: {
                        path: 'profilePic',
                        select: 'key' // Ensure that the key from the file schema is included
                    }
                })
                .exec();
    
            const updatedPost = await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }, { new: true });
    
            io.emit('commentAdd', {
                postId,
                populatedComment,
                commentCount: updatedPost.commentCount,
            });
    
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Comment added',
                data: populatedComment,
            });
        } catch (error) {
            next(error);
        }
    },
    
    replyToComment: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { commentId, postId } = req.params;
            const io = getIO();
    
            const parentComment = await Comment.findById(commentId)
                .populate('author', 'firstName lastName')
                .populate({
                    path: 'replies',
                    populate: { path: 'author', select: 'firstName lastName' }
                });
    
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
    
            const parentAuthor = await User.findById(parentComment.author);
    
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.firstName} ${parentAuthor.lastName}`;
            
            const reply = new Comment({
                content: `${mention} ${content}`,
                author: req.user._id,
                postId,
                parentComment: commentId,
                mentions: [parentAuthor._id]
            });
    
            await reply.save();
            parentComment.replies.push(reply._id);
            await parentComment.save();
    
            const populatedReply = await Comment.findById(reply._id).populate('author', 'firstName lastName');
            await Post.findByIdAndUpdate(parentComment.postId, { $inc: { commentCount: 1 } });
            
            io.emit('replyAdd', {
                postId,
                reply: populatedReply
            });
    
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
    
    replyToReply: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { postId, commentId, replyId } = req.params;
            const io = getIO();
    
            const parentReply = await Comment.findById(replyId)
                .populate('author', 'firstName lastName') // Corrected field selection
                .populate({
                    path: 'replies',
                    populate: { path: 'author', select: 'firstName lastName' } // Combined fields into a single select
                });
    
            if (!parentReply) {
                return res.status(404).json({ message: 'Parent reply not found' });
            }
    
            const parentAuthor = parentReply.author;
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.firstName} ${parentAuthor.lastName}`;
    
            const reply = new Comment({
                content: `${mention} ${content}`,
                author: req.user._id,
                postId,
                parentComment: commentId, 
                parentReply: replyId, 
                mentions: [parentAuthor._id]
            });
    
            await reply.save();
            parentReply.replies.push(reply._id);
            await parentReply.save();
    
            const populatedReply = await Comment.findById(reply._id)
                .populate('author', 'firstName lastName'); // Corrected field selection
    
            await Post.findByIdAndUpdate(parentReply.postId, { $inc: { commentCount: 1 } });
            io.emit('nestedReplyAdd', {
                postId,
                reply: populatedReply
            });
    
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Reply added',
                data: {
                    reply: populatedReply,
                    parentAuthor: `${parentAuthor.firstName} ${parentAuthor.lastName}` // Added parent author name to the response
                }
            });
        } catch (error) {
            next(error);
        }
    },
    
    getComments: async (req, res, next) => {
        try {
            const { postId } = req.params;
            const io = getIO();

            const comments = await Comment.find({ postId, parentComment: null })
                .populate({
                    path: 'author',
                    select: 'firstName lastName profilePic',
                    populate: {
                        path: 'profilePic', 
                        select: 'key' 
                    }
                })
                .populate({
                    path: 'replies',
                    populate: [
                        {
                            path: 'author',
                            select: 'firstName lastName profilePic'
                        },
                        {
                            path: 'replies', 
                            populate: {
                                path: 'author',
                                select: 'firstName lastName profilePic'
                            }
                        }
                    ]
                })
                .sort({ createdAt: -1 });
    
            res.status(200).json({ code: 200, status: true, message: "Comments loaded successfully", data: comments});
        } catch (error) {
            next(error);
        }
    },

    getCommentCount : async (req, res, next) => {
        try{

            const { postId } = req.params;
            const count = await Post.findById(postId).select('commentCount')
            res.status(200).json({ code: 200, status: true, message: "Comments count loaded successfully", data: {count}});

        }catch(error){
            next(error)
        }
    },
    
    deleteComment: async (req, res, next) => {
        try {
            const { commentId } = req.params;
            const io = getIO();
    
            const comment = await Comment.findById(commentId);
    
            if (!comment) {
                return res.status(404).json({ code: 404, status: false, message: "Comment not found" });
            }
    
            if (comment.author.toString() !== req.user._id) {
                return res.status(403).json({ code: 403, status: false, message: "Forbidden: You cannot delete this comment" });
            }
    
            // Initialize totalCommentsToDelete and queue for comments to process
            let totalCommentsToDelete = 0;
            const queue = [commentId]; // Start with the comment to delete
    
            // Loop to count all nested replies
            while (queue.length > 0) {
                const currentCommentId = queue.pop(); // Get the current comment ID
    
                // Count direct replies to the current comment
                const replies = await Comment.find({ parentComment: currentCommentId });
                totalCommentsToDelete += replies.length; // Add to the total count
    
                // Add all replies to the queue to check for their replies
                for (const reply of replies) {
                    queue.push(reply._id); // Push each reply to the queue
                }
            }
    
            // Include the parent comment in the total count
            totalCommentsToDelete += 1; // +1 for the parent comment
    
            // If it's a reply, remove it from the parent comment's replies array
            if (comment.parentComment) {
                await Comment.findByIdAndUpdate(comment.parentComment, {
                    $pull: { replies: comment._id }
                });
            }
    
            // Delete all replies and the parent comment itself
            await Comment.deleteMany({ parentComment: comment._id });
            await comment.deleteOne();
    
            // Decrement the comment count by the total number of deleted comments
            await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -totalCommentsToDelete } });
    
            // Emit the total comments removed
            io.emit('commentRemove', {
                postId: comment.postId,
                count: totalCommentsToDelete // Send the count of deleted comments
            });
    
            res.status(200).json({ code: 200, status: true, message: 'Comment deleted' });
        } catch (error) {
            next(error);
        }
    }
    
    
}

export default commentController