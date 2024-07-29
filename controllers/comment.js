import File from "../models/File.js";
import User from "../models/User.js"
import Category from "../models/Category.js"
import Post from "../models/Post.js"
import Comment from "../models/Comment.js";

const commentController = {

    addComment : async(req, res, next) => {
        try {
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
    }

}

export default commentController