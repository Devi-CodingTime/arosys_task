import Chat from "../model/chatModel.js";
import User from "../model/userModel.js";

export const saveMessage = async (messageData) => {
  try {
    const { senderId, receiverId, content } = messageData;

    let chat = await Chat.findOne({
      participants: {
        $all: [senderId, receiverId]
      }
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        messages: []
      });
    }

    chat.messages.push({
      sender: senderId,
      content: content
    });

    await chat.save();
    return chat;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

export const getChatHistory = async (userId1, userId2) => {
  try {
    const chat = await Chat.findOne({
      participants: {
        $all: [userId1, userId2]
      }
    }).populate({
      path: 'messages.sender',
      model: User,
      select: 'name email'
    });
    
    return chat?.messages || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

export const getUserChats = async (userId) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [userId] }
    }).populate({
      path: 'participants',
      model: User,
      select: 'name email'
    }).populate({
      path: 'messages.sender',
      model: User,
      select: 'name email'
    });

    // Format chats for frontend
    return chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
      return {
        chatId: chat._id,
        contact: {
          id: otherParticipant._id,
          name: otherParticipant.name,
          email: otherParticipant.email
        },
        lastMessage: chat.messages[chat.messages.length - 1] || null
      };
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};
