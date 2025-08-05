import axios from 'axios';
import { error } from 'console';
import { T } from 'node_modules/react-router/dist/development/index-react-server-client-KLg-U4nr.mjs';

// This file is used to configure the axios instance for API requests.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api-v1';

// Create an axios instance with the base URL and default headers
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export the axios instance for use in other parts of the application
api.interceptors.request.use(
  (config) => {
    // Add authorization token to headers if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add the token to the Authorization header
    }
    return config;
  });

  api.interceptors.response.use(
  (response) => response, (error) => {
    // Handle errors globally
    if (error.response && error.response.status === 401) {
      window.dispatchEvent(new Event('unauthorized')); // Dispatch an event for unauthorized access
    }
    return Promise.reject(error); // Reject the promise with the error
  });

  const postData = async <T>(path: string, data: unknown): Promise<T> => {
    const response = await api.post(path, data);
    return response.data;
  };

  const fetchData = async <T>(path: string): Promise<T> => {
    const response = await api.post(path);
    return response.data;
  };

  const updateData = async <T>(path: string, data: unknown): Promise<T> => {
    const response = await api.put(path);
    return response.data;
  };

  const deleteData = async <T>(path: string): Promise<T> => {
    const response = await api.delete(path);
    return response.data;
  };

  export { api, postData, fetchData, updateData, deleteData };