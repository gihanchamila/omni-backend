import { check, param } from "express-validator";
import mongoose from "mongoose";

export const addCategoryValidator = [
    check("title")
        .notEmpty()
        .withMessage("Title is required"),

    check("description")
        .notEmpty()
        .withMessage("Description is required")
];

export const idValidator = [
    param("id").custom( 
        async(id) => {
            if(id && !mongoose.Types.ObjectId.isValid(id)){
                throw "Invalid category id"
            }
    })
]