import User from "../models/User.js";
import Category from "../models/Category.js"
import File from "../models/File.js";
import Post from "../models/Post.js";
import Follow from "../models/Follow.js";
import { getIO } from "../utils/socket.js";
import mongoose from "mongoose";
import { signedUrl } from "../utils/awsS3.js";
import { deleteFilesFromS3 } from "../utils/awsS3.js";

const userController = {

    followUser: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const io = getIO()
    
            if (id === userId.toString()) {
                return res.status(400).json({ code: 400, status: false, message: 'Cannot follow yourself' });
            }
    
            // Check if the follow relationship already exists
            const existingFollow = await Follow.findOne({ follower: userId, following: id });
            if (existingFollow) {
                return res.status(400).json({ code: 400, status: false, message: 'Already following' });
            }
    
            const followerUser = await User.findById(userId);
            const followingUser = await User.findById(id);
    
            if (!followerUser || !followingUser) {
                return res.status(404).json({   
             code: 404, status: false, message: 'User not found' });
            }
    
            // Create a new follow document
            const follow = new Follow({
                follower: userId,
                following: id
            });
    
            await follow.save();
    
            // Update user documents using findByIdAndUpdate
            await User.findByIdAndUpdate(userId, { $addToSet: { following: id } }, { new: true });
            await User.findByIdAndUpdate(id, { $addToSet: { followers: userId } }, { new: true });

            io.emit('follow-status-updated', { followerId: userId, followingId: id });
            console.log('Emitting follow-status-updated:', { followerId: userId, followingId: id });
    
            res.status(200).json({ code: 200, status: true, message: 'Followed successfully' });
        } catch (error) {
            console.error("Error following user:", error);
            if (error.code === 11000) {
                return res.status(400).json({ code: 400, status: false, message: 'Already following' });
            }
            next(error);
        }
    },

    unFollowUser: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;
            const io = getIO()
    
            // Find and delete the follow relationship
            const follow = await Follow.findOneAndDelete({ follower: userId, following: id });
            if (!follow) {
                return res.status(400).json({ code: 400, status: false, message: 'Not following' });
            }
    
            // Update user documents using findByIdAndUpdate
            await User.findByIdAndUpdate(userId, { $pull: { following: id } }, { new: true });
            await User.findByIdAndUpdate(id, { $pull: { followers: userId } }, { new: true });

            io.emit('follow-status-updated', { followerId: userId, followingId: id, unfollow: true });
    
            res.status(200).json({ code: 200, status: true, message: 'Unfollowed successfully' });
        } catch (error) {
            console.error("Error unfollowing user:", error);
            next(error);
        }
    },

    getFollowersCount : async (req, res, next) => {
        try{

            const { id } = req.params

            const user = await User.findById(id).populate({
                path: 'followers',
                select: 'name' 
            })
            .select('followers');

            if(!user){
                res.status(404).json({code : 404, status : true, message : "User not found"})
            }

            const followersCount = user.followers.length
            const followerNames = user.followers.map(follower => follower.name);

            res.status(200).json({code : 200, status : true, message : "Followers count get successfull", data : {followersCount, followerNames}})


        }catch(error){
            next(error)
        }
    },

    getFollowingCount : async (req, res, next) => {
        try{

            const {id} = req.params;

            const user = await User.findById(id).select('name following')

            if(!user){
                res.status(404).json({code : 404, status : true, message : "User not found"})
            }

            const followingCount = user.following.length

            res.status(200).json({code : 200, status : true, message : "Following count get successfull", data : {followingCount} })

        }catch(error){
            next(error)
        }
    },

    checkFollowStatus: async (req, res, next) => {
        try {
            const userId = req.params.id;
            const currentUserId = req.user._id;
    
            // Fetch the target user's document using findById
            const targetUser = await User.findById(userId);
    
            if (!targetUser) {
                return res.status(404).json({ code: 404, status: false, message: 'User not found' });
            }
    
            // Check if the current user is in the target user's followers array
            const isFollowing = targetUser.followers.includes(currentUserId);
    
            res.status(200).json({ code: 200, status: true, message: 'Follow status fetched successfully', data: { isFollowing } });
        } catch (error) {
            next(error)
        }
    },

    getUserPosts: async (req, res, next) => {
        try {

            const {id} = req.params
            const userId = req.user._id;
    
            // Find all posts where the author is the userId
            const blogs = await Post.find({ author: id })
                                    .populate('author', 'name')
                                    .populate('file', 'key') 
                                    .populate('category', 'name') 
                                    .populate('updatedBy', 'name'); 
    
            if (!blogs.length) {
                return res.status(404).json({ message: "No blogs found for this user" });
            }
    
            res.status(200).json({ code: 200, status: true, message: "User blogs fetched successfully", data: blogs });
        } catch (error) {
            next(error);
        }
    },

    userDevices : async(req, res, next) => {
        try {
            const userId = req.user._id; 
            const user = await User.findById(userId).select('devices');

            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            res.status(200).json({ code : 200, status : true, message : "User logged in devices got successfully", data : user})
        } catch (error) {
            next(error)
        }
    },

    updateUser : async(req, res, next) => {
        try {
            const {_id} = req.user;
            const {firstName, lastName, email, dateOfBirth, interests, about, gender} = req.body;
            const user = await User.findById(_id).select(" -password -verificationCode -forgotPasswordCode -isVerified -isActive -deactivation -followers -following -role -coverPhoto -profilePic -devices -createdAt -updatedAt")

            if(!user){
                res.code = 404;
                throw new Error("User not found")
            }

            const isEmailExist = await User.findOne({email})

            if (isEmailExist && String(isEmailExist._id) !== String(user._id)) {
                res.status(400);
                throw new Error("Email already exists");
            }

            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.email = email || user.email;
            user.dateOfBirth = dateOfBirth || user.dateOfBirth;
            user.about = about || user.about
            user.gender = gender || user.gender
           
            if (interests) {
                if (Array.isArray(interests)) {
                    user.interests = interests;
                } else {
                    res.status(400);
                    throw new Error("Interests must be an array");
                }
            }
    

            await user.save();
            res.status(200).json({ code : 200, status : true, message : "User details updated", data : user})
        } catch(error){
            next(error)
        }
    },

    addProfilePic: async (req, res, next) => {
        try {
            const { _id } = req.user; 
            const { profilePic } = req.body;
            const io = getIO()
    
            if (!mongoose.Types.ObjectId.isValid(profilePic)) {
                return res.status(400).json({ code: 400, status: false, message: "Invalid profilePic ID format" });
            }
    
            const user = await User.findById(_id).select("name email profilePic");
            if (!user) {
                return res.status(404).json({ code: 404, status: false, message: "User not found" });
            }
    
            const file = await File.findById(profilePic);
            if (!file) {
                return res.status(404).json({ code: 404, status: false, message: "File not found" });
            }

            user.profilePic = profilePic;
            await user.save();

            const signedUrlForPic = await signedUrl(file.key);

            io.emit('profilePicUpdated', {
                userId: _id,
                signedUrl: signedUrlForPic,
            });
            console.log('Emitted profilePicUpdated event:', { userId: _id, signedUrl: signedUrlForPic });
    
            res.status(200).json({ code: 200, status: true, message: "User profile updated successfully", data: { user } });
        } catch (error) {

            next(error);
        }
    },

    removeProfilePic: async (req, res, next) => {
        try {
            const { _id } = req.user;
            //const { profilePic } = req.body;
            const { id } = req.query;
            const io = getIO();

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ code: 400, status: false, message: "Invalid profilePic ID format" });
            }
    
            const user = await User.findById(_id).select("name email profilePic");
            if (!user) {
                return res.status(404).json({ code: 404, status: false, message: "User not found" });
            }
    
            if (user.profilePic.toString() !== id) {
                return res.status(400).json({ code: 400, status: false, message: "Profile picture does not match" });
            }
    
            const file = await File.findById(id);
            if (!file) {
                return res.status(404).json({ code: 404, status: false, message: "File not found" });
            }

            await File.findByIdAndDelete(id);
            await deleteFilesFromS3(file.key)
            user.profilePic = null;
            await user.save();
    
            io.emit('profilePicRemoved', {
                userId: _id,
            });
    
            res.status(200).json({ code: 200, status: true, message: "Profile picture removed successfully" });
        } catch (error) {
            next(error);
        }
    }
    
}

export default userController