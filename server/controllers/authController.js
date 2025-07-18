import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser= async (req, res) => {
    try {
        const {name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) { 
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send({
            success:true,
            message: "User registered successfully",
            data:newUser 
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Registration failed", error: error.message });
    }
};
export const loginUser= async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({
                success:false, message: "User not found" 
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).send({
                success:false,
                message: "Invalid password" 
            });
        }
        console.log("isPasswordValid", isPasswordValid);
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        
        res.status(200).send({
            success:true, 
            token,
            data: user,
            message: "User logged in successfully" 
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Login failed", error: error.message });
    }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(
      {}, 
      { 
        name: 1, 
        email: 1,
        _id: 1 
      }
    ).sort({ name: 1 }); // Sort by name alphabetically
    
    res.status(200).send({success:true,data:users });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting users",
      error
    });
  }
};
