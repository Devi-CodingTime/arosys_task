import express from "express";
import http from "http";
import { Server as socketIo} from "socket.io";
import cors from "cors";
import { configDotenv } from "dotenv";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoute.js";
configDotenv();
connectDB();
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));
const server = http.createServer(app);
const io = new socketIo(server, {
    cors:{
        origin:"http://localhost:3000",
        methods: ["GET", "POST"],
        credentials:true
    }
});

// api
app.use("/test", (req, res) => {
    res.send("API is running");
});
app.use("/api/auth", authRouter);
io.on("connection", (socket)=>{
    console.log("Client  : ", socket.id);

    socket.on("send_message", (data) => {
        // Forward the message object as is
        io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
    
});

server.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})