const showErrors = (errors) => {
    errors.forEach(errors => {
        Toastify({
            text: errors,
            className: "error-toast"
        }).showToast();
    })
}

const REGISTER_STEPS = {
    accountInformation : {
        title: "Account information",
        fields: ['name', 'city', 'country'],
    },
    email : {
        title: "Email",
        fields: ['email']
    },
    password: {
        title: "Password",
        fields: ['password', 'confirmPassword'],
        validator: ({password, confirmPassword}) => {
            const minLength = 6;
            const hasUppercase = /[A-Z]/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\\/~`+=]/.test(password);

            const errors = [];

            if (password.length < minLength) {
                errors.push("Password should be at least 6 characters long.");
            }

            if (!hasUppercase) {
                errors.push("Password should contain at least one uppercase letter.");
            }

            if (!hasSpecialChar) {
                errors.push("Password should contain at least one special character.");
            }

            if(confirmPassword !== password) {
                errors.push("Confirm password doesn't match with the password.");
            }

            return errors
        }
    },
    registrationSuccess: {
        title: "Registration complete!"
    }
}

const STEPS = Object.keys(REGISTER_STEPS);
let activeStep = STEPS[0];

const stepTitle = document.getElementById('stepTitle');

let registerPayload = {};

const moveToTheNextStep = () => {
    const currentStepIndex = STEPS.indexOf(activeStep);
    activeStep = STEPS[currentStepIndex + 1];

    stepTitle.innerText = REGISTER_STEPS[activeStep].title;

    document.querySelector(`[data-step-index="${currentStepIndex + 1}"]`).classList.add('hidden');
    document.querySelector(`[data-step-index="${currentStepIndex + 2}"]`).classList.remove('hidden');

    const currentStepDiv = document.querySelector(`[data-step-order="${currentStepIndex + 1}"]`)
    currentStepDiv.classList.remove('step-active')
    currentStepDiv.classList.add('step-completed');

    const nextStepDiv = document.querySelector(`[data-step-order="${currentStepIndex + 2}"]`)
    nextStepDiv.classList.add('step-active')

    const currentStepDivider = document.querySelector(`[data-divider-order="${currentStepIndex + 1}"]`)
    currentStepDivider.classList.add('step-divider-passed');
}

const nextStepHandler = (event) => {
    event.preventDefault();
    const activeStepData = REGISTER_STEPS[activeStep];

    const stepData = {};
    activeStepData.fields.forEach(field => {
        stepData[field] = event.target.elements[field].value 
    })

    if(activeStepData?.validator) {
        const errors = activeStepData.validator(stepData);

        if(errors.length > 0) {
            showErrors(errors);
            return
        }
    }

    registerPayload = {
        ...registerPayload,
        ...stepData
    }

    moveToTheNextStep();
}

const registerHandler = async () => {

}

