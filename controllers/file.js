import path from "path"
import { validateExtention } from "../validators/file.js"
import { uploadFileToS3, signedUrl, deleteFilesFromS3 } from "../utils/awsS3.js"
import File from "../models/File.js"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const fileController = {
    uploadFile: async (req, res, next) => {
        try {
            const { base64Image } = req.body;
            const { file } = req;
    
            let buffer, ext, isValidExt;
    
            if (base64Image) {
                const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
                buffer = Buffer.from(base64Data, 'base64');
                ext = base64Image.split(';')[0].split('/')[1]; // Extract extension without leading dot
                isValidExt = validateExtention(`.${ext}`);
                if (!isValidExt) {
                    return res.status(400).json({ code: 400, status: false, message: "Only 'jpg', 'jpeg' or 'png' is allowed" });
                }
            } else if (file) {
                buffer = file.buffer; 
                ext = path.extname(file.originalname).replace('.', ''); // Get extension without leading dot
                isValidExt = validateExtention(`.${ext}`);
                if (!isValidExt) {
                    return res.status(400).json({ code: 400, status: false, message: "Only 'jpg', 'jpeg' or 'png' is allowed" });
                }
            } else {
                return res.status(400).json({ code: 400, status: false, message: "No file data provided" });
            }
    
            const key = await uploadFileToS3({ file: { buffer }, ext: `.${ext}` }); // Pass the extension with a dot
            if (key) {
                const newFile = new File({
                    key,
                    size: buffer.length,
                    mimetype: `image/${ext}`,
                    createdBy: req.user._id
                });
                await newFile.save();
                return res.status(201).json({
                    code: 201,
                    status: true,
                    message: "File uploaded successfully",
                    data: { key, id: newFile._id }
                });
            }
    
            return res.status(500).json({ code: 500, status: false, message: "File upload failed" });
        } catch (error) {
            next(error);
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
    },

    deleteFile : async (req, res, next) => {
        try{

            const {key} = req.query;
            if(!key){
                res.code = 404;
                throw new Error("Key not found")
            }
            await deleteFilesFromS3(key)
            const file = await File.findOneAndDelete(key);

            if(!file){
                res.code = 404;
                throw new Error("File not found")
            }

            res.status(200).json({ code : 200, status : true, message : "File deleted successfully"})

        }catch(error){
            next(error)
        }
    }
}

export default fileController
