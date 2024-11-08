import bcrypt from "bcryptjs"

const hashAnswer = (answer) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (error, salt) => {
            if(error){
                return reject(error)
            }
            bcrypt.hash(answer, salt, (error, hash) => {
                if(error){
                    return reject(error)
                }
                resolve(hash)
            })
        })
    })
}

export default hashAnswer;