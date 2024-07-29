import express from "express"
import { validate } from "../validators/validate.js";
import { isAuth } from "../middlewares/isAuth.js";
import commentController from "../controllers/comment.js";
import { commentValidator, replyCommentValidate } from "../validators/comment.js";

const router = express.Router()

router.post("/:postId", isAuth, commentValidator, validate, commentController.addComment)
router.post("/:postId/reply/:commentId", isAuth, replyCommentValidate, validate, commentController.replyToComment )

export default router