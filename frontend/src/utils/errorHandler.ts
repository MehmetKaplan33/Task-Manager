import { AxiosError } from 'axios';

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

interface ErrorResponse {
    message: string;
    severity: ErrorSeverity;
}

export class ErrorHandler {
    static handle(error: AxiosError): ErrorResponse {
        console.error('Error:', error);

        if (error.response?.data && typeof error.response.data === 'object') {
            const serverError = error.response.data as { message?: string };
            return {
                message: serverError.message || 'Bir hata oluştu',
                severity: 'error'
            };
        }

        return {
            message: 'Bir hata oluştu',
            severity: 'error'
        };
    }
}
