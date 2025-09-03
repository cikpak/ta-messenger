import { computePosition, offset, flip, shift } from "https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.6.10/+esm";

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

document.querySelectorAll("[data-dropdown]").forEach((dropdown) => {
  const button = dropdown.querySelector(".dropdown-trigger");
  const menu = dropdown.querySelector(".dropdown-menu");
  const hiddenInput = dropdown.querySelector("input[type='hidden']");

  let open = false;

  function toggleMenu() {
    open = !open;
    menu.classList.toggle("hidden", !open);

    if (open) {
      computePosition(button, menu, {
        placement: "bottom-start",
        middleware: [offset(4), flip(), shift()],
      }).then(({ x, y }) => {
        Object.assign(menu.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: "absolute",
        });
      });
    }
  }

  button.addEventListener("click", toggleMenu);
  
  menu.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => {
      button.textContent = item.textContent;
      button.dataset.value = item.dataset.value;

      hiddenInput.value = item.dataset.value;

      menu.querySelectorAll("li").forEach((li) => li.classList.remove("selected"));
      item.classList.add("selected");

      menu.classList.add("hidden");
      open = false;
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      menu.classList.add("hidden");
      open = false;
    }
  });
});