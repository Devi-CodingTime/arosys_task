import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { Server as socketIo } from 'socket.io';
import { connectDB } from "./config/db.js";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import chatRoute from "./routes/chatRoute.js";
import { saveMessage, getChatHistory } from './controllers/chatController.js';

const app = express();
app.use(express.json());
app.use(cors());

// http://localhost:3000
const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  }
});

const connectedUsers = new Map();

io.on('connection', socket => {
  const userId = socket.handshake.query.id;
  
  if (userId) {
    socket.join(userId);
    connectedUsers.set(userId, {
      id: userId,
      socketId: socket.id,
      online: true
    });
    
    io.emit('userConnected', Array.from(connectedUsers.values()));

    // Handle private messages
    socket.on('privateMessage', async (messageData) => {
      try {
        const { senderId, receiverId, message, senderName } = messageData;
        
        // Save message to database
        await saveMessage({
          senderId,
          receiverId,
          content: message
        });

        // Send to receiver
        const receiverSocket = connectedUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('message', {
            senderId,
            message,
            senderName,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error handling private message:', error);
      }
    });

    // Handle chat history request
    socket.on('getChatHistory', async ({ partnerId }) => {
      try {
        const messages = await getChatHistory(userId, partnerId);
        socket.emit('chatHistory', messages);
      } catch (error) {
        console.error('Error getting chat history:', error);
      }
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      io.emit('userConnected', Array.from(connectedUsers.values()));
    });
  }
});

dotenv.config();
connectDB();

app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);

server.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
