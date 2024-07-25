import {User} from "../models/index.js"
import hashPassword from "../utils/hashPassword.js"
import { comparePassword } from "../utils/comparePassword.js";
import { generateToken } from "../utils/generateToken.js";
import { generateCode } from "../utils/generateCode.js";
import { sendMail } from "../utils/sendEmail.js";

const authController = {
    signup : async (req, res, next) => {
        try{
            const {name, email, password, role} = req.body;
    
            const isEmailExist = await User.findOne({email})
            if(isEmailExist){
                res.code = 400;
                throw new Error("Email is already exit")
            }
    
            const hashedPassword = await hashPassword(password)
    
            const newUser = new User({
                name,
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

    signin : async (req, res, next) => {
        try{
            const {email, password} = req.body
            const user = await User.findOne({email})
        
            if(!user){
                res.code = 401
                throw new Error("Invalid credentials")
            }

            const match = await comparePassword(password, user.password) // user.password = hashedPassword
            if(!match){
                res.code = 401
                throw new Error("Invalid credentials")
            }

            const token = generateToken(user)

            res.status(200).json({ code : 200, status : true, message : "User signin successfull",  data : {token, user}})

        }catch(error){
            next(error)
        }
    },

    verifyCode : async (req, res, next) => {
        try{

            const {email} = req.body;
            const user = await User.findOne({email})

            if(!user){
                res.code = 404
                throw new Error("User not found")
            }

            if(user.isVerified){
                res.code = 404
                throw new Error("User is already verified")
            }

            const code = generateCode(6)
            user.verificationCode = code
            await user.save()
            console.log(code)

            //send Email

            await sendMail({
                emailTo : user.email,
                subject : "Email verification code",
                code,
                content : "Verify your account"
            });

            res.status(200).json({code : 200, status : true, message : "User verification code sent successfully"})

        }catch(error){
            next(error)
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
    
}

export default authController



