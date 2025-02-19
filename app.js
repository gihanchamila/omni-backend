import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import morgan from "morgan"

//Morgan logs HTTP requests for monitoring and debugging.

import connectMongodb from "./init/mongodb.js"

import { authRoute, categoryRoute, commentRoute, fileRoute, likeRoute, postRoute, userRoute, adminRoute, notificationRoute } from "./routes/index.js"
import { errorHandler } from "./middlewares/errorHandler.js"
import { notFound } from "./controllers/notfound.js"

// Load environment variables
dotenv.config()

connectMongodb()

// init app
const app = express()

// third-party middleware
// This middleware will used for online servers

  app.use(
    cors({
        origin: ['https://omni-frontend-steel.vercel.app', 'https://omni-frontend-g60c4kvvb-gihanchamilas-projects.vercel.app', 'https://omni-frontend-cejdis2h9-gihanchamilas-projects.vercel.app], 
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
  );



// This is used for localhost
// app.use(cors({origin: "http://localhost:5173"}))
app.use(express.json({limit : "500mb"}));
app.use(bodyParser.urlencoded({limit : "500mb", extended : true}));
app.use(morgan("dev"))

// route section

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/category", categoryRoute)
app.use("/api/v1/file", fileRoute)
app.use("/api/v1/posts", postRoute)
app.use("/api/v1/comments", commentRoute)
app.use("/api/v1/likes", likeRoute)
app.use("/api/v1/user", userRoute)
app.use("/api/v1/admin", adminRoute)
app.use("/api/v1/notification", notificationRoute)

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


