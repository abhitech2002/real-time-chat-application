import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Users API calls
export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (userId) => api.get(`/users/${userId}`)
};

// Messages API calls
export const messagesAPI = {
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (messageData) => api.post('/messages', messageData)
};

// Rooms API calls
export const roomsAPI = {
  createRoom: (roomData) => api.post('/rooms', roomData),
  getRooms: () => api.get('/rooms'),
  getRoomById: (roomId) => api.get(`/rooms/${roomId}`),
  getRoomMessages: (roomId) => api.get(`/rooms/${roomId}/messages`),
  addMember: (roomId, userId) => api.post(`/rooms/${roomId}/members`, { userId }),
  leaveRoom: (roomId) => api.delete(`/rooms/${roomId}/leave`),
  removeMember: (roomId, userId) => api.delete(`/rooms/${roomId}/members/${userId}`),
  deleteRoom: (roomId) => api.delete(`/rooms/${roomId}`)
};

// Upload API calls
export const uploadAPI = {
  uploadFile: (formData) => api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export default api;