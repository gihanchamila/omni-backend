import nodemail from "nodemailer"
import { senderEmail, emailPassword } from "../config/kyes.js"

export const sendMail = async ({emailTo, subject, code, content}) => {
    const transporter = nodemail.createTransport({
        host : "smtp.gmail.com",
        port : 587,
        secure : false,
        auth : {
            user : senderEmail,
            pass : emailPassword
        }
    });

    const message = {
        to : emailTo,
        subject,
        html : 
                `<div>
                    <h3>Use this below code to ${content}</h3>
                    <p><strong>Code : </strong> ${code}</p>
                </div>
                `
    }

    await transporter.sendMail(message)
}