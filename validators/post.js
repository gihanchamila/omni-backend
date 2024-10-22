import mongoose from "mongoose";
import { check, param } from "express-validator";

export const addPostValidator = [

    check("title").notEmpty().withMessage("Title is required"),

    check("file").custom(async(file) => {
        if(file && !mongoose.Types.ObjectId.isValid(file)){
            throw "Invalid file id"
        }
    }),

    check("category").notEmpty().withMessage("Category is required").custom(async(category) => {
        if(category && !mongoose.Types.ObjectId.isValid(category)){
            throw "Invalid category id"
        }
    })
    
];

export const updatePostValidator = [

    param('id')
        .exists().withMessage('Post ID is required')
        .custom((id) => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Invalid Post ID');
            }
            return true;
        }),

    check("file").custom(async(file) => {
        if(file && !mongoose.Types.ObjectId.isValid(file)){
            throw "Invalid file id"
        }
    }),

    check("category").notEmpty().withMessage("Category is required").custom(async(category) => {
        if(category && !mongoose.Types.ObjectId.isValid(category)){
            throw "Invalid category id"
        }
    })
];

export const idValidator = [
    param("id").custom(async (id) => {
        if (id && !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid post Id");
        }
    })
];