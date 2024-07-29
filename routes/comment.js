import express from "express"
import { validate } from "../validators/validate.js";
import { isAuth } from "../middlewares/isAuth.js";
import commentController from "../controllers/comment.js";
import { commentValidator } from "../validators/comment.js";

const router = express.Router()

router.post("/:postId", isAuth, commentValidator, validate, commentController.addComment)

export default router