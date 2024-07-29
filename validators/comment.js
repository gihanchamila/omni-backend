import { check, body, param } from "express-validator";

export const commentValidator = [

    check("content")
        .trim()
        .notEmpty()
        .withMessage("Content is required"),

    param('postId')
        .isMongoId()
        .withMessage('Invalid post ID')

];

export const replyCommentValidate = [

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required'),

    param('commentId')
        .isMongoId().withMessage('Invalid comment ID'),

    param('postId')
        .isMongoId().withMessage('Invalid post ID')
];

export const getCommentsValidate = [
    param('postId')
        .isMongoId().withMessage('Invalid post ID')
]