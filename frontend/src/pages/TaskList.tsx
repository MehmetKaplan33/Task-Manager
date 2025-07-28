import React, {useEffect, useState} from 'react';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Fade,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    Slide,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import {AxiosError} from 'axios';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {type Task, type TaskCreateDTO, TaskService} from '../services/taskService';
import {useNavigate} from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import {ErrorHandler} from '../utils/errorHandler';
import {useNotification} from '../contexts/NotificationContext';
import Calendar from '../components/Calendar';
import Dashboard from '../components/Dashboard';

// User interface tanımı
interface User {
    id: number;
    fullName: string;
    email?: string;
    username?: string;
}

// TaskForm'dan gelen veri tipi (userId olmadan)
interface TaskFormData {
    title: string;
    description: string;
    status: string;
    dueDate: string;
}

// Error response interface tanımı
interface ErrorResponse {
    exception?: {
        message: string;
    };
    message?: string;
}

export interface TaskListProps {
    setAuth?: (value: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({setAuth}) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
    const [showAllTasks, setShowAllTasks] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const navigate = useNavigate();
    const {showNotification} = useNotification();

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

        const userData = JSON.parse(userStr) as User;
        setUser(userData);
        fetchTasks();
    }, [navigate]);

    useEffect(() => {
        // Filtreleme mantığı
        let result = [...tasks];

        if (searchTerm) {
            result = result.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(task => task.status === statusFilter);
        }

        setFilteredTasks(result);
    }, [tasks, searchTerm, statusFilter]);

    const fetchTasks = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;

            const userData = JSON.parse(userStr) as User;
            setLoading(true);
            const response = await TaskService.getUserTasks(userData.id);
            setTasks(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            const errorResponse = handleError(error);
            showNotification(errorResponse.message, errorResponse.severity);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

        try {
            await TaskService.deleteTask(taskId);
            showNotification('Görev başarıyla silindi', 'success');
            fetchTasks();
        } catch (error) {
            const errorResponse = handleError(error);
            showNotification(errorResponse.message, errorResponse.severity);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        if (setAuth) {
            setAuth(false);
        }
        setUserMenuAnchor(null);
        navigate('/login');
    };

    const handleProfile = () => {
        setUserMenuAnchor(null);
        navigate('/profile');
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'TO_DO':
                return {
                    color: '#ef4444' as const,
                    bgColor: 'rgba(239, 68, 68, 0.1)',
                    icon: <RadioButtonUncheckedIcon sx={{fontSize: 16}}/>,
                    label: 'Yapılacak'
                };
            case 'IN_PROGRESS':
                return {
                    color: '#f59e0b' as const,
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    icon: <PendingActionsIcon sx={{fontSize: 16}}/>,
                    label: 'Devam Ediyor'
                };
            case 'DONE':
                return {
                    color: '#10b981' as const,
                    bgColor: 'rgba(16, 185, 129, 0.1)',
                    icon: <CheckCircleIcon sx={{fontSize: 16}}/>,
                    label: 'Tamamlandı'
                };
            default:
                return {
                    color: '#6b7280' as const,
                    bgColor: 'rgba(107, 114, 128, 0.1)',
                    icon: <RadioButtonUncheckedIcon sx={{fontSize: 16}}/>,
                    label: status
                };
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

    const handleEditTaskClick = (task: Task) => {
        setSelectedDate(new Date(task.dueDate));
        setIsFormOpen(true);
        setEditingTask(task);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleAddTaskFromCalendar = () => {
        setEditingTask(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTask(null);
    };

    const handleSubmitTask = async (taskData: TaskFormData) => {
        try {
            if (editingTask) {
                const updateDTO: TaskCreateDTO = {
                    ...taskData,
                    userId: editingTask.userId
                };
                await TaskService.updateTask(editingTask.id, updateDTO);
                showNotification('Görev başarıyla güncellendi', 'success');
            } else {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;

                const userData = JSON.parse(userStr) as User;
                const createDTO: TaskCreateDTO = {
                    ...taskData,
                    userId: userData.id
                };
                await TaskService.createTask(createDTO);
                showNotification('Görev başarıyla eklendi', 'success');
            }
            setIsFormOpen(false);
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            const errorResponse = handleError(error);
            showNotification(errorResponse.message, errorResponse.severity);
        }
    };

    const handleStatusClick = (event: React.MouseEvent<HTMLElement>, taskId: number) => {
        setStatusMenuAnchor({ ...statusMenuAnchor, [taskId]: event.currentTarget });
    };

    const handleStatusClose = (taskId: number) => {
        setStatusMenuAnchor({ ...statusMenuAnchor, [taskId]: null });
    };

    const handleQuickStatusChange = async (taskId: number, newStatus: string) => {
        try {
            setUpdatingTaskId(taskId);
            const taskToUpdate = tasks.find(t => t.id === taskId);
            if (!taskToUpdate) return;

            await TaskService.updateTask(taskId, { ...taskToUpdate, status: newStatus });
            showNotification('Görev durumu güncellendi', 'success');
            fetchTasks();
            handleStatusClose(taskId);
        } catch (error) {
            const errorResponse = handleError(error);
            showNotification(errorResponse.message, errorResponse.severity);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <CircularProgress
                        size={48}
                        sx={{
                            color: '#3b82f6',
                            mb: 2
                        }}
                    />
                    <Typography variant="body1" color="text.secondary">
                        Görevler yükleniyor...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <Box sx={{height: '100vh', display: 'flex', flexDirection: 'column'}}
             className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                <Toolbar sx={{px: {xs: 2, sm: 4}, py: 1}}>
                    {/* Logo Section */}
                    <Box sx={{display: 'flex', alignItems: 'center', flexGrow: 1}}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <AssignmentIcon sx={{color: 'white', fontSize: 22}}/>
                        </Box>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.25rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Task Manager
                        </Typography>
                    </Box>

                    {/* User Section */}
                    {user && (
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            {/* User Info Button */}
                            <Button
                                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 1,
                                    borderRadius: '16px',
                                    textTransform: 'none',
                                    color: '#1f2937',
                                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                    border: '1px solid rgba(59, 130, 246, 0.1)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        borderColor: 'rgba(59, 130, 246, 0.2)',
                                        transform: 'translateY(-1px)',
                                    },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}
                                >
                                    {getInitials(user.fullName || 'U')}
                                </Avatar>
                                <Box sx={{textAlign: 'left', display: {xs: 'none', sm: 'block'}}}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            lineHeight: 1,
                                            mb: 0.2
                                        }}
                                    >
                                        {user.fullName}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'rgba(0, 0, 0, 0.6)',
                                            lineHeight: 1
                                        }}
                                    >
                                        {user.email}
                                    </Typography>
                                </Box>
                                <KeyboardArrowDownIcon
                                    sx={{
                                        fontSize: 18,
                                        color: 'rgba(0, 0, 0, 0.6)',
                                        ml: {xs: 0, sm: 0.5}
                                    }}
                                />
                            </Button>

                            {/* User Menu */}
                            <Menu
                                anchorEl={userMenuAnchor}
                                open={Boolean(userMenuAnchor)}
                                onClose={() => setUserMenuAnchor(null)}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                        borderRadius: '16px',
                                        minWidth: 200,
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                    }
                                }}
                                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                            >
                                <Box sx={{px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)'}}>
                                    <Typography variant="body2" sx={{fontWeight: 600}}>
                                        {user.fullName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </Box>

                                <MenuItem
                                    onClick={handleProfile}
                                    sx={{
                                        py: 1.5,
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <PersonIcon sx={{fontSize: 20, color: '#3b82f6'}}/>
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body2" sx={{fontWeight: 500}}>
                                            Profil Ayarları
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>

                                <Divider sx={{my: 0.5}}/>

                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{
                                        py: 1.5,
                                        px: 2,
                                        '&:hover': {
                                            backgroundColor: 'rgba(220, 38, 38, 0.08)',
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <LogoutIcon sx={{fontSize: 20, color: '#dc2626'}}/>
                                    </ListItemIcon>
                                    <ListItemText>
                                        <Typography variant="body2" sx={{fontWeight: 500, color: '#dc2626'}}>
                                            Çıkış Yap
                                        </Typography>
                                    </ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Box sx={{flex: 1, p: 3, overflowY: 'auto'}} className="relative z-10">
                {/* Search and Filter Section */}
                <Fade in timeout={600}>
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <TextField
                                label="Görev Ara"
                                variant="outlined"
                                size="small"
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{color: 'rgba(0, 0, 0, 0.54)'}}/>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover fieldset': {
                                            borderColor: '#3b82f6',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#3b82f6',
                                            borderWidth: '2px',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#3b82f6',
                                    },
                                }}
                            />

                            <FormControl size="small" sx={{minWidth: 150}}>
                                <InputLabel>Durum Filtresi</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Durum Filtresi"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <FilterListIcon sx={{color: 'rgba(0, 0, 0, 0.54)', fontSize: 20}}/>
                                        </InputAdornment>
                                    }
                                    sx={{
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#3b82f6',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#3b82f6',
                                            borderWidth: '2px',
                                        },
                                    }}
                                >
                                    <MenuItem value="all">Tümü</MenuItem>
                                    <MenuItem value="TO_DO">Yapılacak</MenuItem>
                                    <MenuItem value="IN_PROGRESS">Devam Ediyor</MenuItem>
                                    <MenuItem value="DONE">Tamamlandı</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={() => setIsFormOpen(true)}
                                sx={{
                                    py: 1,
                                    px: 3,
                                    borderRadius: '12px',
                                    color: 'white',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                        boxShadow: '0 12px 35px rgba(59, 130, 246, 0.6)',
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Yeni Görev
                            </Button>
                        </div>
                    </Paper>
                </Fade>

                {/* Task Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        {status: 'TO_DO', count: tasks.filter(t => t.status === 'TO_DO').length},
                        {status: 'IN_PROGRESS', count: tasks.filter(t => t.status === 'IN_PROGRESS').length},
                        {status: 'DONE', count: tasks.filter(t => t.status === 'DONE').length}
                    ].map((stat, index) => {
                        const config = getStatusConfig(stat.status);
                        return (
                            <Slide key={stat.status} direction="up" in timeout={800 + index * 200}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${config.bgColor}, rgba(255, 255, 255, 0.9))`,
                                        border: `1px solid ${config.color}20`,
                                        textAlign: 'center',
                                    }}
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <div style={{color: config.color}}>
                                            {config.icon}
                                        </div>
                                    </div>
                                    <Typography variant="h4" sx={{fontWeight: 700, color: config.color, mb: 0.5}}>
                                        {stat.count}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {config.label}
                                    </Typography>
                                </Paper>
                            </Slide>
                        );
                    })}
                </div>

                {/* Task List or Calendar/Dashboard */}
                <Fade in timeout={1000}>
                    <Paper
                        sx={{
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Takvim ve Dashboard Bölümü */}
                        <Box sx={{p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.06)'}}>
                            <Box sx={{display: 'flex', gap: 3, flexDirection: {xs: 'column', lg: 'row'}}}>
                                <Box sx={{flex: 2}}>
                                    <Calendar
                                        tasks={statusFilter === 'all' ? tasks : filteredTasks}
                                        onTasksChange={fetchTasks}
                                        onAddTask={handleAddTaskFromCalendar}
                                        onEditTask={handleEditTaskClick}
                                        onDeleteTask={handleDeleteTask}
                                        isFormOpen={isFormOpen}
                                        selectedDate={selectedDate}
                                        onDateSelect={handleDateSelect}
                                    />
                                </Box>
                                <Box sx={{flex: 1}}>
                                    <Dashboard
                                        tasks={statusFilter === 'all' ? tasks : filteredTasks}
                                        onTasksChange={fetchTasks}
                                        onEditTask={handleEditTaskClick}
                                        onDeleteTask={handleDeleteTask}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Görev Kartları Bölümü */}
                        <Box sx={{p: 3}}>
                            <Typography variant="h6" sx={{mb: 3, fontWeight: 600, color: '#1f2937'}}>
                                Tüm Görevler
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredTasks.slice(0, showAllTasks ? undefined : 6).map((task, index) => {
                                    const statusConfig = getStatusConfig(task.status);
                                    return (
                                        <Slide key={task.id} direction="up" in timeout={300 + index * 100}>
                                            <Card
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    position: 'relative',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(0, 0, 0, 0.08)',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                                    transition: 'all 0.3s ease',
                                                    overflow: 'visible',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                                                    },
                                                    '&:before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: '4px',
                                                        backgroundColor: statusConfig.color,
                                                        borderRadius: '16px 16px 0 0',
                                                    }
                                                }}
                                            >
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    display: 'flex',
                                                    gap: 1
                                                }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setEditingTask(task);
                                                            setIsFormOpen(true);
                                                        }}
                                                        sx={{
                                                            backgroundColor: 'white',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" sx={{color: '#3b82f6'}}/>
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        sx={{
                                                            backgroundColor: 'white',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" sx={{color: '#ef4444'}}/>
                                                    </IconButton>
                                                </Box>

                                                <CardContent sx={{p: 3, flex: 1}}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#1f2937',
                                                            mb: 2,
                                                            pr: 8
                                                        }}
                                                    >
                                                        {task.title}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mb: 3,
                                                            lineHeight: 1.6,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {task.description}
                                                    </Typography>

                                                    <Box sx={{mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap'}}>
                                                        {/* Task Card Status Chip */}
                                                        <Chip
                                                            icon={statusConfig.icon}
                                                            label={statusConfig.label}
                                                            onClick={(e) => handleStatusClick(e, task.id)}
                                                            sx={{
                                                                backgroundColor: `${statusConfig.color}15`,
                                                                color: statusConfig.color,
                                                                fontWeight: 500,
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    backgroundColor: `${statusConfig.color}25`,
                                                                },
                                                                '& .MuiChip-icon': {
                                                                    color: statusConfig.color
                                                                }
                                                            }}
                                                        />

                                                        {/* Status Menu */}
                                                        <Menu
                                                            anchorEl={statusMenuAnchor[task.id]}
                                                            open={Boolean(statusMenuAnchor[task.id])}
                                                            onClose={() => handleStatusClose(task.id)}
                                                            PaperProps={{
                                                                sx: {
                                                                    mt: 1,
                                                                    borderRadius: '12px',
                                                                    minWidth: 180,
                                                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                                                }
                                                            }}
                                                        >
                                                            <MenuItem
                                                                onClick={() => handleQuickStatusChange(task.id, 'TO_DO')}
                                                                disabled={updatingTaskId === task.id}
                                                            >
                                                                <ListItemIcon>
                                                                    <RadioButtonUncheckedIcon sx={{ color: '#ef4444' }} />
                                                                </ListItemIcon>
                                                                <ListItemText>Yapılacak</ListItemText>
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => handleQuickStatusChange(task.id, 'IN_PROGRESS')}
                                                                disabled={updatingTaskId === task.id}
                                                            >
                                                                <ListItemIcon>
                                                                    <PendingActionsIcon sx={{ color: '#f59e0b' }} />
                                                                </ListItemIcon>
                                                                <ListItemText>Devam Ediyor</ListItemText>
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => handleQuickStatusChange(task.id, 'DONE')}
                                                                disabled={updatingTaskId === task.id}
                                                            >
                                                                <ListItemIcon>
                                                                    <CheckCircleIcon sx={{ color: '#10b981' }} />
                                                                </ListItemIcon>
                                                                <ListItemText>Tamamlandı</ListItemText>
                                                            </MenuItem>
                                                        </Menu>

                                                        {task.dueDate && (
                                                            <Chip
                                                                icon={<CalendarTodayIcon sx={{fontSize: 16}}/>}
                                                                label={new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    borderColor: 'rgba(0, 0, 0, 0.12)',
                                                                    color: 'rgba(0, 0, 0, 0.6)',
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Slide>
                                    );
                                })}
                            </div>

                            {filteredTasks.length > 6 && (
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowAllTasks(!showAllTasks)}
                                        sx={{
                                            borderRadius: '12px',
                                            borderColor: '#3b82f6',
                                            color: '#3b82f6',
                                            '&:hover': {
                                                borderColor: '#2563eb',
                                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                            },
                                        }}
                                    >
                                        {showAllTasks ? 'Daha Az Göster' : 'Tümünü Göster'}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Fade>

                {/* Task Form Dialog */}
                <TaskForm
                    open={isFormOpen}
                    onClose={handleCloseForm}
                    onSubmit={handleSubmitTask}
                    initialData={editingTask || undefined}
                    mode={editingTask ? 'edit' : 'add'}
                    selectedDate={selectedDate}
                />
            </Box>
        </Box>
    );
};
