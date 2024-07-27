import express from "express"
import categoryController from "../controllers/category.js";
import { addCategoryValidator, idValidator } from "../validators/category.js";
import { validate } from "../validators/validate.js";
import { isAuth } from "../middlewares/isAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router()

router.post("/", isAuth, isAdmin, addCategoryValidator, validate, categoryController.addCategory)
router.put("/:id", isAuth, isAdmin, idValidator, validate, categoryController.updateCategory)
router.delete("/:id", isAuth, isAdmin, idValidator, validate, categoryController.deleteCategory)
  
export default router 