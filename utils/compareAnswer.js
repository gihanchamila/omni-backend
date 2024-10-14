import bcrypt from "bcryptjs"

export const compareAnswer = async (answer, hashedAnswer) => {
    return await bcrypt.compare(answer, hashedAnswer)
}