import { api } from './api';

export interface User {
    id: number;
    fullName: string;
    email: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    fullName: string;
    email: string;
    password: string;
}

export interface UpdateProfileDTO {
    fullName: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
}

export const UserService = {
    login: (credentials: LoginCredentials) => api.post<User>('/users/login', credentials),
    register: (userData: RegisterCredentials) => api.post<User>('/users/save', userData),
    updateProfile: (id: number, data: UpdateProfileDTO) => api.put<User>(`/users/profile/${id}`, data)
};
