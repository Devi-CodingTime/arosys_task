import axios from 'axios';
export const getUserChats = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/chat/user-chats/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};
