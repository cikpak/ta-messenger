import authService from './auth.js';

if (authService.isAuthenticated()) {
    window.location.href = '/messenger.html';
}

const showError = (message) => {
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            className: 'error-toast',
            duration: 3000,
            gravity: "top",
            position: "right"
        }).showToast();
    } else {
        alert(message);
    }
}

const showSuccess = (message) => {
    if (typeof Toastify !== 'undefined') {
        Toastify({
            text: message,
            className: 'success-toast',
            duration: 3000,
            gravity: "top",
            position: "right"
        }).showToast();
    } else {
        console.log(message);
    }
}

// Handle login form submission
const handleLogin = async (event) => {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Get form values
    const email = form.querySelector('input[placeholder="Insert your email"]').value;
    const password = form.querySelector('input[placeholder="Insert your password"]').value;
    
    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Validate email format
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';
    
    try {
        // Attempt login
        const result = await authService.login(email, password);
        
        if (result.success) {
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to messenger after a short delay
            setTimeout(() => {
                window.location.href = '/messenger.html';
            }, 1000);
        } else {
            showError(result.error || 'Invalid email or password');
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    } catch (error) {
        showError('An unexpected error occurred. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
    }
}

window.handleLogin = handleLogin;
