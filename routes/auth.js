import express from "express"
import { authController} from "../controllers/index.js"
import { signupValidator, signinValidator, verifyUserValidator } from "../validators/auth.js"
import { validate } from "../validators/validate.js"

const router = express.Router()

router.post("/signup", signupValidator, validate, authController.signup)
router.post("/signin", signinValidator, validate, authController.signin)
router.post("/send-verification-email", signinValidator, validate, authController.verifyCode)
router.post("/verify-user", verifyUserValidator, validate, authController.verifyUser)

export default router

