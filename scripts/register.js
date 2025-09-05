import { computePosition, offset, flip, shift } from "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.10/+esm";

const REGISTER_STEPS = {
    accountInformation : {
        title: "Account information",
        fields: ['name', 'city', 'country']
    },
    email : {
        title: "Email",
        fields: ['email'],
        validator: ({ email }) => {
            const errors = [];

            if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
                errors.push('Please enter a valid email.');
            }

            return errors;
        }
    },
    password: {
        title: "Password",
        fields: ['password', 'confirmPassword'],
        validator: ({ password, confirmPassword }) => {
            const errors = [];

            if(password.length < 6) {
                errors.push('Password should be at least 6 characters.');
            }

            true 
            if(!/[A-Z]/.test(password)) {
                errors.push('Password should contain at least one uppercase character.');
            }

            if(!/[!@#$%^&*(),.?":{}|<>_\-\\/~`+=]/.test(password)){
                errors.push('Password should contain at least one special character.');
            }

            if(password !== confirmPassword) {
                errors.push('Password do not match with confirm password.');
            }

            return errors;
        }
    },
    registrationSuccess: {
        title: "Registration complete!"
    }
}

const STEPS = Object.keys(REGISTER_STEPS); // ['accountInformation', 'email', 'password', 'registrationSuccess']
let activeStep = STEPS[0]; // accountInformation

const stepTitle = document.getElementById('stepTitle');

let registerPayload = {};

const moveToTheNextStep = () => {
    const currentStepIndex = STEPS.indexOf(activeStep);

    activeStep = STEPS[currentStepIndex + 1];

    stepTitle.innerText = REGISTER_STEPS[activeStep].title;

    document.querySelector(`[data-step-index="${currentStepIndex + 1}"]`).classList.add('hidden');
    document.querySelector(`[data-step-index="${currentStepIndex + 2}"]`).classList.remove('hidden');

    const currentStepDiv = document.querySelector(`[data-step-order="${currentStepIndex + 1}"]`);
    currentStepDiv.classList.remove('step-active');
    currentStepDiv.classList.add('step-completed');

    const nextStepDiv = document.querySelector(`[data-step-order="${currentStepIndex + 2}"]`);
    nextStepDiv.classList.add('step-active');

    const passedStepDivider = document.querySelector(`[data-divider-order="${currentStepIndex + 1}"]`);
    passedStepDivider.classList.add('step-divider-passed');

    if(activeStep === 'registrationSuccess') {
        document.getElementById('form-footer').classList.add('hidden');
    }
}

const showErrors = (errors) => {
    errors.forEach(error => {
        Toastify({
            text: error,
            className: 'error-toast'
        }).showToast();
    })        
}

const formSubmitHandler = (event) => {
    event.preventDefault();
    const activeStepData = REGISTER_STEPS[activeStep];

    const stepData = {};

    activeStepData.fields.forEach(field => {
        stepData[field] = event.target.elements[field].value;
    })

    if(activeStepData.validator != null) {
        const errors = activeStepData.validator(stepData);

        if(errors.length > 0) {
            showErrors(errors);
            return;
        }
    }

    registerPayload = {
        ...registerPayload,
        ...stepData
    }

    moveToTheNextStep();
}

const completeRegisterHandler = () => {
    console.log('registerPayload :>> ', registerPayload);
}

document.querySelectorAll("[data-dropdown]").forEach((dropdown) => {
    const button = dropdown.querySelector(".dropdown-trigger");
    const menu = dropdown.querySelector(".dropdown-menu");

    const hiddenInput = dropdown.querySelector("input[type='hidden']");

    let open = false;

    const toggleMenu = () => {
        open = !open;
        menu.classList.toggle("hidden", !open);

        if(open) {
            computePosition(button, menu, {
                placement: "bottom",
                middleware: [offset(4), flip(), shift()]
            }).then(({x, y}) => {
                Object.assign(menu.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                    position: 'absolute'
                }) 
            })
        }
    }

    button.addEventListener('click', toggleMenu);

    menu.querySelectorAll("li").forEach(option => {
        option.addEventListener('click', () => {
            button.textContent = option.textContent;

            hiddenInput.value = option.dataset.value;

            menu.classList.add('hidden');
            open = false;
        })
    })

    document.addEventListener('click', (event) => {
        if(!dropdown.contains(event.target)) {
            menu.classList.add('hidden');
            open = false;
        }
    })
})

window.formSubmitHandler = formSubmitHandler;
