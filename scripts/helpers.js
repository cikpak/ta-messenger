export const showSuccess = (message) => {
    Toastify({
        text: message,
        className: 'success-toast'
    }).showToast();
}

export const showError = (error) => {
    Toastify({
        text: error,
        className: 'error-toast'
    }).showToast();
}

export const showErrors = (errors) => {
    errors.forEach(error => {
       showError(error);
    })        
}