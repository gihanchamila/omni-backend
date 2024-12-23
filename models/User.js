import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName : {type : String, required : true, minlength : 3},
    lastName : {type : String, required : true, minlength : 3},
    email : {type : String, required : true, trim : true, unique : true},
    securityQuestion : {type : String},
    securityAnswer : {type : String},
    about : {type : String, default : null},
    dateOfBirth : {type : String, default : null},
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    interests : {type : [String], default : []},
    followers: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    notifications : [{type: mongoose.Types.ObjectId, ref : 'notification'}],
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
    devices: [{
        deviceType: String,
        browser: String,
        os: String,
        ipAddress: String,
        location: String,
        loggedInAt: Date
    }]
}, {
    timestamps : true
})

const User = mongoose.model("user", userSchema)
export default User;