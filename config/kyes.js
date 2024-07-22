import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { PORT, CONNECTION_URL, JWT_SECRET, SENDER_EMAIL, EMAIL_PASSWORD } = process.env;

// Correctly destructure and export the variables
export const port = PORT;
export const connectionUrl = CONNECTION_URL;
export const jwtSecret = JWT_SECRET;
export const senderEmail = SENDER_EMAIL;
export const emailPassword = EMAIL_PASSWORD;