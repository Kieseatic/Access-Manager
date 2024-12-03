import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        country: '',
        role: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Use environment variable for API URL
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

        setLoading(true); // Start loading spinner
        try {
            const response = await axios.post(`${API_BASE_URL}/register`, formData);
            alert(response.data.message || 'Registration successful!'); // Show backend success message
            setFormData({ name: '', email: '', password: '', country: '', role: '' }); // Reset form
        } catch (error) {
            console.error('Registration error:', error); // Log error to console
            if (error.response) {
                // Show specific backend error messages
                alert(`Error: ${error.response.data.message}`);
            } else if (error.request) {
                // Network errors (no response received)
                alert('Error: No response from server. Please check your connection.');
            } else {
                // Other unexpected errors
                alert('Unexpected error occurred');
            }
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ display: 'block', margin: '10px auto', width: '100%', padding: '8px' }}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ display: 'block', margin: '10px auto', width: '100%', padding: '8px' }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{ display: 'block', margin: '10px auto', width: '100%', padding: '8px' }}
                />
                <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    style={{ display: 'block', margin: '10px auto', width: '100%', padding: '8px' }}
                />
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    style={{ display: 'block', margin: '10px auto', width: '100%', padding: '8px' }}
                >
                    <option value="">Select Role</option>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
                <button
                    type="submit"
                    style={{
                        display: 'block',
                        margin: '20px auto',
                        padding: '10px 20px',
                        backgroundColor: 'blue',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                    disabled={loading}
                >
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};

export default Register;
