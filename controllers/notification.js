import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../utils/socket.js";

const notificationcontroller = {

    getNotification : async(req,res,next) => {
        try{
            const  userId = req.user;

            if(!userId){
                res.status(400).json({code : 400, status : false, message : "User ID is required"})
            }

            const notifications = await Notification.find({userId}).sort({ createdAt: -1 });

            res.status(200).json({code : 200, status : true, message : "Notifications fetched successfully", data: notifications})
        } catch(error){
            next(error)
        }
    },

    createNotification : async(req, res,next) => {
        try{
            const { userId, message } = req.body;
            const io = getIO()

            const newNotification = new Notification({
                userId,  
                message,  
                isRead: false, 
            })

            const savedNotification = await newNotification.save();

            const user = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { notifications: savedNotification._id } }, 
                { new: true } 
            );
            
            io.to(userId).emit("new-notification", {
                notification: savedNotification,
                userNotifications: user.notifications, 
            });

            res.status(200).json({code : 200, status : true, message : "Notifications added successfully", 
            data: {
                notification : savedNotification, 
                userNotifications: user.notifications,
            }});

        }catch(error){
            next(error)
        }
    },

    markAsRead : async(req, res, next) => {
        try{
            const { notificationId } = req.body;
            const io = getIO()

            const notification = await Notification.findById(notificationId);
            notification.isRead = true; 
            await notification.save();

            io.to(notification.userId.toString()).emit("notification-marked-as-read", {
                notificationId: notificationId,
                isRead: notification.isRead,
            });
            res.status(200).json({code : 200, status : true, message : "Notification marked as read successfully", data: notification})
        }catch(error){
            next(error)
        }
    },

    getNotificationCounts: async (req, res, next) => {
        try {
            const userId = req.user; 
            const io = getIO()

            const readCount = await Notification.countDocuments({ userId, isRead: true });
            const unreadCount = await Notification.countDocuments({ userId, isRead: false });

            io.to(userId).emit("notification-counts-updated", { readCount, unreadCount });
    
            res.status(200).json({ code: 200, status: true, message: "Notification counts fetched successfully", data: { readCount, unreadCount },
            });
        } catch (error) {
            next(error);
        }
    },

    deleteNotification : async(req, res, next) => {
        try{

            const { notificationId } = req.body;

            const notification = await Notification.findById(notificationId)
            await Notification.findByIdAndDelete(notificationId)
            await User.findByIdAndUpdate(notification.userId, { $pull : {notifications : notificationId}})

            io.to(notification.userId.toString()).emit("notification-counts-updated", {
                readCount,
                unreadCount,
            });

            res.status(200).json({ code: 200, status: true, message: "Notification deleted successfully"});

        }catch(error){
            next(error)
        }
    }

}

export default notificationcontroller;