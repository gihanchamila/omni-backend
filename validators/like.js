import { check, param } from "express-validator";

export const postIdValidator = [
    param('postId')
        .isMongoId().withMessage('Invalid post ID')
];