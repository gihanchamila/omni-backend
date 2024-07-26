import express from "express"
import categoryController from "../controllers/category.js";
import { addCategoryValidator } from "../validators/category.js";
import { validate } from "../validators/validate.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router()

router.post("/", isAuth, isAdmin, addCategoryValidator, validate, categoryController.addCategory)
  
export default router 