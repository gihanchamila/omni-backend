import express from "express"
import categoryController from "../controllers/category.js";
import { addCategoryValidator } from "../validators/category.js";
import { validate } from "../validators/validate.js";

const router = express.Router()

router.post("/", addCategoryValidator, validate, categoryController.addCategory)
  
export default router 