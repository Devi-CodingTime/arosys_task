import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return {
      users: response.data.data,
      success: true
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      users: [],
      success: false,
      error: error.message
    };
  }
};
