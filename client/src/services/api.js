import axios from 'axios';

export const apiCall = async (url, options = {}) => {
  try {
    const BASE_URL = import.meta.env.DEV 
      ? 'http://localhost:5000' 
      : 'https://crm-mern-kdbb.onrender.com';

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

//  AUTH API FUNCTIONS
export const loginUser = async (email, password) => {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
};

export const registerUser = async (name, email, password) => {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: { name, email, password }
  });
};

// CUSTOMER API FUNCTIONS
export const getCustomers = async () => {
  return apiCall('/api/customers');
};

export const createCustomer = async (customerData) => {
  return apiCall('/api/customers', {
    method: 'POST',
    body: customerData
  });
};

export const updateCustomer = async (id, customerData) => {
  return apiCall(`/api/customers/${id}`, {
    method: 'PUT',
    body: customerData
  });
};

export const deleteCustomer = async (id) => {
  return apiCall(`/api/customers/${id}`, {
    method: 'DELETE'
  });
};

// TOKEN HELPER FUNCTIONS
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};
