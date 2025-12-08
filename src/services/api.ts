// src/services/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-avivar.onrender.com/api', // O endereço do nosso Back-end
   // baseURL: 'http://localhost:3000/api',
});

// Interceptador: Toda vez que a gente chamar a API, ele já coloca o Token automaticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('avivar_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;