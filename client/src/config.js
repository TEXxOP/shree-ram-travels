// client/src/config.js - API Configuration

// Automatically detect environment and use appropriate API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
        ? 'https://shree-ram-travels-api.onrender.com'  // Production API
        : 'http://localhost:5000');                      // Development API

export default API_BASE_URL;

// Usage in components:
// import API_BASE_URL from '../config';
// const response = await axios.get(`${API_BASE_URL}/api/routes/all`);
