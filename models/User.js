import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name : {type : String, required : true, minlength : 3},
    email : {type : String, required : true, trim : true, unique : true},
    bio : {type : String, default : null},
    dateOfBirth : {type : Date, default : null},
    followers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    password : {type : String, required : true, minlength : 6},
    // role 1 - Super admin, role 2 - Admin, role 3 - Normal
    role : {type : Number, default : 3},
    verificationCode : String,
    forgotPasswordCode : String,
    isVerified : {type : Boolean, default : false},
    isActive : {type : Boolean, default : true},
    deactivation : {type : Date, default : null},
    profilePic : {type : mongoose.Types.ObjectId, ref : 'file', default : null},
    coverPhoto : {type : mongoose.Types.ObjectId, ref : 'file', default : null},
    devices: [
        {
            deviceType: { type: String },
            browser: { type: String },
            ipAddress: { type: String },
            loggedInAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps : true
})

const User = mongoose.model("user", userSchema)
export default User;