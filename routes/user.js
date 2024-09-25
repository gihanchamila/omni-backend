import express from "express"
import { userController } from "../controllers/index.js"
import { idValidator } from "../validators/user.js"
import { validate } from "../validators/validate.js"
import {isAuth} from "../middlewares/isAuth.js"

const router = express.Router()

router.post("/follow/:id", isAuth, idValidator, validate, userController.followUser)
router.delete("/follow/:id", isAuth, idValidator, validate,  userController.unFollowUser)
router.get('/followers/:id', isAuth, idValidator, validate, userController.getFollowersCount)
router.get('/following/:id', isAuth, idValidator, validate, userController.getFollowingCount)
router.get('/follow-status/:id', isAuth, idValidator, validate, userController.checkFollowStatus);
router.get('/user-posts/:id', isAuth, idValidator, validate, userController.getUserPosts);
router.get('/devices', isAuth, idValidator, userController.userDevices)



export default router