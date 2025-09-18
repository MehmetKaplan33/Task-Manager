import axios from 'axios';

const API_BASE_URL = 'https://task-manager-production-075d.up.railway.app/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
