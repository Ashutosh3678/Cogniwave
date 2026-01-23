/**
 * Authentication Manager
 * Handles login, registration, and JWT token management
 */

const AUTH_API_URL = 'http://localhost:8000/api/v1/auth';
const TOKEN_KEY = 'cogniwave_auth_token';
const DOCTOR_KEY = 'cogniwave_doctor';

class AuthManager {
    constructor() {
        this.token = localStorage.getItem(TOKEN_KEY);
        this.doctor = JSON.parse(localStorage.getItem(DOCTOR_KEY) || 'null');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get current doctor info
     */
    getCurrentDoctor() {
        return this.doctor;
    }

    /**
     * Get auth token
     */
    getToken() {
        return this.token;
    }

    /**
     * Login doctor
     */
    async login(username, password) {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();
            this.token = data.access_token;
            this.doctor = data.doctor;

            // Save to localStorage
            localStorage.setItem(TOKEN_KEY, this.token);
            localStorage.setItem(DOCTOR_KEY, JSON.stringify(this.doctor));

            console.log('✓ Login successful:', this.doctor.full_name);
            return { success: true, doctor: this.doctor };

        } catch (error) {
            console.error('✗ Login failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Register new doctor
     */
    async register(userData) {
        try {
            const response = await fetch(`${AUTH_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Registration failed');
            }

            const data = await response.json();
            this.token = data.access_token;
            this.doctor = data.doctor;

            // Save to localStorage
            localStorage.setItem(TOKEN_KEY, this.token);
            localStorage.setItem(DOCTOR_KEY, JSON.stringify(this.doctor));

            console.log('✓ Registration successful:', this.doctor.full_name);
            return { success: true, doctor: this.doctor };

        } catch (error) {
            console.error('✗ Registration failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout
     */
    logout() {
        this.token = null;
        this.doctor = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(DOCTOR_KEY);
        console.log('✓ Logged out');
    }

    /**
     * Get auth headers for API requests
     */
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

// Export singleton instance
const authManager = new AuthManager();
