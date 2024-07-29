import User from "../models/User.js";
import Category from "../models/Category.js"
import Post from "../models/Post.js";

const categoryController = {

    addCategory : async(req, res, next) => {
        try{

            const {title, description} = req.body;
            const {_id} = req.user;

            const isCategoryExist = await Category.findOne({title})
            if(isCategoryExist){
                res.code = 400; // Bad request
                throw new Error("Category already exists")
            }

            const user = await User.findOne({_id})
            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            const newCategory = new Category({title, description, updatedBy : _id})
            await newCategory.save()

            res.status(200).json({code : 200, status : true, message : "Category added successfully"})
        }catch(error){
            next(error)
        }
    },

    updateCategory : async (req, res, next) => {
        try{

            const {id} = req.params;
            const {_id} = req.user;
            const {title, description} = req.body;

            // Find category
            const category = await Category.findById(id)
            if(!category){
                res.code = 404;
                throw new Error("Category not found")
            }

            // Find category by title
            const isCategoryExist = await Category.findOne({title})

            // This ensures that the title of the existing category matches the title you're checking
            // Compare different categories
            if(isCategoryExist && isCategoryExist.title === title && String(isCategoryExist._id) !== String(category._id)){
                res.code = 400;
                throw new Error("Title already exists")
            }

            category.title = title ? title : category.title
            category.description = description
            category.updatedBy = _id
            await category.save()

            res.status(200).json({code : 200, status : true, message : "Category updated successfully"})

        }catch(error){
            next(error)
        }
    },

    deleteCategory : async (req, res, next) => {
        try{

            // Get id from params
            const {id} = req.params

            const category = await Category.findById(id)
            if(!category){
                res.code = 404;
                throw new Error("Category not found")
            }

            await Category.findByIdAndDelete(id)
            res.status(200).json({code : 200, status : true, message : "Category deleted successfully"})
        }catch(error){
            next(error)
        }
    },

    getCategories : async (req, res, next) => {
        try{

            // Extract query parameters from the request
            const {q, size, page} = req.query;
            let query = {}

            // Parse size and page parameters or set default values
            const sizeNumber = parseInt(size) || 10
            const pageNumber = parseInt(page) || 1

            if(q){
                const search = RegExp(q, "i")
                // Construct a query object to search for the title or description fields
                query = { $or :[{title : search}, {description : search}]}
            }

            const total = await Category.countDocuments(query)
            const pages = Math.ceil(total / sizeNumber)

             // Retrieve the categories from the database with pagination and sorting
            const categories = await Category.find(query).skip((pageNumber -1)* sizeNumber).limit(sizeNumber).sort({updatedBy : -1})

            res.status(200).json({code : 200, status : true, message : "Get category list successfully", data : {categories, total, pages}})

        }catch(error){
            next(error)
        }
    },

    getCategory : async (req, res, next) => {
        try{

            const {id} = req.params

            const category = await Category.findById(id)
            if(!category){
                res.code = 404;
                throw new Error("Category not found")
            }

            res.status(200).json({code : 200, status : true, message : "Get category successfully", data : {category}})

        }catch(error){
            next(error)
        }
    }
}

export default categoryController;