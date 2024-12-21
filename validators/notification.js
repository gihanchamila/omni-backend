import Notification from "../models/notification.js";
import { check } from "express-validator";

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
]

