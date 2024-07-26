import User from "../models/User.js";
import Category from "../models/Category.js"

const categoryController = {

    addCategory : async(req, res, next) => {
        try{

            const {title, description} = req.body;
            const {_id} = req.User;

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
    }
}

export default categoryController;