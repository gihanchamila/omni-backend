import bcrypt from "bcryptjs"

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}