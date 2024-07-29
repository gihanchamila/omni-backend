import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import { addPostValidator, updatePostValidator } from "../validators/post.js"
import { validate } from "../validators/validate.js"
import postController from "../controllers/post.js"

const router = express.Router()

router.post("/", isAuth, addPostValidator, validate, postController.addPost)
router.put("/update-post", isAuth, updatePostValidator, validate, postController.updatePost)
router.get("/", isAuth, postController.getPosts)


export default router