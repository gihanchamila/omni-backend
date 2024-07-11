import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const { PORT, CONNECTION_URL } = process.env;

// Correctly destructure and export the variables
export const port = PORT;
export const connectionUrl = CONNECTION_URL;