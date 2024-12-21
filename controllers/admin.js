import mongoose from "mongoose";
import User from "../models/User.js";
import { getIO } from "../utils/socket.js";

const adminController = {

    getAdminList: async (req, res, next) => {
        try {
            // Destructure and validate query parameters
            const { q, size, page, sortField, sortOrder } = req.query;

            // Validate and parse pagination and sorting
            const sizeNumber = Math.max(parseInt(size) || 10, 1);  // Minimum size is 1
            const pageNumber = Math.max(parseInt(page) || 1, 1);  // Minimum page is 1

            // Validate and build search query
            let query = { role: { $in: [1, 2] } };
            if (q && typeof q === 'string' && q.length <= 50) {  // Limit search string length
                const search = new RegExp(q, "i");
                query.$or = [{ id: search }, { firstName: search }];
            }

            // Validate sortField and sortOrder
            const validSortFields = ['id', 'firstName', 'lastName', 'email'];  // Define valid fields here
            const sort = {};
            if (sortField && validSortFields.includes(sortField)) {
                sort[sortField] = sortOrder === 'desc' ? -1 : 1;
            }

            // Count total documents and calculate pages
            const total = await User.countDocuments(query);
            const pages = Math.ceil(total / sizeNumber);

            // Fetch paginated and sorted results
            const admins = await User.find(query).select('_id firstName lastName email gender isVerified createdAt')
                .skip((pageNumber - 1) * sizeNumber)
                .limit(sizeNumber)
                .sort(sort);

            res.status(200).json({ code: 200, status: true, message: "All Admins fetched successfully", admins, pages });
        } catch (error) {
            next(error);
        }
    },

    removeAdmin : async (req, res, next) => {
        try{
            const {id} = req.params;
            const io = getIO()

            const user = await User.findById(id)
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (typeof user.role == 'number' && user.role == 3) {
                return res.status(400).json({ message: "User is not an admin" });
            }

            user.role = 3; 
        
            await user.save();
            io.emit("Admin-previlages-changed", {id})
            res.status(200).json({code : 200, status : true, message : "Admin previlages changed successfully", userRole : user.role })
        } catch(error){
            next(error)
        }
    }
}

export default adminController;