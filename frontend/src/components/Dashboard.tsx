import React, { useState } from 'react';
import type {Task} from '../services/taskService';
import { Paper, Typography, Box, IconButton, Menu, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { TaskService } from '../services/taskService';

interface DashboardProps {
  tasks: Task[];
  onTasksChange: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onTasksChange
}) => {
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({});
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

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
      case 'TO_DO': return 'Yapılacak';
      case 'IN_PROGRESS': return 'Devam Ediyor';
      case 'DONE': return 'Tamamlandı';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO_DO': return '#ef4444';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'DONE': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Günün başlangıcını al
    return tasks
      .filter(task => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0); // Görev tarihinin başlangıcını al
        return taskDate >= now; // Bugün ve sonrası
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  };

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Yaklaşan Görevler
      </Typography>
      <Box sx={{ flex: 1 }}>
        {getUpcomingTasks().map((task) => (
          <Box
            key={task.id}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              backgroundColor: `${getStatusColor(task.status)}10`,
              border: `1px solid ${getStatusColor(task.status)}20`,
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => handleStatusClick(e, task.id)}
                sx={{
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: getStatusColor(task.status) + '20',
                  }
                }}
              >
                <KeyboardArrowDownIcon fontSize="small" sx={{ color: getStatusColor(task.status) }} />
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
              <IconButton
                size="small"
                onClick={() => onEditTask(task)}
                sx={{
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  }
                }}
              >
                <EditIcon fontSize="small" sx={{ color: '#3b82f6' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDeleteTask(task.id)}
                sx={{
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  }
                }}
              >
                <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, pr: 4 }}>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {task.description}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
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
              <Typography variant="caption" color="text.secondary">
                {new Date(task.dueDate).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>
          </Box>
        ))}
        {getUpcomingTasks().length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Yaklaşan görev bulunmuyor
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Dashboard;
