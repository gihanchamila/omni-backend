import { check, param } from "express-validator";
import Post from '../models/Post.js'

export const postIdValidator = [
    param('postId')
        .isMongoId().withMessage('Invalid post ID')
        .custom(async (value) => {
            const post = await Post.findById(value);
            if (!post) {
                return Promise.reject('Post not found');
            }
        })
];