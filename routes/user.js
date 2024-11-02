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
router.put('/update-profile', isAuth, idValidator, userController.updateUser)
router.post('/add-profilePic',isAuth, idValidator, validate, userController.addProfilePic)
router.delete('/remove-profilePic',isAuth, idValidator, validate, userController.removeProfilePic)
router.get('/user-profile/:id',isAuth, idValidator, validate, userController.getUser)
router.get('/all-users',isAuth, userController.getAllUsers)
router.delete('/delete-single-user/:id',isAuth, userController.deleteSingleUser)


export default router