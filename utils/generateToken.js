import jwt from "jsonwebtoken"
import { jwtSecret } from "../config/kyes.js"

export const generateToken = (user) => {
    const token = jwt.sign({
        _id : user._id,
        name : user.name,
        email : user.email,
        role : user.role
    },
    jwtSecret,
    {
        expiresIn : "7d"
    });
    return token
}