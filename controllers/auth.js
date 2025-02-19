import User from "../models/User.js"
import hashPassword from "../utils/hashPassword.js"
import geoip from "geoip-lite";
import UAParser from "ua-parser-js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js"
import File from "../models/File.js";
import Notification from "../models/Notification.js";

import { comparePassword } from "../utils/comparePassword.js";
import { generateToken } from "../utils/generateToken.js";
import { generateCode } from "../utils/generateCode.js";
import { sendMail } from "../utils/sendEmail.js";
import hashAnswer from "../utils/hashAnswer.js";
import { getIO } from "../utils/socket.js";
import formatDate from "../utils/time.js";
import mongoose from "mongoose";

const authController = {
    signup : async (req, res, next) => {
        try{
            const {firstName, lastName, email, password, role} = req.body;
            const io = getIO()
    
            const isEmailExist = await User.findOne({email})
            if(isEmailExist){
                res.code = 400;
                throw new Error("Email is already exit")
            }
    
            const hashedPassword = await hashPassword(password)
    
            const newUser = new User({
                firstName,
                lastName,
                email,
                password : hashedPassword,
                role
            })
    
            await newUser.save()
            io.emit("User-registered", { id: newUser._id });
            res.status(201).json({code : 201, status : true, message : "User registered successfully", newUser})
        }catch(error){
            next(error)
        }
    },

    signin: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email }).populate("profilePic");
            const io = getIO();
    
            if (!user) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }
    
            const match = await comparePassword(password, user.password);
            if (!match) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }
    
            const token = generateToken(user);

            const loggedInTime = new Date();
            const formattedTime = formatDate(loggedInTime);

            const loginNotification = new Notification({
                userId: user._id,
                message: `Success! You've logged in securely.`,
                isRead: false,
                loggedInAt: formattedTime
            });
    
            await loginNotification.save();
            await User.findByIdAndUpdate(user._id, 
                { $addToSet: { notifications: loginNotification._id } }, 
                { new: true }
            );            
           
            // Parse the user agent
            const userAgentString = req.headers['user-agent'];
            const parser = new UAParser(); 
            parser.setUA(userAgentString);
    
            const deviceType = parser.getDevice().type || "Laptop";
            const browser = parser.getBrowser();
            const os = parser.getOS();
    
            const browserName = browser.name || "Unknown Browser";
            const browserVersion = browser.version || "Unknown Version";
            const osName = os.name || "Unknown OS";
            const osVersion = os.version || "Unknown Version"; 

            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
            const geo = geoip.lookup(ipAddress);
            const location = geo ? `${geo.city}, ${geo.country}` : 'Unknown';
   
            user.devices = user.devices || [];
    
            const existingDevice = user.devices.find(device =>
                device.deviceType === deviceType &&
                device.browser === `${browserName} ${browserVersion}` &&
                device.os === `${osName} ${osVersion}`
            );
    
            if (existingDevice) {
              
                existingDevice.loggedInAt = new Date();
                existingDevice.ipAddress = ipAddress;
                existingDevice.location = location;
            } else {
                // If not, add it as a new device
                user.devices.push({
                    deviceType,
                    browser: `${browserName} ${browserVersion}`,
                    os: `${osName} ${osVersion}`,
                    ipAddress,
                    location,
                    loggedInAt: new Date()
                });
            }
    
            await user.save();

            io.to(user._id.toString()).emit("signin-notification", {
                userNotifications: user._id.notifications,
                notificationId: loginNotification._id,
                message : loginNotification.message
            });

            res.status(200).json({
                code: 200,
                status: true,
                message: "User signin successful",
                data: { token, user},
                notificationId : loginNotification._id
            });
    
        } catch (error) {
            next(error);
        }
    },
    
    verifyCode : async (req, res, next) => {
        try {
          const { email } = req.body;
          const user = await User.findOne({ email });
          const io = getIO();
      
          if (!user) {
            res.status(404);
            throw new Error("User not found");
          }
      
          if (user.isVerified) {
            res.status(400);
            throw new Error("User is already verified");
          }
      
          const code = generateCode(6);
          user.verificationCode = code;
          await user.save();

      
          // Send Email
          await sendMail({
            emailTo: user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            subject: "Email Verification Code",
            code,
            content : ` Verify your account `

          });

          const date = new Date();
          const formattedTime = formatDate(date);

          const userVerificationNotification = new Notification({
                userId: user._id,
                message: `Success! Please check your email for the verification code.`,
                isRead: false,
                Time: formattedTime
            })

            await User.findByIdAndUpdate(user._id, 
                { $addToSet: { notifications: userVerificationNotification._id } }, 
                { new: true }
            );

            io.to(user._id.toString()).emit("verification-code-sent", {
                userNotifications: user._id.notifications,
                notificationId: userVerificationNotification._id,
                message : userVerificationNotification.message
            });

            await userVerificationNotification.save();
        
          res.status(200).json({ code: 200, status: true, message: "User verification code sent successfully" ,notificationId : userVerificationNotification._id, message : userVerificationNotification.message});
        } catch (error) {
          next(error);
        }
    },
      
    verifyUser : async (req, res, next) => {
        try{

            const {email, code} = req.body;
            const user = await User.findOne({email})
            const io = getIO()

            if(!user){
                res.code = 404
                throw new Error("User not found")
            }

            if(user.verificationCode !== code){
                res.code = 404;
                throw new Error("invalid code")
            }

            const date = new Date();
            const formattedTime = formatDate(date);

            const userVerificationNotification = new Notification({
                userId: user._id,
                message: `Your account has been verified successfully!`,
                isRead: false,
                Time: formattedTime
            })

            await User.findByIdAndUpdate(user._id, 
                { $addToSet: { notifications: userVerificationNotification._id } }, 
                { new: true }
            );   

            user.isVerified = true;
            user.verificationCode = null;
            await user.save()
            await userVerificationNotification.save();

            res.status(200).json({code : 200, status : true, message : " User verified successfully"})

        }catch(error){
            next(error)
        }
    },

    verifyStatus : async (req, res, next) => {
        try{

            const _id = req.user;
            const user = await User.findById(_id).select("isVerified")

            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            res.status(200).json({code : 200, status : true, message : `Verification status got successfully`, isVerified: user.isVerified})

        }catch(error){
            next(error)
        }

    },

    resetVerifyStatus: async (req, res, next) => {
        try {
          const userId = req.user._id; 
      
          // First, find the user to check the current isVerified status
          const user = await User.findById(userId);
          
          // Check if the user exists and if isVerified is true
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
      
          if (!user.isVerified) {
            return res.status(200).json({ message: 'Verification status is already false. No changes made.', isVerified: user.isVerified });
          }
      
          // Proceed to update the isVerified status to false
          user.isVerified = false;
          await user.save(); // Save the updated user document
      
          res.status(200).json({ message: 'Verification status has been reset successfully.', isVerified: user.isVerified });
        } catch (error) {
          next(error); 
        }
    },
      
    forgotPasswordCode : async (req, res, next) => {
        try{
            const {email} = req.body;
            const user = await User.findOne({email})

            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            const code = generateCode(6)
            user.forgotPasswordCode = code
            await user.save()

            await sendMail({
                emailTo : user.email,
                subject : "Forgot password code",
                code,
                content : "Change your password",
                firstName : `${user.firstName}`,
                lastName : `${user.lastName}`
            });

            res.status(200).json({code : 200, status : true, message : "Forgot password sent successfully"})
        }catch(error){
            next(error)
        }
    },
    
    recoverPassword : async(req, res, next) => {
        try{
            const {email, code, password} = req.body;
            const user = await User.findOne({email})
            const io = getIO()

            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            if(user.forgotPasswordCode !== code){
                res.code = 403;
                res.status(403).json({ status: false, message: "Invalid code" });
                throw new Error("Invalid code")
            }

            const hashedPassword = await hashPassword(password)
            user.password = hashedPassword;
            user.forgotPasswordCode = null;

            const date = new Date();
            const formattedTime = formatDate(date);

            const passwordChangeNotification = new Notification({
                userId: user._id,
                message: `Password changed successfully at ${formattedTime}`,
                isRead: false,
                Time: formattedTime
            })

            await User.findByIdAndUpdate(user._id, 
                { $addToSet: { notifications: passwordChangeNotification._id } }, 
                { new: true }
            );  

            await user.save()
            await passwordChangeNotification.save()

            res.status(200).json({code : 200, status : true, message : "Password change successfull"})

        }catch(error){
            next(error)
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const _id = req.user;
            const { oldPassword, newPassword } = req.body;
            const io = getIO()
        
            const user = await User.findById(_id);
            if (!user) {
                res.status(404).json({ code: 404, status: false, message: "User not found" });
                return;
            }
        
            const match = await comparePassword(oldPassword, user.password);
            if (!match) {
                res.status(400).json({ code: 400, status: false, message: "Old password doesn't match" });
                return;
            }
        
            if (oldPassword === newPassword) {
                res.status(400).json({ code: 400, status: false, message: "New password cannot be the same as the old password" });
                return;
            }
        
            const hashedPassword = await hashPassword(newPassword);
            user.password = hashedPassword;

            const date = new Date();
            const formattedTime = formatDate(date);

            const passwordChangeNotification = new Notification({
                userId: user._id,
                message: `Success! Your password has been updated.`,
                isRead: false,
                Time: formattedTime
            })

            await User.findByIdAndUpdate(user._id, 
                { $addToSet: { notifications: passwordChangeNotification._id } }, 
                { new: true }
            );

            io.to(user._id.toString()).emit("password-changed", {
                userNotifications: user._id.notifications,
                notificationId: passwordChangeNotification._id,
                message : passwordChangeNotification.message
            });
            
            await user.save();
            await passwordChangeNotification.save();

            res.status(200).json({ code: 200, status: true, message: "Password changed successfully", notificationId : passwordChangeNotification._id, message : passwordChangeNotification.message });

        } catch (error) {
          next(error);
        }
    },
      
    currentUSer : async(req, res, next) => {
        try {
            const {_id} = req.user
            const user = await User.findById(_id).populate('profilePic')
            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            res.status(200).json({ code : 200, status : true, message : "Get current user successfully", data : {user}})
        } catch (error) {
            next(error)
        }
    },

    securityQuestion : async (req, res, next) => {
        try{

            const _id = req.user;
            const {securityQuestion, securityAnswer} = req.body;
            const io = getIO()

            if (!securityQuestion|| !securityAnswer) {
                return res.status(400).json({ code: 400, status: false, message: "Question and answer are required" });
            }

            const user = await User.findById(_id)

            if (!user) {
                res.status(404).json({ code: 404, status: false, message: "User not found" });
                return;
            }

            const hashedAnswer = await hashAnswer(securityAnswer)

            const date = new Date();
            const formattedTime = formatDate(date);

            const securityQuestionNotification = new Notification({
                userId: user._id,
                message: `Security question and answer saved successfully at ${formattedTime}`,
                isRead: false,
                Time: formattedTime
            })

            await User.findByIdAndUpdate(user._id, 
                { $addToSet: { notifications: securityQuestionNotification._id } }, 
                { new: true }
            );  

            user.securityQuestion = securityQuestion
            user.securityAnswer = hashedAnswer
            await user.save()
            await securityQuestionNotification.save()

            res.status(200).json({code : 200, status : true, message : "Saved successfully"})

        }catch(error){
            next(error)
        }
    },

    deleteUser: async (req, res, next) => {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const _id = req.user;
    
            // Find user in the database
            const user = await User.findById(_id);
            if (!user) {
                res.status(404).json({ code: 404, status: false, message: "User not found" });
                return;
            }
    
            // Delete user-related data from different collections
            await Promise.all([
                User.findByIdAndDelete(_id, { session }), // Delete the user
                Post.deleteMany({ author: _id }, { session }), // Delete posts created by the user
                Comment.deleteMany({ user: _id }, { session }), // Delete comments created by the user
                Like.deleteMany({ user: _id }, { session }), // Delete likes by the user
                File.deleteMany({createdBy : _id}, {session})
            ]);
    
            // If everything is successful, commit the transaction
            await session.commitTransaction();
            session.endSession();
    
            res.status(200).json({ code: 200, status: true, message: "User and related data deleted successfully" });
        } catch (error) {
            // Roll back the transaction in case of an error
            await session.abortTransaction();
            session.endSession();
            next(error);
        }
    },
}

export default authController



