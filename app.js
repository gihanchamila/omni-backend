import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import morgan from "morgan"

import connectMongodb from "./init/mongodb.js"

import { authRoute, categoryRoute } from "./routes/index.js"

import { errorHandler } from "./middlewares/errorHandler.js"
import { notFound } from "./controllers/notfound.js"

// Load environment variables
dotenv.config()


connectMongodb()

// init app
const app = express()

// third-party middleware
app.use(cors({origin: "http://localhost:5173"}))
app.use(express.json({limit : "500mb"}));
app.use(bodyParser.urlencoded({limit : "500mb", extended : true}));
app.use(morgan("dev"))

// route section

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/category", categoryRoute)

// not found controller
app.use("*", notFound) 

/* 
    * is a wildcard in express.js 
    It matches all the routes and then others are set to not found
    Before this, we should set routs earlier
*/ 

// error handler middlewares
app.use(errorHandler)

export default app;


