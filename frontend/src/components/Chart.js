import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Chart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/statistics`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token for secured endpoints
                    },
                });
                setData(response.data.map((stat) => ({ role: stat.role, count: parseInt(stat.count, 10) }))); // Normalize data
            } catch (error) {
                console.error("Error fetching statistics:", error);
                alert("Failed to fetch chart data. Please try again.");
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ textAlign: 'center', margin: '20px auto' }}>
            <h2>User Role Statistics</h2>
            {data.length > 0 ? (
                <BarChart width={600} height={300} data={data} style={{ margin: '0 auto' }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
            ) : (
                <p>No statistics available to display.</p>
            )}
        </div>
    );
};

export default Chart;
