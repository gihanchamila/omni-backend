import {User} from "../models/index.js"
import hashPassword from "../utils/hashPassword.js"
import { comparePassword } from "../utils/comparePassword.js";
import { generateToken } from "../utils/generateToken.js";

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
    }
}

export default authController



