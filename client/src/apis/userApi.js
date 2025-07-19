import axios from 'axios';
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/auth/users`);
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
