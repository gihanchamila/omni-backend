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
            const userId = req.user._id;

            const user = await User.findById(userId).select('firstName lastName');
            const firstName = user.firstName;
            const lastName = user.lastName
    
            const comment = new Comment({
                content,
                author: req.user._id,
                postId
            });

            const date = new Date();
            const formattedTime = formatDate(date);

            const commentNotification = new Notification({
            userId: req.user._id,
            message: `Comment added`,
            isRead: false,
            Time: formattedTime
            });

            await commentNotification.save();

            await User.findByIdAndUpdate(req.user._id, 
            { $addToSet: { notifications: commentNotification._id } },
            { new: true }
            );

            await comment.save();
    
            // Populating the author and their profile picture (key) in one step
            const populatedComment = await Comment.findById(comment._id)
            .populate({
                path: 'author',
                select: '_id firstName lastName',
                populate: {
                    path: 'profilePic',
                    select: 'key' // Include the key from the profilePic schema
                }
            })
            .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: '_id firstName lastName',
                    populate: {
                        path: 'profilePic',
                        select: 'key'
                    }
                }
            })

            .populate({
                path: 'replies',
                populate: {
                    path: 'author',
                    select: '_id firstName lastName',
                    populate: {
                        path: 'profilePic',
                        select: 'key'
                    }
                }
            })
            .exec();
    
            const updatedPost = await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }, { new: true });
            const emitData = {
                postId,
                comment: populatedComment,
                profilePicKey: populatedComment.author.profilePic ? populatedComment.author.profilePic.key : null,
                commentCount: updatedPost.commentCount, 
                commentId: comment._id,
                firstName,
                lastName
            };

            io.emit('commentAdd', emitData);
          
            io.to(req.user._id.toString()).emit("newComment", {
                userNotifications: req.user._id.notifications,
                notificationId: commentNotification._id,
                message : commentNotification.message
            });
          
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Commment posted successfully!',
                data: populatedComment,
                notificationId: commentNotification._id
            });
        } catch (error) {
            next(error);
        }
    },
    
    replyToComment: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { postId, commentId } = req.params;
            const userId = req.user._id;
            const io = getIO();

            const user = await User.findById(userId).select('firstName lastName');
            const firstName = user.firstName;
            const lastName = user.lastName

            const parentComment = await Comment.findById(commentId).populate({ path: 'author', select: 'firstName lastName' });

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

            const populatedReply = await Comment.findById(reply._id)
                .populate({
                    path: 'author',
                    select: 'firstName lastName',
                    populate: {
                        path: 'profilePic',
                        select: 'key'
                    }
                })
                .exec();

            parentComment.replies.push(reply._id);
            await parentComment.save();
            const date = new Date();
            const formattedTime = formatDate(date);

            const replyNotification = new Notification({
                userId: parentAuthor._id,
                message: `${firstName} ${lastName} mentioned you in a reply`,
                isRead: false,
                Time: formattedTime
            });

            await replyNotification.save();

            await User.findByIdAndUpdate(parentAuthor._id, 
                { $addToSet: { notifications: replyNotification._id } },
                { new: true }
            );

            io.to(parentAuthor._id.toString()).emit("new-notification", {
                notification: replyNotification,
                userNotifications: parentAuthor.notifications,
            });

            // Handle mentions in the reply content
            const mentionRegex = /@(\w+)/g;
            const mentions = content.match(mentionRegex);

            if (mentions) {
                for (const mention of mentions) {
                    const username = mention.slice(1); // Remove the '@' character
                    const mentionedUser = await User.findOne({ username });

                    if (mentionedUser) {
                        const mentionNotification = new Notification({
                            userId: mentionedUser._id,
                            message: `${firstName} ${lastName} mentioned you in a reply`,
                            isRead: false,
                            Time: formattedTime
                        });

                        await mentionNotification.save();

                        await User.findByIdAndUpdate(mentionedUser._id, 
                            { $addToSet: { notifications: mentionNotification._id } },
                            { new: true }
                        );

                        io.to(mentionedUser._id.toString()).emit("new-notification", {
                            notification: mentionNotification,
                            userNotifications: mentionedUser.notifications,
                            message
                        });
                    }
                }
            }

            await Post.findByIdAndUpdate(parentComment.postId, { $inc: { commentCount: 1 } });

            const emitData = {
                postId,
                comment: populatedReply,
                profilePicKey: populatedReply.author.profilePic ? populatedReply.author.profilePic.key : null,
                firstName,
                lastName

            };

            io.emit('replyAdd', emitData);

            res.status(201).json({
                code: 201,
                status: true,
                message: 'Reply added',
                data: populatedReply,
                notificationId: replyNotification._id
                
            });
        } catch (error) {
            next(error);
        }
    },
    
    replyToReply: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { postId, commentId, replyId } = req.params;
            const userId = req.user._id;
            const io = getIO();

            const user = await User.findById(userId).select('firstName lastName');
            const firstName = user.firstName;
            const lastName = user.lastName
    
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

            const date = new Date();
            const formattedTime = formatDate(date);

            const nestedReplyNotification = new Notification({
                userId: parentAuthor._id,
                message: `${req.user.firstName} ${req.user.lastName} mentioned you in a reply`,
                isRead: false,
                Time: formattedTime
            });

            await nestedReplyNotification.save()

            const populatedReply = await Comment.findById(reply._id)
                .populate('author', 'firstName lastName'); // Corrected field selection
    
            await Post.findByIdAndUpdate(parentReply.postId, { $inc: { commentCount: 1 } });

            io.emit('nestedReplyAdd', {
                postId,
                reply: populatedReply
            });

            io.to(parentAuthor._id.toString()).emit("new-notification", {
                notification: nestedReplyNotification,
                userNotifications: parentAuthor.notifications,
            });

            const emitData = {
                postId,
                comment: reply,
                profilePicKey: reply.author.profilePic ? reply.author.profilePic.key : null,
                notificationId: nestedReplyNotification._id,
                firstName,
                lastName
            };

            io.emit('nestedReplyAdd', emitData);
    
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Reply added',
                data: {
                    reply: populatedReply,
                    parentAuthor: `${parentAuthor.firstName} ${parentAuthor.lastName}`, // Added parent author name to the response
                    notificationId: nestedReplyNotification._id
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
                            select: 'firstName lastName profilePic',
                            populate: {
                                path : 'profilePic',
                                select: 'key'
                            }
                        },
                        {
                            path: 'replies', 
                            populate: {
                                path: 'author',
                                select: 'firstName lastName profilePic',
                                populate: {
                                    path : 'profilePic',
                                    select: 'key'
                                }
                            }
                        }
                    ]
                })
                .sort({ createdAt: -1 });

            io.emit('commentsLoaded', { postId, comments });
    
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
    
            // Initialize tracking for IDs to delete
            let totalCommentsToDelete = 0;
            const queue = [commentId];
            const deletedCommentIds = [commentId];
    
            // Traverse nested replies
            while (queue.length > 0) {
                const currentCommentId = queue.pop();
                const replies = await Comment.find({ parentComment: currentCommentId }, '_id'); // Fetch only IDs
    
                totalCommentsToDelete += replies.length;
                for (const reply of replies) {
                    queue.push(reply._id);
                    deletedCommentIds.push(reply._id);
                }
            }
    
            totalCommentsToDelete += 1; // Include the parent comment
    
            // If the comment is a reply, update the parent comment
            if (comment.parentComment) {
                await Comment.findByIdAndUpdate(comment.parentComment, {
                    $pull: { replies: comment._id }
                });
            }
    
            // Emit event with deleted comment IDs and count
            io.emit('commentRemove', {
                postId: comment.postId,
                count: totalCommentsToDelete,
                deletedComments: deletedCommentIds
            });
    
            // Batch delete comments
            await Comment.deleteMany({ _id: { $in: deletedCommentIds } });
    
            // Update post's comment count
            await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -totalCommentsToDelete } });
    
            res.status(200).json({ code: 200, status: true, message: 'Comment deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
    
    
}

export default commentController