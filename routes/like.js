import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import likeController from "../controllers/like.js";
import { postIdValidator } from "../validators/like.js";
import { commentValidator } from "../validators/comment.js";
import { validate } from "../validators/validate.js";
import { idValidator } from "../validators/post.js";

const router = express.Router()

// Routes for posts
router.post('/posts/:postId', isAuth, postIdValidator, validate, likeController.likePost);
router.delete('/posts/:postId', isAuth, postIdValidator, validate, likeController.unLikePost);

// Route to get all liked posts by the authenticated user
router.get('/posts/liked', isAuth, likeController.likedPost);

// Routes for comments
router.post('/comments/:commentId', isAuth, commentValidator, validate, likeController.likeComment);
router.delete('/comments/:commentId', isAuth, commentValidator, validate, likeController.unLikeComment);

export default router