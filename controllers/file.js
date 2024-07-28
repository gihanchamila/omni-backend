import path from "path"
import { validateExtention } from "../validators/file.js"
import { uploadFileToS3, signedUrl, deleteFilesFromS3 } from "../utils/awsS3.js"
import File from "../models/File.js"

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

    
}
