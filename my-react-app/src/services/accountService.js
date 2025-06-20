  import { API_CONFIG } from './api';

const ACCOUNT_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCOUNT}`;

export const accountService = {
    login: async (credentials) => {
        try {
            const response = await fetch(ACCOUNT_URL + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            throw new Error('Login failed');
        }
    },

    register: async (userData) => {
        try {
            const response = await fetch(ACCOUNT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: userData.userName,
                    email: userData.email,
                    currentPassword: userData.password
                })
            });
            return await response.text();
        } catch (error) {
            throw new Error('Registration failed');
        }
    },

    updateAccount: async (userData) => {
        try {
            const response = await fetch(ACCOUNT_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            return await response.text();
        } catch (error) {
            throw new Error('Update failed');
        }
    }
};