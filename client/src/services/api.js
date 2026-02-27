import axios from 'axios';

export const apiCall = async (url, options = {}) => {
  try {
    const BASE_URL = import.meta.env.DEV 
      ? 'http://localhost:5000' 
      : 'https://crm-mern-assignment-14.onrender.com';  
    
    let cleanUrl = url.replace(/\/api\/api\//g, '/api/');
    
    const fullUrl = `${BASE_URL}${cleanUrl}`;
    
    console.log('🔗 Calling:', fullUrl);
    
    const response = await axios({
      url: fullUrl,
      method: options.method || 'GET',
      ...(options.body && { data: options.body }),
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        })
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data);
    throw error;
  }
};