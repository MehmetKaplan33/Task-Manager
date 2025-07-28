import { api } from './api';

export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    userId: number;
}

export interface TaskCreateDTO {
    title: string;
    description: string;
    status: string;
    dueDate: string;
    userId: number;
}

export const TaskService = {
    getUserTasks: (userId: number) => api.get<Task[]>(`/tasks/user/${userId}`),
    createTask: (task: TaskCreateDTO) => api.post<Task>('/tasks/save', task),
    updateTask: (id: number, task: TaskCreateDTO) => api.put<Task>(`/tasks/update/${id}`, task),
    deleteTask: (id: number) => api.delete(`/tasks/delete/${id}`)
};
