import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Post from "../models/Post.js";

const likeController = {

    likePost : async(req, res, next) => {
        try {
            const { postId } = req.params;

            // Check if the user already liked the post
            const existingLike = await Like.findOne({ user: req.user._id, post: postId });
            if (existingLike) {
                res.code = 400;
                throw new Error("You already liked this post")
            }

            const like = new Like({
                user: req.user._id,
                post: postId
            });

            const post = await Post.findById(postId);
            post.likes.push(like._id);
            await post.save();
            await like.save();

            res.status(201).json({ message: 'Post liked', like });
        } catch (error) {
            next(error)
        }

    },

    unLikePost : async(req, res, next) => {
        try {
            const { postId } = req.params;

            const like = await Like.findOneAndDelete({ user: req.user._id, post: postId });
            if (!like) {
                return res.status(400).json({ message: 'You have not liked this post' });
            }

            const post = await Post.findById(postId);
            post.likes.pull(like._id);
            await post.save();

            res.status(200).json({code : 200, status : true,  message: 'Post unliked' });
        } catch (error) {
            next(error)
        }

    },

    likeComment : async(req, res, next) => {
        try {
            const { commentId } = req.params;

            const like = new Like({
                user: req.user._id,
                comment: commentId
            });

            const comment = await Comment.findById(commentId);
            comment.likes.push(like._id);
            await comment.save();
            await like.save();

            res.status(201).json({code : 201, status : true, message : "Liked", data : {like}})

        } catch (error) {
            next(error)
        }
    },

    unLikeComment : async(req, res, next) => {
        try {
            const { commentId } = req.params;

            const like = await Like.findOneAndDelete({ user: req.user._id, comment: commentId });

            const comment = await Comment.findById(commentId);
            comment.likes.pull(like._id);
            await comment.save();

            res.status(200).json({code : 200, status : true, message: 'Unliked', data : {like}});
        } catch (error) {
            next(error)
        }
    }

}

export default likeController;