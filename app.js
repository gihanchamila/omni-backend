import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import morgan from "morgan"

import connectMongodb from "./init/mongodb.js"


// Load environment variables
dotenv.config()

connectMongodb()

// init app
const app = express()

// third-party middleware
app.use(cors({origin: "http://localhost:5173"}))
app.use(express.json({limit : "500mb"}));
app.use(bodyParser.urlencoded({limit : "500mb", extended : true}));
app.use(morgan("dev")) // to console log req

export default app;


