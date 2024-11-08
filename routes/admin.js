import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { validate } from "../validators/validate.js";
import adminController from "../controllers/admin.js";

const router = express.Router()

router.get("/admin-list", isAuth, isAdmin, validate, adminController.getAdminList)

export default router