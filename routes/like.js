import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import likeController from "../controllers/like.js";

const router = express.Router()

router.post('/:commentId', isAuth, likeController.likeComment);
router.delete('/:commentId', isAuth, likeController.unLikeComment);

export default router