import { check } from "express-validator";

export const commentValidator = [

    check("content")
        .notEmpty()
        .withMessage("Content is required")
        
];