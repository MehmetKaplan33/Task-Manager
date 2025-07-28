import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, LoginRounded } from '@mui/icons-material';
import { AxiosError } from 'axios';
import { UserService, type LoginCredentials } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { ErrorHandler } from '../utils/errorHandler';
import { useNotification } from '../contexts/NotificationContext';

// Error response interface tanımı
interface ErrorResponse {
    exception?: {
        message: string;
    };
    message?: string;
}

export interface LoginProps {
    setAuth: (value: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ setAuth }) => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Güvenli error handling için yardımcı fonksiyon
    const handleError = (error: unknown) => {
        if (error && typeof error === 'object' && 'isAxiosError' in error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
                const responseData = axiosError.response.data as ErrorResponse;
                if (responseData.exception?.message) {
                    return {
                        message: responseData.exception.message,
                        severity: 'error' as const
                    };
                }
            }
            return ErrorHandler.handle(axiosError);
        }
        // Genel error için fallback
        const fallbackError = new Error(
            error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
        ) as AxiosError;
        fallbackError.isAxiosError = false;
        fallbackError.toJSON = () => ({});
        return ErrorHandler.handle(fallbackError);
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            showNotification('E-posta alanı zorunludur', 'error');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Geçerli bir e-posta adresi giriniz', 'error');
            return false;
        }
        if (!formData.password) {
            showNotification('Şifre alanı zorunludur', 'error');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await UserService.login(formData);
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setAuth(true); // Authentication durumunu güncelle
                showNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
                navigate('/tasks');
            }
        } catch (error) {
            const errorResponse = handleError(error);
            showNotification(errorResponse.message, errorResponse.severity);
        } finally {
            setIsLoading(false);
        }
    };

    // Input field styling
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            transition: 'all 0.3s ease',
            '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                borderWidth: '1px',
            },
            '&:hover fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#3b82f6',
                borderWidth: '2px',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            },
            '&.Mui-disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(0, 0, 0, 0.6)',
            '&.Mui-focused': {
                color: '#3b82f6',
            },
        },
        '& .MuiInputAdornment-root': {
            '& .MuiSvgIcon-root': {
                color: 'rgba(0, 0, 0, 0.54)',
                transition: 'color 0.3s ease',
            },
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiInputAdornment-root .MuiSvgIcon-root': {
            color: '#3b82f6',
        },
    };

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #dbeafe 50%, #e0e7ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background elements */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '20%',
                    width: '320px',
                    height: '320px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'pulse 4s ease-in-out infinite'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '20%',
                    width: '280px',
                    height: '280px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                    borderRadius: '50%',
                    filter: 'blur(60px)',
                    animation: 'pulse 4s ease-in-out infinite 2s'
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px',
                    height: '200px',
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    animation: 'pulse 4s ease-in-out infinite 1s'
                }}></div>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '380px', zIndex: 10 }}>
                <Paper
                    elevation={0}
                    sx={{
                        padding: { xs: '1.5rem', sm: '2rem' },
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        width: '100%',
                        height: 'fit-content',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)',
                            borderRadius: '50%',
                            marginBottom: '1rem',
                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                        }}>
                            <LoginRounded sx={{ fontSize: 30, color: 'white' }} />
                        </div>
                        <Typography
                            variant="h4"
                            sx={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '1.5rem', sm: '1.8rem' },
                                fontWeight: 700,
                                margin: 0,
                                marginBottom: '0.3rem',
                            }}
                        >
                            Hoş Geldiniz
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: '0.9rem',
                                color: 'rgba(0, 0, 0, 0.6)',
                                margin: 0,
                            }}
                        >
                            Hesabınıza giriş yapın
                        </Typography>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <TextField
                            fullWidth
                            label="E-posta Adresi"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={isLoading}
                            required
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email sx={{ fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputSx}
                        />

                        <TextField
                            fullWidth
                            label="Şifre"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={isLoading}
                            required
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock sx={{ fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="şifre görünürlüğünü değiştir"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            disabled={isLoading}
                                            size="small"
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'rgba(59, 130, 246, 0.08)'
                                                }
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                ...inputSx,
                                // Material-UI'ın otomatik eklediği şifre göz ikonunu gizle
                                '& input[type="password"]::-webkit-textfield-decoration-container, & input[type="password"]::-webkit-contacts-auto-fill-button, & input[type="password"]::-webkit-credentials-auto-fill-button': {
                                    display: 'none !important',
                                    visibility: 'hidden !important'
                                },
                                '& input[type="password"]::-ms-reveal': {
                                    display: 'none !important'
                                }
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
                            sx={{
                                marginTop: '1rem',
                                py: 1.5,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #6366f1 100%)',
                                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 600,
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                    transition: 'left 0.5s',
                                },
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #4f46e5 100%)',
                                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.6)',
                                    transform: 'translateY(-2px)',
                                    '&::before': {
                                        left: '100%',
                                    },
                                },
                                '&:disabled': {
                                    background: 'rgba(0, 0, 0, 0.12)',
                                    boxShadow: 'none',
                                    transform: 'none',
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </Button>

                        <div style={{
                            textAlign: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                            marginTop: '0.5rem'
                        }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '0.9rem',
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    margin: 0,
                                    marginBottom: '0.5rem',
                                }}
                            >
                                Hesabınız yok mu?
                            </Typography>
                            <Button
                                variant="text"
                                onClick={() => navigate('/register')}
                                disabled={isLoading}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    color: '#3b82f6',
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: '8px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                Kayıt Olun
                            </Button>
                        </div>
                    </form>
                </Paper>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};