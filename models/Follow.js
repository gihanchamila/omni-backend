import mongoose from "mongoose";

const followSchema = mongoose.Schema({
    follower: {type: mongoose.Types.ObjectId, ref: 'user'},
    following: {type: mongoose.Types.ObjectId, ref: 'user'}
}, {timestamps : true})

followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model("follow", followSchema)
export default Follow