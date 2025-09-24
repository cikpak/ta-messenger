import authService from "./auth.js";
import { showError, showSuccess } from './helpers.js'

const loginHandler = async (event) => {
    event.preventDefault();

    const form = event.target;

    const email = form.elements.email.value;
    const password = form.elements.password.value;

    if(!email || !password) {
        showError('Please enter a valid email or password!');
        return;
    }

    const loginBtn = document.getElementById('login-btn');

    loginBtn.disabled = true;
    loginBtn.innerText = 'Loading...'

    try {
        const response = await authService.login(email, password);

        if(response.success) {
            showSuccess('Login success! Redirecting...');

            setTimeout(()=> {
                window.location.href  = "/messenger.html";
            }, 1500);
        }else{
            showError('Login failed!');
        }
    } catch (error) {
        showError('Login fail, please try again!');
    } finally {
        setTimeout(() => {
            loginBtn.disabled = false;
            loginBtn.innerText = "Sign In"
        }, 1500);
    }
}

window.loginHandler = loginHandler;