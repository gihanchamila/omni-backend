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
            
            // Comment 
            const comment = new Comment({
                content,
                author: req.user._id,
                postId
            });

            const date = new Date();
            const formattedTime = formatDate(date);

            // comment notification
            const commentNotification = new Notification({
                userId: req.user._id,
                message: `Commment posted successfully`,
                isRead: false,
                Time: formattedTime
            });

            // Save comment notification
            await commentNotification.save();

            // Add notification to user
            await User.findByIdAndUpdate(req.user._id, 
            { $addToSet: { notifications: commentNotification._id } },
            { new: true }
            );

            // Save comment
            await comment.save();
    
            // Populating the author and their profile picture (key) in one step
            // Populating profile key will help  to get profile picture of the author
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
            
            // Increment the comment count of the post
            const updatedPost = await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } }, { new: true });

            // Emit the comment data to all connected clients
            const emitData = {
                postId,
                comment: populatedComment,
                profilePicKey: populatedComment.author.profilePic ? populatedComment.author.profilePic.key : null,
                commentCount: updatedPost.commentCount, 
                commentId: comment._id,
                firstName,
                lastName
            };

            // Emit the comment data to all connected clients
            io.emit('commentAdd', emitData);
          
            // Emit the comment notification to the author
            io.to(req.user._id.toString()).emit("new-comment", {
                userNotifications: req.user._id.notifications,
                notificationId: commentNotification._id,
                message : commentNotification.message
            });
          
            // Send the response
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Commment posted successfully!',
                data: populatedComment,
                notificationId: commentNotification._id,
                message : commentNotification.message
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

            await User.findByIdAndUpdate(parentComment.author._id, 
                { $addToSet: { notifications: replyNotification._id } },
                { new: true }
            );

            // Handle mentions in the reply content
            /* const mentionRegex = /@(\w+)/g;
            const mentions = content.match(mentionRegex); */

            /* if (mentions) {
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

                        io.to(mentionedUser._id.toString()).emit("replyMentionedNotification", {
                            notification: mentionNotification,
                            userNotifications: mentionedUser.notifications,
                            message
                        });
                    }
                }
            }
 */
            await Post.findByIdAndUpdate(parentComment.postId, { $inc: { commentCount: 1 } });

            const emitData = {
                postId,
                comment: populatedReply,
                profilePicKey: populatedReply.author.profilePic ? populatedReply.author.profilePic.key : null,
                firstName,
                lastName

            };

            io.emit('replyAdd', emitData);
            io.to(parentAuthor._id.toString()).emit('replyMentionedNotification', {
                notification: replyNotification,
                userNotifications: parentAuthor.notifications
            });

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
    
            // Fetch user and parent reply concurrently
            const [user, parentReply] = await Promise.all([
                User.findById(userId).select('firstName lastName'),
                Comment.findById(replyId)
                    .populate('author', 'firstName lastName')
                    .populate({
                        path: 'replies',
                        populate: { path: 'author', select: 'firstName lastName' }
                    })
            ]);
    
            if (!parentReply) {
                return res.status(404).json({ message: 'Parent reply not found' });
            }
    
            const parentAuthor = parentReply.author;
            console.log(parentAuthor)
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.firstName} ${parentAuthor.lastName}`;
    
            // Create and save new reply
            const reply = await new Comment({
                content: `${mention} ${content}`,
                author: userId,
                postId,
                parentComment: commentId,
                parentReply: replyId,
                mentions: [parentAuthor._id]
            }).save();

            console.log(reply)
    
            // Update parent reply with new nested reply
            parentReply.replies.push(reply._id);
            await parentReply.save();
    
            // Format current date and time
            const formattedTime = formatDate(new Date());
    
            // Create and save notification
            const nestedReplyNotification = await new Notification({
                userId: parentAuthor._id,
                message: `${user.firstName} ${user.lastName} mentioned you in a reply`,
                isRead: false,
                Time: formattedTime
            }).save();
    
            // Populate the new reply
            const populatedReply = await Comment.findById(reply._id)
                .populate('author', 'firstName lastName');
    
            // Update post's comment count
            await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    
            // Prepare emit data
            const emitData = {
                postId,
                reply: populatedReply,
                notificationId: nestedReplyNotification._id,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicKey: user.profilePic ? user.profilePic.key : null
            };
    
            // Emit events
            io.emit('nestedReplyAdd', emitData);
            io.to(parentAuthor._id.toString()).emit('nestedMentionedNotification', {
                notification: nestedReplyNotification,
                userNotifications: parentAuthor.notifications
            });
    
            // Send response
            res.status(201).json({
                code: 201,
                status: true,
                message: 'Reply added',
                data: {
                    reply: populatedReply,
                    parentAuthor: `${parentAuthor.firstName} ${parentAuthor.lastName}`,
                    notificationId: nestedReplyNotification._id
                }
            });
        } catch (error) {
            // Enhanced error handling with a detailed log
            console.error(`Error in replyToReply: ${error.message}`, error);
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

    getCommentCount: async (req, res, next) => {
        try {
            const { postId } = req.params;
            const count = await Post.findById(postId).select('commentCount');
            res.status(200).json({ code: 200, status: true, message: "Comments count loaded successfully", data: { count } });
        } catch (error) {
            next(error);
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