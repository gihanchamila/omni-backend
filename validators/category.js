import { check } from "express-validator";

export const addCategoryValidator = [
    check("title")
        .notEmpty()
        .withMessage("Title is required"),

    check("description")
        .notEmpty()
        .withMessage("Description is required")
];