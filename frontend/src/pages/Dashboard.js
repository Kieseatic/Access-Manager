import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminPanel from '../components/adminPanel'; // Import Admin Panel component
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [statistics, setStatistics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const userResponse = await axios.get('http://localhost:8080/user-data', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserData(userResponse.data);

                // Fetch statistics only for non-admin users
                if (userResponse.data.role === 'User') {
                    const statsResponse = await axios.get('http://localhost:8080/statistics', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const stats = statsResponse.data.map((stat) => ({
                        role: stat.role,
                        count: parseInt(stat.count, 10), // Convert count to number
                    }));
                    setStatistics(stats);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    // Prepare chart data for non-admin users
    const chartData = {
        labels: statistics.map((stat) => stat.role), // X-axis labels
        datasets: [
            {
                label: 'Number of Users',
                data: statistics.map((stat) => stat.count), // Y-axis data
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'User Role Statistics',
            },
        },
    };

    return (
        <div>
            <h1>Welcome, {userData?.name}</h1>
            <h2>Your Role: {userData?.role}</h2>

            {userData?.role === 'Admin' ? (
                // Render Admin Panel if role is Admin
                <AdminPanel />
            ) : (
                // Render User Dashboard for non-admin users
                <div>
                    <h2>Statistics</h2>
                    {statistics.length > 0 ? (
                        <Bar data={chartData} options={chartOptions} />
                    ) : (
                        <p>No statistics available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
