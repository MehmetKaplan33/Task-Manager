import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    AppBar,
    Toolbar,
    Divider,
    IconButton,
    CircularProgress,
    InputAdornment,
    Avatar,
    Fade,
    Slide,
    Switch,
    FormControlLabel
} from '@mui/material';
import { AxiosError } from 'axios';
import { UserService, type User, type UpdateProfileDTO } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SecurityIcon from '@mui/icons-material/Security';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ErrorHandler } from '../utils/errorHandler';
import { useNotification } from '../contexts/NotificationContext';

// Error response interface tanımı
interface ErrorResponse {
    exception?: {
        message: string;
    };
    message?: string;
}

export const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });

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

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);
        setFormData({
            fullName: userData.fullName || '',
            email: userData.email || '',
            currentPassword: '',
            newPassword: ''
        });
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            const updateData: UpdateProfileDTO = {
                fullName: formData.fullName,
                email: formData.email
            };

            if (showPasswordFields) {
                if (!formData.currentPassword || !formData.newPassword) {
                    showNotification('Şifre alanları boş bırakılamaz', 'error');
                    return;
                }
                if (formData.newPassword.length < 6) {
                    showNotification('Yeni şifre en az 6 karakter olmalıdır', 'error');
                    return;
                }
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await UserService.updateProfile(user.id, updateData);
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
            showNotification('Profil başarıyla güncellendi', 'success');

            if (showPasswordFields) {
                setShowPasswordFields(false);
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: ''
                }));
            }
        } catch (error) {
            const errorResponse = handleError(error);
            showNotification(errorResponse.message, errorResponse.severity);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (fullName: string) => {
        return fullName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
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

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Modern AppBar */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#1f2937'
                }}
            >
                <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
                    <IconButton
                        edge="start"
                        onClick={() => navigate('/tasks')}
                        sx={{
                            mr: 2,
                            color: '#3b82f6',
                            '&:hover': {
                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                            <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                        </div>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                flexGrow: 1
                            }}
                        >
                            Profil Düzenle
                        </Typography>
                    </div>
                </Toolbar>
            </AppBar>

            <div className="relative z-10 p-4 max-w-2xl mx-auto">
                <Fade in timeout={600}>
                    <Paper
                        sx={{
                            borderRadius: '24px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Profile Header */}
                        <div style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, rgb(239 246 255) 0%, rgb(238 242 255) 100%)' }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    margin: '0 auto 1rem auto',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                                }}
                            >
                                {getInitials(user.fullName || 'U')}
                            </Avatar>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    mb: '0.5rem'
                                }}
                            >
                                {user.fullName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                {user.email}
                            </Typography>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            {/* Personal Information Section */}
                            <Slide direction="up" in timeout={800}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                        <AccountCircleIcon sx={{ color: '#3b82f6', mr: 2 }} />
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1f2937'
                                            }}
                                        >
                                            Kişisel Bilgiler
                                        </Typography>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <TextField
                                            fullWidth
                                            label="Ad Soyad"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            required
                                            disabled={loading}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon sx={{ fontSize: 20 }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={inputSx}
                                        />

                                        <TextField
                                            fullWidth
                                            label="E-posta Adresi"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            disabled={loading}
                                            size="small"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon sx={{ fontSize: 20 }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={inputSx}
                                        />
                                    </div>
                                </div>
                            </Slide>

                            {/* Security Section */}
                            <Slide direction="up" in timeout={1000}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <Divider sx={{ my: 2, opacity: 0.5 }} />

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <SecurityIcon sx={{ color: '#3b82f6', mr: 2 }} />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: '#1f2937'
                                                }}
                                            >
                                                Güvenlik
                                            </Typography>
                                        </div>

                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={showPasswordFields}
                                                    onChange={(e) => setShowPasswordFields(e.target.checked)}
                                                    disabled={loading}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: '#3b82f6',
                                                        },
                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                            backgroundColor: '#3b82f6',
                                                        },
                                                    }}
                                                />
                                            }
                                            label="Şifreyi Değiştir"
                                            sx={{
                                                '& .MuiFormControlLabel-label': {
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    color: 'rgba(0, 0, 0, 0.7)'
                                                }
                                            }}
                                        />
                                    </div>

                                    {showPasswordFields && (
                                        <Fade in timeout={400}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <TextField
                                                    fullWidth
                                                    label="Mevcut Şifre"
                                                    type="password"
                                                    value={formData.currentPassword}
                                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                    disabled={loading}
                                                    size="small"
                                                    helperText="Güvenlik için mevcut şifrenizi giriniz"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LockIcon sx={{ fontSize: 20 }} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={inputSx}
                                                />

                                                <TextField
                                                    fullWidth
                                                    label="Yeni Şifre"
                                                    type="password"
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                    disabled={loading}
                                                    size="small"
                                                    helperText="En az 6 karakter olmalıdır"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LockIcon sx={{ fontSize: 20 }} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={inputSx}
                                                />
                                            </div>
                                        </Fade>
                                    )}
                                </div>
                            </Slide>

                            {/* Action Buttons */}
                            <Slide direction="up" in timeout={1200}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'row' }}>
                                        <Button
                                            type="button"
                                            onClick={() => navigate('/tasks')}
                                            disabled={loading}
                                            startIcon={<CancelIcon />}
                                            sx={{
                                                flex: 1,
                                                py: 1.5,
                                                borderRadius: '12px',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                color: '#6b7280',
                                                border: '2px solid rgba(107, 114, 128, 0.2)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(107, 114, 128, 0.08)',
                                                    borderColor: 'rgba(107, 114, 128, 0.3)',
                                                },
                                                transition: 'all 0.3s ease',
                                                '@media (max-width: 600px)': {
                                                    fontSize: '0.9rem'
                                                }
                                            }}
                                        >
                                            İptal
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                                            sx={{
                                                flex: 1,
                                                py: 1.5,
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.6)',
                                                    transform: 'translateY(-2px)',
                                                },
                                                '&:disabled': {
                                                    background: 'rgba(0, 0, 0, 0.12)',
                                                    boxShadow: 'none',
                                                    transform: 'none',
                                                },
                                                transition: 'all 0.3s ease',
                                                '@media (max-width: 600px)': {
                                                    fontSize: '0.9rem'
                                                }
                                            }}
                                        >
                                            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                        </Button>
                                    </div>
                                </div>
                            </Slide>
                        </form>
                    </Paper>
                </Fade>
            </div>
        </div>
    );
};