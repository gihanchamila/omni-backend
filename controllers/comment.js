import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { getIO } from "../utils/socket.js";

const commentController = {

    addComment : async(req, res, next) => {
        try {
            //Request content from body and postId from params
            const { content } = req.body;
            const { postId } = req.params;
            const io = getIO();

            const comment = new Comment({
                content,
                author: req.user._id,
                postId
            });

            await comment.save();

            const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'name') 
            .exec();
            await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

            io.emit('commentAdd', {
                postId,
                populatedComment
            });
            
            res.status(201).json({code : 201, status : true, message: 'Comment added', data : populatedComment });
        } catch (error) {
            next(error)
        }
    },

    replyToComment: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { commentId, postId } = req.params;
            const io = getIO();

            const parentComment = await Comment.findById(commentId)
                .populate('author', 'name')
                .populate({
                    path: 'replies',
                    populate: { path: 'author', select: 'name' }
                });
    
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }

            const parentAuthor = await User.findById(parentComment.author);
    
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.name}`;
            
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
    
            const populatedReply = await Comment.findById(reply._id).populate('author', 'name');
            await Post.findByIdAndUpdate(parentComment.postId, { $inc: { commentCount: 1 } }); 
            io.emit('replyAdd', {
                postId,
                reply
            });   
            res.status(201).json({code: 201,status: true,message: 'Reply added',data: { reply: populatedReply }});
            }catch (error) {
            next(error);
        }
    },

    replyToReply: async (req, res, next) => {
        try {
            const { content } = req.body;
            const { postId, commentId, replyId } = req.params;
            const io = getIO();

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
    
            const parentAuthor = parentReply.author;
            if (!parentAuthor) {
                return res.status(404).json({ message: 'Parent author not found' });
            }
    
            const mention = `@${parentAuthor.name}`;

            const reply = new Comment({
                content: `${mention} ${content}`,
                author: req.user._id,
                postId,
                parentComment: commentId, // The original top-level comment
                parentReply: replyId, // The reply being replied to
                mentions: [parentAuthor._id]
            });
    
            // Save the new reply and add it to the parent reply's replies
            await reply.save();
            parentReply.replies.push(reply._id);
            await parentReply.save();
    
            // Populate the author for the reply before sending it
            const populatedReply = await Comment.findById(reply._id)
                .populate('author', 'name');
            
            await Post.findByIdAndUpdate(parentReply.postId, { $inc: { commentCount: 1 } });
            io.emit('nestedReplyAdd', {
                postId,
                reply
            });
            res.status(201).json({ code: 201, status: true, message: 'Reply added', data: { reply: populatedReply, parentAuthor: parentAuthor.name // Adding parent author name to the response
                }
            })
        } catch (error) {
            next(error)
        }
    },
    
    getComments: async (req, res, next) => {
        try {
            const { postId } = req.params;
            const io = getIO();

            const comments = await Comment.find({ postId, parentComment: null })
                .populate('author', 'name')
                .populate({
                    path: 'replies',
                    populate: [
                        {
                            path: 'author',
                            select: 'name'
                        },
                        {
                            path: 'replies', 
                            populate: {
                                path: 'author',
                                select: 'name'
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
    
    deleteComment : async (req, res, next) => {
        try{

            const {commentId} = req.params;
            const io = getIO();
            
            const comment = await Comment.findById(commentId)

            if (comment.author.toString() !== req.user._id) {
                return res.status(403).json({ code: 403, status: false, message: "Forbidden: You cannot delete this comment" });
            }

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
            await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });
            io.emit('commentRemove', {
                postId: comment.postId
            });
            res.status(200).json({ code: 200, status: true, message: 'Comment deleted' });
        }catch(error){
            next(error)
        }
    },
}

export default commentController