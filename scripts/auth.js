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

    isAuthenticated() {
        if(!this.token) {
            return false
        }

        // verific daca tokenul nu a expirat
        try {
            const payload = this.parseJwt(this.token);
            const currentTime = Date.now() / 1000;

            return currentTime < payload.exp;
        } catch (err) {
            return false;
        }
    }

    parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const jsonPayload = decodeURIComponent(atob(base64Url).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token!');
        }
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

    async login(email, password) {
         try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({
                    email, password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const data = await response.json();

            this.saveToken(data.token);

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
