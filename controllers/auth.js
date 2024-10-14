import User from "../models/User.js"
import hashPassword from "../utils/hashPassword.js"
import geoip from "geoip-lite";
import UAParser from "ua-parser-js";
import { comparePassword } from "../utils/comparePassword.js";
import { generateToken } from "../utils/generateToken.js";
import { generateCode } from "../utils/generateCode.js";
import { sendMail } from "../utils/sendEmail.js";
import hashAnswer from "../utils/hashAnswer.js";



const authController = {
    signup : async (req, res, next) => {
        try{
            const {firstName, lastName, email, password, role} = req.body;
    
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
            res.status(201).json({code : 201, status : true, message : "User registered successfully"})
        }catch(error){
            next(error)
        }
    },

    signin: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email }).populate("profilePic");
    
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
    
            res.status(200).json({
                code: 200,
                status: true,
                message: "User signin successful",
                data: { token, user}
            });
    
        } catch (error) {
            next(error);
        }
    },
    
    verifyCode : async (req, res, next) => {
        try {
          const { email } = req.body;
          const user = await User.findOne({ email });
      
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
          console.log(`Verification code generated: ${code}`);

      
          // Send Email
          await sendMail({
            emailTo: user.email,
            firstName : user.firstName,
            lastName : user.lastName,
            subject: "Email Verification Code",
            code,
            content : ` Verify your account `

          });
      
          res.status(200).json({ code: 200, status: true, message: "User verification code sent successfully" });
        } catch (error) {
          next(error);
        }
    },
      
    verifyUser : async (req, res, next) => {
        try{

            const {email, code} = req.body;
            const user = await User.findOne({email})

            if(!user){
                res.code = 404
                throw new Error("User not found")
            }

            if(user.verificationCode !== code){
                res.code = 404;
                throw new Error("invalid code")
            }

            user.isVerified = true;
            user.verificationCode = null;
            await user.save()

            res.status(200).json({code : 200, status : true, message : " User verified successfully"})

        }catch(error){
            next(error)
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
                content : "Change your password"
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

            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            if(user.forgotPasswordCode !== code){
                res.code = 403; //403 Forbidden
                throw new Error("Invalid code")
            }

            const hashedPassword = await hashPassword(password)
            user.password = hashedPassword;
            user.forgotPasswordCode = null;

            await user.save()

            res.status(200).json({code : 200, status : true, message : "Password change successfull"})

        }catch(error){
            next(error)
        }
    },

    changePassword: async (req, res, next) => {
        try {
          const _id = req.user;
          const { oldPassword, newPassword } = req.body;
      
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
          await user.save();
      
          res.status(200).json({ code: 200, status: true, message: "Password changed successfully" });
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

            if (!securityQuestion|| !securityAnswer) {
                return res.status(400).json({ code: 400, status: false, message: "Question and answer are required" });
            }

            const user = await User.findById(_id)

            if (!user) {
                res.status(404).json({ code: 404, status: false, message: "User not found" });
                return;
            }

            const hashedAnswer = await hashAnswer(securityAnswer)

            user.securityQuestion = securityQuestion
            user.securityAnswer = hashedAnswer
            await user.save()

            res.status(200).json({code : 200, status : true, message : "Saved successfully"})

        }catch(error){
            next(error)
        }
    }
}

export default authController



