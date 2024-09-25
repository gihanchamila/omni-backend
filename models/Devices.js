import mongoose from "mongoose";

const deviceSchema = mongoose.Schema({
    deviceType: { type: String, required: true }, // e.g. Laptop, Mobile
    browser: { type: String, required: true }, // e.g. Chrome, Firefox
    ipAddress: { type: String, required: true }, // e.g. 192.168.x.x
    loginTime: { type: Date, default: Date.now } // Timestamp of login
})

const Device = mongoose.model("device", deviceSchema)
export default Device