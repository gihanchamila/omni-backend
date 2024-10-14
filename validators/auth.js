import { check } from "express-validator";

export const signupValidator = [
    check("firstName")
        .notEmpty()
        .withMessage("First Name is required"),

    check("lastName")
        .notEmpty()
        .withMessage("Last Name is required"),
    
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
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one symbol')

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
        .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
        .matches(/\d/).withMessage("Password must contain at least one number")
        .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one symbol")
];

export const changePasswordValidator = [
    check("oldPassword")
        .notEmpty()
        .withMessage("Old password is required"),

    check("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .matches(/[A-Z]/).withMessage("New password must contain at least one uppercase letter")
        .matches(/[a-z]/).withMessage("New password must contain at least one lowercase letter")
        .matches(/\d/).withMessage("New password must contain at least one number")
        .matches(/[^A-Za-z0-9]/).withMessage("New password must contain at least one symbol")
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



export const validateSecurityQuestion = [
    check('securityQuestion')
        .notEmpty()
        .withMessage('Question is required'),
    check('securityAnswer')
        .notEmpty()
        .withMessage('Answer is required'),
];
