import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({ 
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: { 
        type: String,
        required: true,
    },
}, { timestamps: true });

// Export the User model
export default mongoose.model("User", userSchema);


