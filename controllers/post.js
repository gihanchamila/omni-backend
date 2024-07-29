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

            const {title, description, file, category} = req.body;
            const {id} = req.params;
            const {_id} = req.user

            if(file){
                const isFileExist = await File.findById(file)
                if(!isFileExist){
                    res.code = 404;
                    throw new Error("File not found")
                }
            }

            if(category){
                const isCategoryExist = await Category.findById(category)
                if(!isCategoryExist){
                    res.code = 404;
                    throw new Error("Category not found")
                }
            }

            const post = await Post.findById(id)
            if(!post){
                res.code = 404;
                throw new Error("Post not found")
            }

            post.title  = title ? title : post.title;
            post.description = description ? description : post.description;
            post.file = file ? file : post.file;
            post.category = category ? category : post.category;
            post.updatedBy = _id

            updatedPost = await post.save()

            res.code(200).json({code : 200, status : true, message : "Post updated successfully", data : updatePost})
        }catch(error){
            next(error)
        }
    },

    getPosts : async(req, res, next) => {
        try {

            const {size, q, page, category} = req.query;

            const pageNumber = parseInt(page) || 1
            const sizeNumber = parseInt(size) || 10
            let query = {}

            if(q){
                const search = new RegExp(q, "i")

                query = {
                    $or: [{title : search}]
                }
            }

            if(category){
                query = {...query, category}
            }

            console.log(query);

            const total = await Post.countDocuments(query)
            const pages = Math.ceil(total / sizeNumber)

            const posts = await Post.find(query)
            .populate("file")
            .populate("category")
            .select("-password -verificationCode -forgotPasswordCode")
            .sort({updatedBy : -1})
            .skip((pageNumber - 1) * sizeNumber)
            .limit(sizeNumber)

            res.status(200).json({code : 200, status : true, messages : "Get post list successfully", data : {posts, total, pages}})
            
        } catch (error) {
            next(error)
        }
    },

    getPost : async(req, res, next) => {
        try {
            
        } catch (error) {
            next(error)
        }
    }

}

export default postController