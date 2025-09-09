// auth.js - Authentication service for handling login/register with JWT

class AuthService {
    constructor(apiUrl = 'http://localhost:3000/api') {
        this.apiUrl = apiUrl;
        this.token = this.getStoredToken();
    }

    // Get stored token from localStorage
    getStoredToken() {
        return localStorage.getItem('authToken');
    }

    // Save token to localStorage
    saveToken(token) {
        localStorage.setItem('authToken', token);
        this.token = token;
    }

    // Remove token from localStorage
    removeToken() {
        localStorage.removeItem('authToken');
        this.token = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        if (!this.token) return false;
        
        // Check if token is expired
        try {
            const payload = this.parseJwt(this.token);
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    // Parse JWT token
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Get current user from token
    getCurrentUser() {
        if (!this.isAuthenticated()) return null;
        
        try {
            const payload = this.parseJwt(this.token);
            return {
                id: payload.userId,
                email: payload.email,
                name: payload.name
            };
        } catch (error) {
            return null;
        }
    }

    // Register new user
    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Save token if provided (auto-login after registration)
            if (data.token) {
                this.saveToken(data.token);
            }

            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save token
            this.saveToken(data.token);

            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Make authenticated API request
    async authenticatedRequest(url, options = {}) {
        if (!this.isAuthenticated()) {
            this.logout();
            throw new Error('Not authenticated');
        }

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.token}`
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.logout();
            throw new Error('Authentication expired');
        }

        return response;
    }
}

// Export as singleton
const authService = new AuthService();

// Make it available globally for non-module scripts
window.authService = authService;

export default authService;