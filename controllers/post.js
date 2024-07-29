import File from "../models/File.js";
import User from "../models/User.js"
import Category from "../models/Category.js"
import Post from "../models/Post.js"

const postController = {
    addPost : async (req, res, next) => {
        try{

            const {title, description, file, category} = req.body;
            const {_id} = req.user;

            if(file){
                const isFileExist = await File.findById(file)
                if(!isFileExist){
                    res.code = 404;
                    throw new Error("File not found")
                }
            }

            const isCategoryExist = await Category.findById(category)
            if(!isCategoryExist){
                res.code = 404;
                throw new Error("Category not found")
            }

            const newPost = new Post({
                title, description, file, category, updatedBy : _id
            })

            const savedPoast = await newPost.save()
            res.status(201).json({code : 201, status : true, message : "Post added successfully", data : savedPoast})

        }catch(error){
            next(error)
        }
    },

    updatePost : async(req, res, next) => {
        try{

        }catch(error){
            next(error)
        }
    }
}

export default postController