import express from "express"
import { validate } from "../validators/validate.js";
import { isAuth } from "../middlewares/isAuth.js";
import commentController from "../controllers/comment.js";
import { commentValidator, getCommentsValidate, replyCommentValidate } from "../validators/comment.js";
import limiter from "../validators/rateLimit.js";
import {cacheCommentMiddleware} from "../middlewares/cacheMiddleware.js";

const router = express.Router()
router.use(limiter)

router.post("/:postId", isAuth, limiter, commentValidator, validate, commentController.addComment)
router.post("/:postId/reply/:commentId", isAuth, limiter, replyCommentValidate, validate, commentController.replyToComment )
router.get("/:postId", isAuth, getCommentsValidate, validate, cacheCommentMiddleware, commentController.getComments)

export default router