import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './components/adminPanel';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    // Check if the user is authenticated
    const isAuthenticated = !!localStorage.getItem('token'); 
    // Retrieve user role from localStorage
    const userRole = localStorage.getItem('role'); 

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated ? (
                            <Dashboard />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Admin-Only Route */}
                <Route
                    path="/admin"
                    element={
                        isAuthenticated && userRole === 'Admin' ? (
                            <AdminPanel />
                        ) : (
                            <Navigate to="/dashboard" replace />
                        )
                    }
                />

                {/* Catch-All Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
