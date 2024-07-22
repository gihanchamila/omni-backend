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
]