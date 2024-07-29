import express from "express"
import { isAuth } from "../middlewares/isAuth.js"
import { addPostValidator } from "../validators/post.js"
import { validate } from "../validators/validate.js"
import postController from "../controllers/post.js"

const router = express.Router()

router.post("/", isAuth, addPostValidator, validate, postController.addPost)


export default router