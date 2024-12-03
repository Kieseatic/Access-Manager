import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [filters, setFilters] = useState({ role: '', country: '' });
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage] = useState(10); // Number of users per page
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch users data
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null); // Reset error state
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`, {
                params: {
                    page: currentPage + 1,
                    limit: itemsPerPage,
                    role: filters.role,
                    country: filters.country,
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure token is included
                },
            });
            setUsers(response.data.users);
            setTotalUsers(response.data.total);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch user data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, itemsPerPage]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleUserStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === true || currentStatus === 'active' ? 'inactive' : 'active';

            console.log('Updating user status:', { id, currentStatus, newStatus });

            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}/users/${id}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            console.log('Response from server:', response.data);
            alert(response.data.message); // Display success message
            fetchUsers(); // Refresh the user list after status update
        } catch (err) {
            console.error('Error updating user status:', err);

            if (err.response) {
                // Log and alert server response errors
                console.error('Server error response:', err.response.data);
                alert(`Error: ${err.response.data.message || 'Unknown server error occurred'}`);
            } else if (err.request) {
                // Log and alert request errors (e.g., no response)
                console.error('No response from server:', err.request);
                alert('Error: No response from server. Please check your network connection.');
            } else {
                // Log unexpected errors
                console.error('Unexpected error:', err.message);
                alert('Unexpected error occurred.');
            }
        }
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setCurrentPage(0); // Reset to the first page when filters change
    };

    // Handle pagination changes
    const handlePageChange = (selected) => {
        setCurrentPage(selected.selected);
    };

    return (
        <div className="container mt-4">
            <h2>Admin Panel</h2>

            {/* Filters */}
            <div className="row mb-3">
                <div className="col-md-4">
                    <label htmlFor="roleFilter">Role:</label>
                    <select
                        id="roleFilter"
                        className="form-select"
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                    >
                        <option value="">All</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label htmlFor="countryFilter">Country:</label>
                    <input
                        id="countryFilter"
                        type="text"
                        className="form-control"
                        name="country"
                        value={filters.country}
                        onChange={handleFilterChange}
                        placeholder="Enter country"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* User Table */}
            {loading ? (
                <p>Loading...</p>
            ) : users.length > 0 ? (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Country</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.country}</td>
                                <td>{user.status === true || user.status === 'active' ? 'Active' : 'Inactive'}</td>
                                <td>
                                    <button
                                        className={`btn ${
                                            user.status === true || user.status === 'active'
                                                ? 'btn-danger'
                                                : 'btn-success'
                                        }`}
                                        onClick={() => toggleUserStatus(user.id, user.status)}
                                    >
                                        {user.status === true || user.status === 'active' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No users found.</p>
            )}

            {/* Pagination */}
            {totalUsers > itemsPerPage && (
                <ReactPaginate
                    previousLabel={'Previous'}
                    nextLabel={'Next'}
                    pageCount={Math.ceil(totalUsers / itemsPerPage)}
                    onPageChange={handlePageChange}
                    containerClassName={'pagination justify-content-center'}
                    pageClassName={'page-item'}
                    pageLinkClassName={'page-link'}
                    previousClassName={'page-item'}
                    previousLinkClassName={'page-link'}
                    nextClassName={'page-item'}
                    nextLinkClassName={'page-link'}
                    activeClassName={'active'}
                />
            )}
        </div>
    );
};

export default AdminPanel;
