import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import likeController from "../controllers/like.js";
import { postIdValidator } from "../validators/like.js";
import { validate } from "../validators/validate.js";

const router = express.Router()

router.post('/:postId', isAuth, postIdValidator, validate, likeController.likePost);
router.delete('/:postId', isAuth, postIdValidator, validate, likeController.unLikePost);
router.post('/:commentId', isAuth, likeController.likeComment);
router.delete('/:commentId', isAuth, likeController.unLikeComment);

export default router