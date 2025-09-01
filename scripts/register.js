const REGISTER_STEPS = {
    accountInformation: {
        title: "Account information",
        fields: ['name', 'city', 'country']
    },
    email: {
        title: 'Email',
        fields: ['email']
    },
    password: {
        title: "Password",
        fields: ['password', 'confirmPassword']
    },
    registrationSuccess: {
        title: "Registration Success"
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

    const stepData = {};
    REGISTER_STEPS[activeStep].fields.forEach(field => {
        stepData[field] = event.target.elements[field].value 
    })

    registerPayload = {
        ...registerPayload,
        ...stepData
    }

    moveToTheNextStep();
}

const registerHandler = async () => {

}

