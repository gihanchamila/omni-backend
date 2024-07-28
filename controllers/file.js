import path from "path"
import { validateExtention } from "../validators/file.js"
import { uploadFileToS3, signedUrl, deleteFilesFromS3 } from "../utils/awsS3.js"
import File from "../models/File.js"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const fileController = {
    uploadFile : async (req, res, next) => {
        try{

            const {file} = req;
            if(!file){
                res.code = 400;
                throw new Error("File not selected")
            }

            const ext = path.extname(file.originalname)
            const isValidext = validateExtention(ext)

            if(!isValidext){
                res.code = 400;
                throw new Error("Only 'jpg', 'jpeg' or 'png' is allowed")
            }

            const key = await uploadFileToS3({file, ext})
            if(key){
                const newFile = new File({
                    key,
                    size : file.size,
                    mimetype : file.mimetype,
                    createdBy : req.user._id
                })
            }

        }catch(error){
            next(error)
        }
    },

    getSignedUrl : async (req, res, next) => {
        try{

            const {key} = req.query;
            const url = await signedUrl(key)

            res.status(200).json({ code : 200, status : true, message : "Get signed url successfully", data : {url}})

        }catch(error){
            next(error)
        }
    }


}
