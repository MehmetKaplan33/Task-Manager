import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Slide,
    TextField,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Assignment as AssignmentIcon,
    Close as CloseIcon,
    Description as DescriptionIcon,
    Edit as EditIcon,
    Title as TitleIcon
} from '@mui/icons-material';
import type {TransitionProps} from '@mui/material/transitions';
import type {Task} from '../services/taskService';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

// TaskForm için özel bir tip tanımlıyoruz (userId olmadan)
interface TaskFormData {
    title: string;
    description: string;
    status: string;
    dueDate: string;
}

interface TaskFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (task: TaskFormData) => void;
    initialData?: Task;
    mode?: 'add' | 'edit';
    selectedDate?: Date | null;
}

// Transition props interface tanımı
interface TransitionComponentProps extends TransitionProps {
    children: React.ReactElement;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionComponentProps,
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TaskForm: React.FC<TaskFormProps> = ({open, onClose, onSubmit, initialData, mode = 'add', selectedDate}) => {
    const [formData, setFormData] = useState<TaskFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        status: initialData?.status || 'TO_DO',
        dueDate: initialData?.dueDate?.split('T')[0] || ''
    });

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        dueDate: ''
    });

    // initialData değiştiğinde form verilerini güncelle
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                status: initialData.status || 'TO_DO',
                dueDate: initialData.dueDate?.split('T')[0] || ''
            });
        } else {
            // Yeni görev eklerken form'u temizle
            setFormData({
                title: '',
                description: '',
                status: 'TO_DO',
                dueDate: selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : ''
            });
        }
        // Hataları da temizle
        setErrors({
            title: '',
            description: '',
            dueDate: ''
        });
    }, [initialData, open, selectedDate]);

    const validateForm = () => {
        const newErrors = {
            title: '',
            description: '',
            dueDate: ''
        };

        if (!formData.title.trim()) {
            newErrors.title = 'Başlık alanı zorunludur';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Başlık en az 3 karakter olmalıdır';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Açıklama alanı zorunludur';
        }

        if (!formData.dueDate) {
            newErrors.dueDate = 'Bitiş tarihi zorunludur';
        } else {
            const selectedDate = new Date(formData.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                newErrors.dueDate = 'Bitiş tarihi bugünden önce olamaz';
            }
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

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
            '&.Mui-error fieldset': {
                borderColor: '#ef4444',
                borderWidth: '2px',
            },
            '&.Mui-error:hover fieldset': {
                borderColor: '#dc2626',
            },
            '&.Mui-error.Mui-focused fieldset': {
                borderColor: '#dc2626',
                boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(0, 0, 0, 0.6)',
            '&.Mui-focused': {
                color: '#3b82f6',
            },
            '&.Mui-error': {
                color: '#ef4444',
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
        '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginLeft: '8px',
        },
    };

    const selectSx = {
        ...inputSx,
        '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'TO_DO':
                return '#ef4444';
            case 'IN_PROGRESS':
                return '#f59e0b';
            case 'DONE':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'TO_DO':
                return '📋';
            case 'IN_PROGRESS':
                return '⏳';
            case 'DONE':
                return '✅';
            default:
                return '📋';
        }
    };

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={onClose}
            aria-describedby="alert-dialog-slide-description"
            maxWidth="sm"
            fullWidth
        >
            {/* Custom Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, rgb(239 246 255) 0%, rgb(238 242 255) 100%)',
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                        }}>
                            {mode === 'add' ?
                                <AddIcon sx={{color: 'white', fontSize: 24}}/> :
                                <EditIcon sx={{color: 'white', fontSize: 24}}/>
                            }
                        </div>
                        <div>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: '#1f2937',
                                    fontSize: '1.25rem',
                                    margin: 0,
                                }}
                            >
                                {mode === 'add' ? 'Yeni Görev Ekle' : 'Görevi Düzenle'}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(0, 0, 0, 0.6)',
                                    fontSize: '0.875rem',
                                    margin: 0,
                                }}
                            >
                                {mode === 'add' ? 'Yeni bir görev oluşturun' : 'Görev bilgilerini düzenleyin'}
                            </Typography>
                        </div>
                    </div>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: 'rgba(0, 0, 0, 0.6)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            }
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </div>
            </Box>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{padding: '2rem', paddingTop: '1.5rem'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        <TextField
                            fullWidth
                            label="Görev Başlığı"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            error={!!errors.title}
                            helperText={errors.title}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <TitleIcon sx={{fontSize: 20}}/>
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputSx}
                        />

                        <TextField
                            fullWidth
                            label="Açıklama"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            multiline
                            rows={3}
                            error={!!errors.description}
                            helperText={errors.description}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{alignSelf: 'flex-start', marginTop: '8px'}}>
                                        <DescriptionIcon sx={{fontSize: 20}}/>
                                    </InputAdornment>
                                ),
                            }}
                            sx={inputSx}
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel sx={{color: 'rgba(0, 0, 0, 0.6)'}}>Durum</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                label="Durum"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <AssignmentIcon sx={{fontSize: 20, color: 'rgba(0, 0, 0, 0.54)'}}/>
                                    </InputAdornment>
                                }
                                sx={selectSx}
                            >
                                <MenuItem value="TO_DO">
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span>{getStatusIcon('TO_DO')}</span>
                                        <span>Yapılacak</span>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor('TO_DO'),
                                            marginLeft: 'auto'
                                        }}></div>
                                    </div>
                                </MenuItem>
                                <MenuItem value="IN_PROGRESS">
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span>{getStatusIcon('IN_PROGRESS')}</span>
                                        <span>Devam Ediyor</span>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor('IN_PROGRESS'),
                                            marginLeft: 'auto'
                                        }}></div>
                                    </div>
                                </MenuItem>
                                <MenuItem value="DONE">
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <span>{getStatusIcon('DONE')}</span>
                                        <span>Tamamlandı</span>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: getStatusColor('DONE'),
                                            marginLeft: 'auto'
                                        }}></div>
                                    </div>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
                            <DatePicker
                                label="Bitiş Tarihi"
                                value={formData.dueDate ? dayjs(formData.dueDate) : null}
                                onChange={(newValue) => {
                                    setFormData({
                                        ...formData,
                                        dueDate: newValue ? newValue.format('YYYY-MM-DD') : ''
                                    });
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: 'normal',
                                        error: !!errors.dueDate,
                                        helperText: errors.dueDate
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </div>
                </DialogContent>

                <DialogActions sx={{
                    padding: '1.5rem 2rem 2rem 2rem',
                    gap: '0.75rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                }}>
                    <Button
                        onClick={onClose}
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
                        }}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={mode === 'add' ? <AddIcon/> : <EditIcon/>}
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
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {mode === 'add' ? 'Görevi Ekle' : 'Değişiklikleri Kaydet'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default TaskForm;
