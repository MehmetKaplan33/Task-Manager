import axios from 'axios';

// Railway backend URL'nizi kullanın
const API_BASE_URL = 'task-manager-production-dff2.up.railway.app';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
