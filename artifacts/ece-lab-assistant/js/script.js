// Keep the selected navigation link visually active after a user clicks it.
// The link's href tells us which section the user is moving to.
const navigationLinks = document.querySelectorAll(".nav-link");

function setActiveNavigationLink(selectedLink) {
  navigationLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  selectedLink.classList.add("is-active");
  selectedLink.setAttribute("aria-current", "page");
}

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setActiveNavigationLink(link);
  });
});

const calculatorForm = document.querySelector("#ohms-law-form");
const calculatorPanel = document.querySelector("#ohms-law");
const calculatorMessage = document.querySelector("#calculator-message");
const resultValue = document.querySelector("#result-value");
const resultFormula = document.querySelector("#result-formula");
const solveOptions = document.querySelectorAll('input[name="solve-for"]');
const calculatorInputs = {
  voltage: document.querySelector("#voltage-input"),
  current: document.querySelector("#current-input"),
  resistance: document.querySelector("#resistance-input"),
};

const calculatorErrors = {
  voltage: document.querySelector("#voltage-error"),
  current: document.querySelector("#current-error"),
  resistance: document.querySelector("#resistance-error"),
};

const resultUnits = {
  voltage: "V",
  current: "A",
  resistance: "Ω",
};

const resultLabels = {
  voltage: "Voltage",
  current: "Current",
  resistance: "Resistance",
};

function getSelectedSolveValue() {
  return document.querySelector('input[name="solve-for"]:checked').value;
}

function setInputState(inputName) {
  const solveFor = getSelectedSolveValue();

  Object.entries(calculatorInputs).forEach(([name, input]) => {
    const isResult = name === solveFor;
    input.disabled = isResult;
    input.setAttribute("aria-disabled", String(isResult));
    input.closest(".calculator-input").classList.toggle("is-result", isResult);

    if (isResult) {
      input.value = "";
      calculatorErrors[name].textContent = "";
      input.removeAttribute("aria-invalid");
    }
  });

  resultFormula.textContent =
    solveFor === "voltage"
      ? "V = I × R"
      : solveFor === "current"
        ? "I = V ÷ R"
        : "R = V ÷ I";
}

function validateInput(inputName) {
  const input = calculatorInputs[inputName];
  const value = input.value.trim();
  let message = "";

  if (!value) {
    message = `Enter a value for ${resultLabels[inputName].toLowerCase()}.`;
  } else if (!Number.isFinite(Number(value))) {
    message = "Use a valid number, such as 12 or 0.5.";
  } else if (Number(value) <= 0) {
    message = "Enter a value greater than zero.";
  }

  calculatorErrors[inputName].textContent = message;
  input.toggleAttribute("aria-invalid", Boolean(message));
  return message === "";
}

function formatResult(value) {
  return Number(value.toPrecision(10)).toLocaleString("en-US", {
    maximumFractionDigits: 6,
  });
}

function calculateOhmsLaw(event) {
  event.preventDefault();
  const solveFor = getSelectedSolveValue();
  const inputNames = Object.keys(calculatorInputs).filter((name) => name !== solveFor);
  const isValid = inputNames.map(validateInput).every(Boolean);

  calculatorMessage.textContent = "";
  calculatorResultResetState(false);

  if (!isValid) {
    calculatorMessage.textContent = "Check the highlighted values before calculating.";
    return;
  }

  const values = Object.fromEntries(
    inputNames.map((name) => [name, Number(calculatorInputs[name].value.trim())]),
  );
  let result;

  if (solveFor === "voltage") {
    result = values.current * values.resistance;
  } else if (solveFor === "current") {
    result = values.voltage / values.resistance;
  } else {
    result = values.voltage / values.current;
  }

  resultValue.textContent = `${resultLabels[solveFor]} = ${formatResult(result)} ${resultUnits[solveFor]}`;
  calculatorMessage.textContent = "Calculation complete.";
  calculatorPanel.classList.add("has-result");
}

function calculatorResultResetState(clearResult = true) {
  resultValue.textContent = "Enter values to calculate";
  if (clearResult) {
    resultFormula.textContent = "V = I × R";
    calculatorMessage.textContent = "";
  }
  calculatorPanel.classList.remove("has-result");
}

solveOptions.forEach((option) => {
  option.addEventListener("change", () => {
    calculatorResultResetState();
    setInputState(option.value);
  });
});

Object.entries(calculatorInputs).forEach(([name, input]) => {
  input.addEventListener("input", () => {
    calculatorErrors[name].textContent = "";
    input.removeAttribute("aria-invalid");
    calculatorMessage.textContent = "";
  });
});

calculatorForm.addEventListener("submit", calculateOhmsLaw);
calculatorForm.addEventListener("reset", () => {
  window.setTimeout(() => {
    Object.values(calculatorErrors).forEach((error) => {
      error.textContent = "";
    });
    Object.values(calculatorInputs).forEach((input) => {
      input.removeAttribute("aria-invalid");
    });
    setInputState();
    calculatorResultResetState();
  }, 0);
});

document.querySelectorAll("[data-tool-target]").forEach((toolLink) => {
  toolLink.addEventListener("click", () => {
    const target = document.getElementById(toolLink.dataset.toolTarget);
    if (target) {
      window.setTimeout(() => {
        target.querySelector("input:not(:disabled)")?.focus({ preventScroll: true });
      }, 300);
    }
  });
});

setInputState();
