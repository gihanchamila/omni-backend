import express from "express"
import { authController} from "../controllers/index.js"
import { signupValidator, signinValidator, verifyUserValidator, emailValidator, recoverPasswordValidator, changePasswordValidator, updateProfileValidator } from "../validators/auth.js"
import { validate } from "../validators/validate.js"
import isAuth from "../middlewares/isAuth.js"

const router = express.Router()

router.post("/signup", signupValidator, validate, authController.signup)
router.post("/signin", signinValidator, validate, authController.signin)
router.post("/send-verification-email", emailValidator, validate, authController.verifyCode)
router.post("/verify-user", verifyUserValidator, validate, authController.verifyUser)
router.post("/forgot-password-code", emailValidator, validate, authController.forgotPasswordCode)
router.post("/recover-password", recoverPasswordValidator, validate, authController.recoverPassword)
router.post("/change-password",isAuth,  changePasswordValidator, validate, authController.changePassword)
router.post("/update-profile",isAuth, updateProfileValidator, validate, authController.updateProfilePic)
router.get("/current-user", isAuth, authController.currentUSer)

export default router

