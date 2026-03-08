import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        if (!token) {
            console.log('[UserContext] No token available, skipping fetch');
            return;
        }

        setLoading(true);
        try {
            console.log('[UserContext] Fetching users from API...');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error(`[UserContext] API Error ${response.status}:`, errorData.message || 'Unknown error');
                setUsers([]);
                setLoading(false);
                return;
            }

            const data = await response.json();
            console.log(`[UserContext] Successfully fetched ${data.length} users`);

            if (Array.isArray(data)) {
                setUsers(data);
            } else {
                console.error('[UserContext] API Error: Response is not an array', data);
                setUsers([]);
            }
        } catch (error) {
            console.error('[UserContext] Network or Runtime Error:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when token is available
    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const addUser = async (newUser) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            if (response.ok) {
                await fetchUsers(); // Refresh list to get full data (ids etc)
                return { success: true };
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add user');
                return { success: false };
            }
        } catch (error) {
            console.error('Error adding user:', error);
            return { success: false };
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setUsers(users.filter(user => user.id !== id));
            } else {
                const data = await response.json();
                console.error('Failed to delete user:', data);
                alert(data.message || 'Failed to delete user from server');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error connecting to server');
        }
    };

    return (
        <UserContext.Provider value={{ users, addUser, deleteUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};
