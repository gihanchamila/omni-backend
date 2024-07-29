import { check } from "express-validator";

export const signupValidator = [
    check("name")
        .notEmpty()
        .withMessage("Name is required"),
    
    check("email")
        .isEmail()
        .withMessage("Invalid email")
        .notEmpty()
        .withMessage("Email is required"),

    check("password")
        .notEmpty()
        .withMessage("Invalid password")
        .isLength({min : 6})
        .withMessage("Password should be 6 characters long")

];

export const signinValidator = [
    check("email")
        .isEmail()
        .withMessage("Invalid email")
        .notEmpty()
        .withMessage("Email is required"),
    
    check("password")
        .notEmpty()
        .withMessage("Password is required")
];

export const emailValidator = [
    check("email")
        .isEmail()
        .withMessage("Invalid email")
        .notEmpty()
        .withMessage("Email is required")
];

export const verifyUserValidator = [
    check("email")
        .isEmail()
        .withMessage("Invalid email")
        .notEmpty()
        .withMessage("Email is required"),
    
    check("code")
        .notEmpty()
        .withMessage("code is required")
];

export const recoverPasswordValidator = [
    check("email")
        .isEmail()
        .withMessage("Invalid email")
        .notEmpty()
        .withMessage("Email is required"),

    check("code")
        .notEmpty()
        .withMessage("code is required"),

    check("password")
        .notEmpty()
        .withMessage("Invalid password")
        .isLength({min : 6})
        .withMessage("Password should be 6 characters long")
];

export const changePasswordValidator = [
    check("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),

    check("newPassword")
        .notEmpty()
        .withMessage("New password is required")
];

export const updateProfileValidator = [
    check("email").custom(async (email) => {
        if(email){
            const isValidEmail = validateEmail(email)
            if(!isValidEmail){
                throw "Invalid email"
            }
        }
    }),

    check("profilePic").custom(async (profilePic) => {
        if(profilePic && !mongoose.Types.ObjectId.isValid(profilePic)){
            throw "Invalid profile picture"
        }
    })
];