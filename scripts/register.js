const REGISTER_STEPS = {
    accountInformation : {
        title: "Account information",
        fields: ['name', 'city', 'country']
    },
    email : {
        title: "Email",
        fields: ['email']
    },
    password: {
        title: "Password ",
        fields: ['password', 'confirmPassword']
    },
    registrationSuccess: {
        title: "Registration complete!"
    }
}

const STEPS = Object.keys(REGISTER_STEPS); // ['accountInformation', 'email', 'password', 'registrationSuccess']
let activeStep = STEPS[0]; // accountInformation

const stepTitle = document.getElementById('stepTitle');

const formSubmitHandler = (event) => {
    event.preventDefault();

    const stepData = {};
    REGISTER_STEPS[activeStep].fields.forEach(field => {
        stepData[field] = event.target.elements[field].value
    })
}