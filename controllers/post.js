import File from "../models/File.js";
import User from "../models/User.js"
import Category from "../models/Category.js"
import Post from "../models/Post.js"
import Comment from "../models/Comment.js";
import sanitizeHtml from 'sanitize-html';
import { getIO } from "../utils/socket.js";

const postController = {
    addPost : async (req, res, next) => {
        try{

            const {title, description, file, category} = req.body;
            const {_id, author} = req.user;

            const io = getIO();

            const sanitizedDescription = sanitizeHtml(description, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
                allowedAttributes: {
                  '*': ['style'],
                  'img': ['src', 'alt'],
                },
              });

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
                title, description : sanitizedDescription, file, category, updatedBy : _id, author : _id
            })

            const savedPost = await newPost.save()
            io.emit('postAdded', savedPost);
            res.status(201).json({code : 201, status : true, message : "Post added successfully", data : savedPost})

        }catch(error){
            next(error)
        }
    },

    updatePost: async (req, res, next) => {
        try {
            const { title, description, file, category } = req.body;
            const { id } = req.params;
            const { _id } = req.user;
            const io = getIO();
    
            if (file) {
                const isFileExist = await File.findById(file);
                if (!isFileExist) {
                    return res.status(404).json({ code: 404, status: false, message: "File not found" });
                }
            }
    
            if (category) {
                const isCategoryExist = await Category.findById(category);
                if (!isCategoryExist) {
                    return res.status(404).json({ code: 404, status: false, message: "Category not found" });
                }
            }
    
            const post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({ code: 404, status: false, message: "Post not found" });
            }
    
            if (post.author._id.toString() !== req.user._id) {
                return res.status(403).json({ code: 403, status: false, message: "Forbidden: You cannot update this post" });
            }
    
            const sanitizedDescription = description ? sanitizeHtml(description, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
                allowedAttributes: {
                    '*': ['style'],
                    'img': ['src', 'alt'],
                },
            }) : post.description;
    
            post.title = title ? title : post.title;
            post.description = sanitizedDescription;
            post.file = file ? file : post.file;
            post.category = category ? category : post.category;
            post.updatedBy = _id;
    
            const updatedPost = await post.save();
            io.emit('postUpdated', updatedPost);
    
            res.status(200).json({ code: 200, status: true, message: "Post updated successfully", data: { updatedPost } });
        } catch (error) {
            next(error);
        }
    },

    getPosts : async(req, res, next) => {
        try {

            const {size, q, page, category} = req.query; // ?category

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
            .populate({
                path: 'author',
                select: '-password -verificationCode -forgotPasswordCode',
                populate: {
                path: 'profilePic',
                }
            })
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
            const {id} = req.params
            const {_id} = req.user

            const post = await Post.findById(id)
            .populate("file")
            .populate("category")
            .populate({
                path: 'author',
                select: '-password -verificationCode -forgotPasswordCode',
                populate: {
                path: 'profilePic',
                }
            })
            .populate({
                path: "updatedBy",
                select: "-password -verificationCode -forgotPasswordCode"
            });

            if(!post){
                res.code = 404;
                throw new Error("Post not found")
            }
            res.status(200).json({ code : 200, status : true, message : "Post founded successfully", data : {post}})
        } catch (error) {
            next(error)
        }
    },

    deletePost : async(req, res, next) => {
        try {
            const {id} = req.params; 
            const {_id} = req.user

            const post = await Post.findById(id)
            if(!post){
                res.code = 404;
                throw new Error("Posts not found")
            }


            if(post.author._id.toString() !== req.user._id){
                return res.status(403).json({ code: 403, status: false, message: "Forbidden: You cannot delete this post" });
            }

    
            await Post.findByIdAndDelete(id)
            res.status(200).json({code : 200, status : true, message : "Post deleted successfully"})

        } catch (error) {
            next(error)
        }
    },

    latestPost : async (req, res, next) => {
        try {
            const latestPosts = await Post.find()
                .sort({ createdAt: -1 })
                .limit(2)
                .populate('file') // Populate if you need details from the file reference
                .populate('comment') // Populate if you need details from the comment reference
                .populate('category') // Populate if you need details from the category reference
                .populate('updatedBy'); // Populate if you need details from the user reference
    
            res.status(200).json({
                code: 200,
                status: true,
                message: "Latest posts fetched successfully",
                data: latestPosts
            });
        } catch (error) {
            next(error);
        }
    },

    popularPost : async (req, res, next) => {
        try {
            const popularPosts = await Post.find()
            .sort({likesCount : "desc"})
            .limit(3)
            .populate('file') // Populate if you need details from the file reference
            .populate('comment') // Populate if you need details from the comment reference
            .populate('category') // Populate if you need details from the category reference
            .populate('updatedBy'); // Populate if you need details from the user reference

            res.status(200).json({code : 200, status : true, message : "Popular posts successfully loaded", data : popularPosts})
            
        } catch (error) {
            next(error)
        }
    }

}

export default postController