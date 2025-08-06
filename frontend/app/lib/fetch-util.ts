import axios from 'axios';

//This file is used to configure the axios instance for API requests.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api-v1';

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
      config.headers.Authorization = `Bearer ${token ?? ""}`; // Add token to Authorization header
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response, 
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            window.dispatchEvent(new Event('unauthorized'));
            break;
          case 500:
            console.error('Internal server error');
            break;
          case 404:
            console.error('Resource not found');
            break;
          default:
            console.error('An error occurred');
        }
      }
      return Promise.reject(error);
    }
  );

  const postData = async <T>(url: string, data: unknown): Promise<T> => {
    const response = await api.post(url, data);
    return response.data;
  };

  const fetchData = async <T>(url: string): Promise<T> => {
    const response = await api.get(url);
    return response.data;
  };

  const updateData = async <T>(url: string, data: unknown): Promise<T> => {
    const response = await api.put(url, data);
    return response.data;
  };

  const deleteData = async <T>(url: string): Promise<T> => {
    const response = await api.delete(url);
    return response.data;
  };

  export { api, postData, fetchData, updateData, deleteData };