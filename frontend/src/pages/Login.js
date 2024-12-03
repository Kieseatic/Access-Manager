import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/login', formData);
            // Save token and role in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);

            alert('Login successful');

            // Redirect based on role
            if (response.data.role === 'Admin') {
                navigate('/admin'); // Redirect to Admin Panel
            } else {
                navigate('/dashboard'); // Redirect to Dashboard
            }
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ margin: '10px 0', padding: '10px', width: '100%' }}
                />
                <br />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ margin: '10px 0', padding: '10px', width: '100%' }}
                />
                <br />
                <button type="submit" style={{ padding: '10px 20px', marginTop: '10px' }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: '20px' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;
