import express from "express"
import fileController from "../controllers/file.js"
import { isAuth } from "../middlewares/isAuth.js"
import upload from "../middlewares/upload.js"

const router = express.Router()

router.post("/upload", isAuth, upload.single("image"), fileController.uploadFile)
router.get("/signed-url", isAuth, fileController.getSignedUrl)


export default router