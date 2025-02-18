import { check, validationResult } from "express-validator";
import Notification from "../models/Notification.js";
export const notificationValidator = [

    check("userId")
        .notEmpty()
        .withMessage("userId is required"),

    check("message")
        .notEmpty()
        .withMessage("Message is required")

];

export const validateNotificationId = [

    check("notificationId")
        .isMongoId()
        .notEmpty()
        .withMessage("Notification id is required")

];

export const validateNotificationCount = [

    check("userId")
        .notEmpty()
        .withMessage("userId is required")
];

export const validateNotificationQuery = [
    check('q').optional().isString().withMessage('Query must be a string'),
    check('size').optional().isInt({ min: 1 }).withMessage('Size must be a positive integer'),
    check('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('sortField').optional().isString().withMessage('Sort field must be a string'),
    check('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either "asc" or "desc"'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

