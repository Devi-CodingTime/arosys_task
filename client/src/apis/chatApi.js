import axios from 'axios';

const API_URL = 'http://localhost:8000/api/chat';

export const getUserChats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user-chats/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};
