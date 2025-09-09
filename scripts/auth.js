class AuthService {
    constructor(apiUrl = "http://localhost:3000/api") {
        this.apiUrl = apiUrl;
        this.token = this.getStoredToken();
    }

    getStoredToken() {
        return localStorage.getItem('authToken');
    }

    saveToken(token) {
        localStorage.setItem('authToken', token);
        this.token = token;
    }

    async register(userData) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json();

            if(data.token) {
                this.saveToken(data.token);
            }

            return {
                success: true,
                data
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }
}

const authService = new AuthService();

export default authService;
