import axios from 'axios';

// Railway backend URL'nizi kullanın
const API_BASE_URL = 'https://task-manager-production-8021.up.railway.app/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});