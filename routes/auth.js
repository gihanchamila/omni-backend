import express from "express"
import { authController} from "../controllers/index.js"
import { signupValidator, signinValidator, verifyUserValidator, emailValidator, recoverPasswordValidator, changePasswordValidator, updateProfileValidator, validateSecurityQuestion } from "../validators/auth.js"
import { validate } from "../validators/validate.js"
import {isAuth} from "../middlewares/isAuth.js"

const router = express.Router()

router.post("/signup", signupValidator, validate, authController.signup)
router.post("/signin", signinValidator, validate, authController.signin)
router.post("/send-verification-email", emailValidator, validate, authController.verifyCode)
router.post("/verify-user", verifyUserValidator, validate, authController.verifyUser)
router.post("/forgot-password-code", emailValidator, validate, authController.forgotPasswordCode)
router.post("/recover-password", recoverPasswordValidator, validate, authController.recoverPassword)
router.put("/change-password",isAuth,  changePasswordValidator, validate, authController.changePassword)
router.get("/current-user", isAuth, authController.currentUSer)
router.post('/security-question', isAuth, validateSecurityQuestion, validate, authController.securityQuestion)

export default router

