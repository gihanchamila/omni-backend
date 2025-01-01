import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import notificationcontroller from "../controllers/notification.js";
import { validate } from "../validators/validate.js";
import { notificationValidator,validateNotificationCount, validateNotificationId, validateNotificationQuery } from "../validators/notification.js";

const router = express.Router()

router.get("/get-notifications", isAuth, validateNotificationQuery, validate, notificationcontroller.getNotification)
router.post("/create-notification", isAuth, notificationValidator, validate, notificationcontroller.createNotification)
router.put("/mark-as-read", isAuth, validateNotificationId, validate, notificationcontroller.markAsRead)
router.get("/get-notification-count", isAuth, validateNotificationCount, validate, notificationcontroller.getNotificationCounts)
router.delete("/delete-notification/:notificationId", isAuth, validateNotificationId, validate, notificationcontroller.deleteNotification)

export default router;