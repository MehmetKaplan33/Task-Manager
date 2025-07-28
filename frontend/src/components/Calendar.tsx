import React, {useState} from 'react';
import {
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    getDay,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek
} from 'date-fns';
import {tr} from 'date-fns/locale';
import type {Task} from '../services/taskService';
import {Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Typography, Menu, MenuItem} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {TaskService} from '../services/taskService';

interface CalendarProps {
    tasks: Task[];
    onTasksChange: () => void;
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskId: number) => void;
    isFormOpen: boolean;
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
                                               tasks,
                                               onAddTask,
                                               onEditTask,
                                               onDeleteTask,
                                               selectedDate,
                                               onDateSelect,
                                               onTasksChange
                                           }) => {
    const [showDayTasks, setShowDayTasks] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

    const getDaysInMonth = (date: Date) => {
        const start = startOfWeek(startOfMonth(date), {locale: tr});
        const end = endOfWeek(endOfMonth(date), {locale: tr});
        const days = eachDayOfInterval({start, end});

        const weeks: Date[][] = [];
        let currentWeek: Date[] = [];

        days.forEach(day => {
            if (currentWeek.length > 0 && getDay(day) === 1) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push(day);
        });

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    };

    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return isSameDay(taskDate, date);
        });
    };

    const handleDayClick = (date: Date) => {
        onDateSelect(date);
        setShowDayTasks(true);
    };

    const handleAddClick = () => {
        onAddTask();
        setShowDayTasks(false);
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
            onTasksChange();
            handleStatusClose(taskId);
        } catch (error) {
            console.error('Error updating task status:', error);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'TO_DO':
                return 'Yapılacak';
            case 'IN_PROGRESS':
                return 'Devam Ediyor';
            case 'DONE':
                return 'Tamamlandı';
            default:
                return status;
        }
    };

    const weeks = getDaysInMonth(currentDate);

    return (
        <>
            <Paper sx={{p: 3}}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        &lt;
                    </button>
                    <Typography variant="h6" sx={{fontWeight: 600}}>
                        {format(currentDate, 'MMMM yyyy', {locale: tr})}
                    </Typography>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        &gt;
                    </button>
                </Box>
                <div className="grid grid-cols-7 gap-1">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                            {day}
                        </div>
                    ))}
                    {weeks.map((week) =>
                        week.map((day) => {
                            const dayTasks = getTasksForDay(day);
                            return (
                                <div
                                    key={day.toString()}
                                    className={`
                    p-2 min-h-[80px] border rounded-lg cursor-pointer hover:bg-gray-50
                    ${!isSameMonth(day, currentDate) ? 'text-gray-400 bg-gray-50' : ''}
                  `}
                                    onClick={() => handleDayClick(day)}
                                >
                                    <div className="text-right">{format(day, 'd')}</div>
                                    {dayTasks.length > 0 && (
                    <div className="mt-1">
                        {dayTasks.length > 2 ? (
                            <div
                                className="text-xs p-1 mb-1 rounded text-center font-medium"
                                style={{backgroundColor: '#3b82f620', color: '#3b82f6'}}
                            >
                                {dayTasks.length} Görev
                            </div>
                        ) : (
                            dayTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="text-xs p-1 mb-1 rounded"
                                    style={{backgroundColor: getStatusColor(task.status) + '20'}}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="truncate">{task.title}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
                                </div>
                            );
                        })
                    )}
                </div>
            </Paper>

            <Dialog
                open={showDayTasks}
                onClose={() => setShowDayTasks(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        display="flex"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        gap={{ xs: 2, sm: 0 }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                {selectedDate && format(selectedDate, 'd MMMM yyyy', {locale: tr})}
                            </Typography>
                            <IconButton
                                onClick={() => setShowDayTasks(false)}
                                sx={{
                                    display: { xs: 'flex', sm: 'none' },
                                    ml: 1
                                }}
                            >
                                <CloseIcon/>
                            </IconButton>
                        </Box>
                        <Box display="flex" gap={1} justifyContent={{ xs: 'stretch', sm: 'flex-end' }}>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={handleAddClick}
                                sx={{
                                    py: 1,
                                    px: 3,
                                    width: { xs: '100%', sm: 'auto' },
                                    borderRadius: '12px',
                                    color: 'white',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    '& .MuiSvgIcon-root': {
                                        color: 'white'
                                    },
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
                            <IconButton
                                onClick={() => setShowDayTasks(false)}
                                sx={{
                                    display: { xs: 'none', sm: 'flex' }
                                }}
                            >
                                <CloseIcon/>
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedDate && getTasksForDay(selectedDate).map(task => (
                        <Box
                            key={task.id}
                            sx={{
                                p: 2,
                                mb: 1,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                                '&:hover': {bgcolor: 'action.hover'}
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1">{task.title}</Typography>
                                <Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            onEditTask(task);
                                            setShowDayTasks(false);
                                        }}
                                        sx={{mr: 1}}
                                    >
                                        <EditIcon fontSize="small"/>
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            onDeleteTask(task.id);
                                            setShowDayTasks(false);
                                        }}
                                        color="error"
                                    >
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {task.description}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: getStatusColor(task.status),
                                        bgcolor: getStatusColor(task.status) + '20',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}
                                >
                                    {getStatusLabel(task.status)}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleStatusClick(e, task.id)}
                                    sx={{
                                        p: 0.5,
                                        bgcolor: getStatusColor(task.status) + '10',
                                        '&:hover': {
                                            bgcolor: getStatusColor(task.status) + '20',
                                        }
                                    }}
                                >
                                    <KeyboardArrowDownIcon
                                        fontSize="small"
                                        sx={{
                                            color: getStatusColor(task.status),
                                            fontSize: '1.2rem'
                                        }}
                                    />
                                </IconButton>
                                <Menu
                                    anchorEl={statusMenuAnchor[task.id]}
                                    open={Boolean(statusMenuAnchor[task.id])}
                                    onClose={() => handleStatusClose(task.id)}
                                    PaperProps={{
                                        sx: {
                                            mt: 0.5,
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                            borderRadius: '12px',
                                            minWidth: '150px'
                                        }
                                    }}
                                >
                                    {['TO_DO', 'IN_PROGRESS', 'DONE'].map(status => (
                                        <MenuItem
                                            key={status}
                                            onClick={() => handleQuickStatusChange(task.id, status)}
                                            disabled={updatingTaskId === task.id}
                                            sx={{
                                                py: 1,
                                                px: 2,
                                                mx: 1,
                                                my: 0.5,
                                                borderRadius: '8px',
                                                '&:hover': {
                                                    bgcolor: getStatusColor(status) + '10',
                                                },
                                                ...(task.status === status && {
                                                    bgcolor: getStatusColor(status) + '20',
                                                    color: getStatusColor(status),
                                                    fontWeight: 600
                                                })
                                            }}
                                        >
                                            {getStatusLabel(status)}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        </Box>
                    ))}
                    {selectedDate && getTasksForDay(selectedDate).length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', mt: 2}}>
                            Bu güne ait görev bulunmuyor
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Calendar;
