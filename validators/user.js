import mongoose from "mongoose";
import { check, param } from "express-validator";

export const idValidator = [
    param("id").custom(async (id) => {
        if (id && !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid post Id");
        }
    })
];