import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { Login } from './pages/Login';
import { TaskList } from './pages/TaskList';
import { UserProfile } from './pages/UserProfile';
import { Register } from './pages/Register';
import { NotificationProvider } from './contexts/NotificationContext';
import { useState, useEffect } from 'react';

const theme = createTheme();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  const setAuth = (value: boolean) => {
    setIsAuthenticated(value);
  };

  return (
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/tasks" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/tasks" />} />
            <Route path="/tasks" element={isAuthenticated ? <TaskList /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/tasks" : "/login"} />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
