// ========================================
// VIEW NAVIGATION / MULTI-SCREEN SYSTEM
// ========================================

const allViews = [
  document.getElementById("home-view"),
  document.getElementById("tools-view"),
  document.getElementById("about-view"),
  document.getElementById("ohms-law-view"),
  document.getElementById("resistor-calculator-view"),
  document.getElementById("number-system-view")
];

const navigationLinks = document.querySelectorAll(".nav-link");
const heroToolsBtn = document.getElementById("hero-tools-btn");
const openToolBtns = document.querySelectorAll(".open-tool-btn");
const backToToolsBtns = document.querySelectorAll(".back-to-tools-btn");

function switchView(targetViewId) {
  // Hide all views
  allViews.forEach(view => {
    if (view) view.classList.add("hidden");
  });

  // Show target view
  const targetView = document.getElementById(targetViewId);
  if (targetView) {
    targetView.classList.remove("hidden");
  }

  // Handle active navigation state
  navigationLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
    
    const linkTarget = link.getAttribute("data-view");
    
    // Determine which nav link should be active
    let isActive = false;
    if (targetViewId === "home-view" && linkTarget === "home-view") {
      isActive = true;
    } else if (targetViewId === "about-view" && linkTarget === "about-view") {
      isActive = true;
    } else if (linkTarget === "tools-view" && (
      targetViewId === "tools-view" || 
      targetViewId === "ohms-law-view" || 
      targetViewId === "resistor-calculator-view" || 
      targetViewId === "number-system-view"
    )) {
      // If we are on tools view OR any tool calculator view, highlight Tools nav
      isActive = true;
    }

    if (isActive) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Reset scroll position to top
  window.scrollTo(0, 0);
}

// Attach event listeners to top nav links
navigationLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchView(link.getAttribute("data-view"));
  });
});

const brandLink = document.getElementById("brand-link");
if (brandLink) {
  brandLink.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("home-view");
  });
}

// Attach event listener to hero button
if (heroToolsBtn) {
  heroToolsBtn.addEventListener("click", () => {
    switchView("tools-view");
  });
}

// Attach event listeners to tool cards
openToolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchView(btn.getAttribute("data-tool-target"));
  });
});

// Attach event listeners to back buttons
backToToolsBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchView("tools-view");
  });
});

// Initialize first view
switchView("home-view");


// ========================================
// OHM'S LAW CALCULATOR
// ========================================

const calculatorForm = document.querySelector("#ohms-law-form");
const calculatorPanel = document.querySelector("#ohms-law");
const calculatorMessage = document.querySelector("#calculator-message");
const resultValue = document.querySelector("#result-value");
const resultFormula = document.querySelector("#result-formula");
const solveSelect = document.querySelector("#solve-for");
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
  return solveSelect.value;
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
  // HTML input values are always strings. We trim whitespace to ensure clean parsing.
  const value = input.value.trim();
  const solveFor = getSelectedSolveValue();
  let message = "";

  // Validation happens before calculation to prevent NaN, Infinity, or incorrect results.
  if (!value) {
    message = `Please enter a valid ${resultLabels[inputName].toLowerCase()} value.`;
  } else if (isNaN(Number(value)) || value === "") {
    // Number() converts the string to a numeric value. If it's invalid, isNaN returns true.
    message = "Please enter a valid number.";
  } else if (Number(value) < 0) {
    message = "Please enter a positive value.";
  } else if (Number(value) === 0) {
    // Division by zero must be prevented to avoid Infinity as a result.
    if (solveFor === "current" && inputName === "resistance") {
      message = "Resistance cannot be zero when calculating current.";
    } else if (solveFor === "resistance" && inputName === "current") {
      message = "Current cannot be zero when calculating resistance.";
    }
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
  // Prevent the form from submitting and refreshing the page
  event.preventDefault();
  
  // 1. Read the selected calculation.
  const solveFor = getSelectedSolveValue();
  
  // 2. Determine which inputs are required based on what we are solving for
  const inputNames = Object.keys(calculatorInputs).filter((name) => name !== solveFor);
  
  // 3. Validate the values.
  const isValid = inputNames.map(validateInput).every(Boolean);

  calculatorMessage.textContent = "";
  calculatorResultResetState(false);

  if (!isValid) {
    calculatorMessage.textContent = "Check the highlighted values before calculating.";
    return;
  }

  // Convert validated string inputs into numbers for math operations
  const values = Object.fromEntries(
    inputNames.map((name) => [name, Number(calculatorInputs[name].value.trim())]),
  );
  let result;

  // 4. Perform the appropriate Ohm's Law formula based on the selected calculation.
  if (solveFor === "voltage") {
    result = values.current * values.resistance;
    resultFormula.innerHTML = `V = I × R<br>V = ${formatResult(values.current)} A × ${formatResult(values.resistance)} Ω<br>V = ${formatResult(result)} V`;
  } else if (solveFor === "current") {
    result = values.voltage / values.resistance;
    resultFormula.innerHTML = `I = V / R<br>I = ${formatResult(values.voltage)} V / ${formatResult(values.resistance)} Ω<br>I = ${formatResult(result)} A`;
  } else {
    result = values.voltage / values.current;
    resultFormula.innerHTML = `R = V / I<br>R = ${formatResult(values.voltage)} V / ${formatResult(values.current)} A<br>R = ${formatResult(result)} Ω`;
  }

  // 5. Display the result by updating the HTML
  resultValue.innerHTML = `${resultLabels[solveFor]}<br>${formatResult(result)} ${resultUnits[solveFor]}`;
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

solveSelect.addEventListener("change", () => {
  calculatorResultResetState();
  setInputState();
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

// ========================================
// RESISTOR COLOR CODE CALCULATOR
// ========================================

const RESISTOR_COLORS = [
  { name: "black", label: "Black", digit: 0, multiplier: 1, hex: "#000000" },
  { name: "brown", label: "Brown", digit: 1, multiplier: 10, tolerance: 1, hex: "#8B4513" },
  { name: "red", label: "Red", digit: 2, multiplier: 100, tolerance: 2, hex: "#FF0000" },
  { name: "orange", label: "Orange", digit: 3, multiplier: 1000, hex: "#FF8C00" },
  { name: "yellow", label: "Yellow", digit: 4, multiplier: 10000, hex: "#FFD700" },
  { name: "green", label: "Green", digit: 5, multiplier: 100000, tolerance: 0.5, hex: "#008000" },
  { name: "blue", label: "Blue", digit: 6, multiplier: 1000000, tolerance: 0.25, hex: "#0000FF" },
  { name: "violet", label: "Violet", digit: 7, multiplier: 10000000, tolerance: 0.1, hex: "#EE82EE" },
  { name: "grey", label: "Grey", digit: 8, multiplier: 100000000, tolerance: 0.05, hex: "#808080" },
  { name: "white", label: "White", digit: 9, multiplier: 1000000000, hex: "#FFFFFF" },
  // Notice Gold and Silver do not have 'digit' or 'multiplier' properties in this strict 
  // implementation per the beginner prompt requirements to exclude them from multiplier dropdowns.
  { name: "gold", label: "Gold", tolerance: 5, hex: "#CFB53B" },
  { name: "silver", label: "Silver", tolerance: 10, hex: "#C0C0C0" }
];

const resistorForm = document.querySelector("#resistor-form");
const resistorType = document.querySelector("#resistor-type");
const resistorBands = {
  1: document.querySelector("#band-1"),
  2: document.querySelector("#band-2"),
  3: document.querySelector("#band-3"),
  4: document.querySelector("#band-4"),
  5: document.querySelector("#band-5")
};
const resistorLabels = {
  1: document.querySelector("#label-band-1"),
  2: document.querySelector("#label-band-2"),
  3: document.querySelector("#label-band-3"),
  4: document.querySelector("#label-band-4"),
  5: document.querySelector("#label-band-5")
};
const containerBand5 = document.querySelector("#container-band-5");
const visualBands = {
  1: document.querySelector("#visual-band-1"),
  2: document.querySelector("#visual-band-2"),
  3: document.querySelector("#visual-band-3"),
  4: document.querySelector("#visual-band-4"),
  5: document.querySelector("#visual-band-5")
};
const resistorResultValue = document.querySelector("#resistor-result-value");
const resistorResultBreakdown = document.querySelector("#resistor-result-breakdown");
const resistorError = document.querySelector("#resistor-error");
const resistorResetBtn = document.querySelector("#resistor-reset-btn");
const resistorResultArea = document.querySelector("#resistor-result");

// Populates a <select> element with valid colors based on the role (digit, multiplier, tolerance)
function populateColorDropdown(selectElement, type) {
  const currentValue = selectElement.value;
  selectElement.innerHTML = '<option value="">Select Color</option>';

  RESISTOR_COLORS.forEach(color => {
    let shouldInclude = false;

    if (type === "digit" && color.digit !== undefined) {
      shouldInclude = true;
    } else if (type === "multiplier" && color.multiplier !== undefined) {
      shouldInclude = true;
    } else if (type === "tolerance" && color.tolerance !== undefined) {
      shouldInclude = true;
    }

    if (shouldInclude) {
      const option = document.createElement("option");
      option.value = color.name;
      option.textContent = color.label;
      selectElement.appendChild(option);
    }
  });

  // Attempt to restore the previously selected value if it's still valid
  const hasOption = Array.from(selectElement.options).some(opt => opt.value === currentValue);
  if (hasOption && currentValue) {
    selectElement.value = currentValue;
  }
}

// Configures the meanings and available options for Band 3, 4, and 5 depending on 4-band vs 5-band
function updateResistorBandTypes() {
  const is5Band = resistorType.value === "5";

  if (is5Band) {
    resistorLabels[3].textContent = "Band 3 (3rd Digit)";
    populateColorDropdown(resistorBands[3], "digit");

    resistorLabels[4].textContent = "Band 4 (Multiplier)";
    populateColorDropdown(resistorBands[4], "multiplier");

    resistorLabels[5].textContent = "Band 5 (Tolerance)";
    populateColorDropdown(resistorBands[5], "tolerance");

    containerBand5.style.display = "block";
    visualBands[5].style.display = "block";
  } else {
    resistorLabels[3].textContent = "Band 3 (Multiplier)";
    populateColorDropdown(resistorBands[3], "multiplier");

    resistorLabels[4].textContent = "Band 4 (Tolerance)";
    populateColorDropdown(resistorBands[4], "tolerance");

    containerBand5.style.display = "none";
    visualBands[5].style.display = "none";
    resistorBands[5].value = ""; 
  }
  
  calculateResistorValue();
}

function initializeResistorDropdowns() {
  populateColorDropdown(resistorBands[1], "digit");
  populateColorDropdown(resistorBands[2], "digit");
  updateResistorBandTypes();
}

// Visually updates the CSS background color of the resistor bands
function updateResistorVisual() {
  const activeBands = resistorType.value === "5" ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
  
  [1, 2, 3, 4, 5].forEach(num => {
    const visualBand = visualBands[num];
    const selectElement = resistorBands[num];
    
    if (activeBands.includes(num)) {
      const selectedColorName = selectElement.value;
      if (selectedColorName) {
        const colorData = RESISTOR_COLORS.find(c => c.name === selectedColorName);
        visualBand.style.backgroundColor = colorData.hex;
        visualBand.classList.remove("neutral");
      } else {
        visualBand.style.backgroundColor = "transparent";
        visualBand.classList.add("neutral");
      }
    } else {
       visualBand.style.backgroundColor = "transparent";
    }
  });
}

function formatResistance(ohms) {
  if (ohms >= 1000000) {
    return (ohms / 1000000) + " MΩ";
  } else if (ohms >= 1000) {
    return (ohms / 1000) + " kΩ";
  } else {
    return ohms + " Ω";
  }
}

// Core calculation logic that executes whenever a dropdown changes
function calculateResistorValue() {
  updateResistorVisual();
  resistorError.textContent = "";
  resistorResultArea.classList.remove("has-result");

  const is5Band = resistorType.value === "5";
  const activeBands = is5Band ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
  
  // Validation checks
  let allSelected = true;
  for (const num of activeBands) {
    if (!resistorBands[num].value) {
      allSelected = false;
      break;
    }
  }

  if (!allSelected) {
    resistorResultValue.textContent = "Select all resistor bands to calculate the value.";
    resistorResultBreakdown.innerHTML = "";
    return;
  }

  // Handle leading zero edge case
  if (resistorBands[1].value === "black") {
    resistorError.textContent = "Band 1 (First digit) cannot be Black.";
    resistorResultValue.textContent = "Invalid configuration.";
    resistorResultBreakdown.innerHTML = "";
    return;
  }

  const getVal = (bandNum) => RESISTOR_COLORS.find(c => c.name === resistorBands[bandNum].value);

  let ohms = 0;
  let digits = 0;
  let multiplierStr = "";
  let tolerance = 0;
  let colorSequence = activeBands.map(num => getVal(num).label).join(" • ");

  if (is5Band) {
    const d1 = getVal(1).digit;
    const d2 = getVal(2).digit;
    const d3 = getVal(3).digit;
    const mult = getVal(4).multiplier;
    tolerance = getVal(5).tolerance;

    digits = (d1 * 100) + (d2 * 10) + d3;
    ohms = digits * mult;
    multiplierStr = `×${mult.toLocaleString()}`;
  } else {
    const d1 = getVal(1).digit;
    const d2 = getVal(2).digit;
    const mult = getVal(3).multiplier;
    tolerance = getVal(4).tolerance;

    digits = (d1 * 10) + d2;
    ohms = digits * mult;
    multiplierStr = `×${mult.toLocaleString()}`;
  }

  const formatted = formatResistance(ohms);
  const tolStr = `±${tolerance}%`;

  resistorResultValue.innerHTML = `${formatted} <span style="font-weight:normal; font-size: 0.85em;">${tolStr}</span>`;
  
  resistorResultBreakdown.innerHTML = `
    <strong>Sequence:</strong> ${colorSequence}<br><br>
    <strong>Digits:</strong> ${digits}<br>
    <strong>Multiplier:</strong> ${multiplierStr}<br>
    <strong>Resistance:</strong> ${digits} × ${getVal(is5Band ? 4 : 3).multiplier.toLocaleString()} = ${ohms.toLocaleString()} Ω<br>
    <strong>Formatted:</strong> ${formatted}<br>
    <strong>Tolerance:</strong> ${tolStr}
  `;
  
  resistorResultArea.classList.add("has-result");
}

// Clear all inputs and restore 4-band state
function resetResistorCalculator() {
  resistorType.value = "4";
  resistorBands[1].value = "";
  resistorBands[2].value = "";
  resistorBands[3].value = "";
  resistorBands[4].value = "";
  resistorBands[5].value = "";
  
  updateResistorBandTypes();
  resistorError.textContent = "";
  resistorResultValue.textContent = "Select all resistor bands to calculate the value.";
  resistorResultBreakdown.innerHTML = "";
  resistorResultArea.classList.remove("has-result");
}

resistorType.addEventListener("change", updateResistorBandTypes);

[1, 2, 3, 4, 5].forEach(num => {
  resistorBands[num].addEventListener("change", calculateResistorValue);
});

resistorResetBtn.addEventListener("click", resetResistorCalculator);

// Run initial setup
initializeResistorDropdowns();
updateResistorVisual();

// Checkpoint: Version 5 (Resistor Color Code Calculator) completed.

// ========================================
// NUMBER SYSTEM CONVERTER
// ========================================

const numberSystemForm = document.getElementById("number-system-form");
const numberInput = document.getElementById("number-input");
const sourceSystemSelect = document.getElementById("source-system");
const numberError = document.getElementById("number-error");
const numberResultArea = document.getElementById("number-result");

const resultBinary = document.getElementById("result-binary");
const resultDecimal = document.getElementById("result-decimal");
const resultOctal = document.getElementById("result-octal");
const resultHexadecimal = document.getElementById("result-hexadecimal");

function validateNumber(value, system) {
  if (!value) {
    return "Please enter a number.";
  }
  
  if (value.startsWith("-")) {
    return "Please enter a non-negative whole number.";
  }

  if (system === "binary") {
    if (!/^[01]+$/.test(value)) {
      return "Invalid binary number. Use only 0 and 1.";
    }
  } else if (system === "octal") {
    if (!/^[0-7]+$/.test(value)) {
      return "Invalid octal number. Use digits from 0 to 7.";
    }
  } else if (system === "decimal") {
    if (!/^[0-9]+$/.test(value)) {
      return "Invalid decimal number. Use digits from 0 to 9.";
    }
  } else if (system === "hexadecimal") {
    if (!/^[0-9A-Fa-f]+$/.test(value)) {
      return "Invalid hexadecimal number. Use digits 0-9 and A-F.";
    }
  }
  
  return ""; // empty string means validation passed
}

function convertNumber(event) {
  event.preventDefault(); // prevent form submission reload

  const value = numberInput.value.trim();
  const system = sourceSystemSelect.value;
  
  // Validate
  const errorMessage = validateNumber(value, system);
  if (errorMessage) {
    numberError.textContent = errorMessage;
    numberInput.setAttribute("aria-invalid", "true");
    numberResultArea.style.display = "none";
    return;
  }
  
  numberError.textContent = "";
  numberInput.removeAttribute("aria-invalid");

  // Convert to decimal first as our intermediate base
  let decimalValue = 0;
  if (system === "binary") {
    decimalValue = parseInt(value, 2);
  } else if (system === "octal") {
    decimalValue = parseInt(value, 8);
  } else if (system === "decimal") {
    decimalValue = parseInt(value, 10);
  } else if (system === "hexadecimal") {
    decimalValue = parseInt(value, 16);
  }

  // Double check if JavaScript failed to parse a very large unhandled number
  if (isNaN(decimalValue)) {
    numberError.textContent = "Number is too large or invalid to convert.";
    numberResultArea.style.display = "none";
    return;
  }

  // Display Conversion Results
  resultBinary.textContent = decimalValue.toString(2);
  resultDecimal.textContent = decimalValue.toString(10);
  resultOctal.textContent = decimalValue.toString(8);
  resultHexadecimal.textContent = decimalValue.toString(16).toUpperCase();

  numberResultArea.style.display = "grid";
}

function resetNumberConverter() {
  // Clear input
  numberInput.value = "";
  numberInput.removeAttribute("aria-invalid");
  
  // Reset select
  sourceSystemSelect.value = "binary";
  
  // Clear errors
  numberError.textContent = "";
  
  // Clear results & hide
  resultBinary.textContent = "";
  resultDecimal.textContent = "";
  resultOctal.textContent = "";
  resultHexadecimal.textContent = "";
  numberResultArea.style.display = "none";
}

// Event Listeners
numberSystemForm.addEventListener("submit", convertNumber);
numberSystemForm.addEventListener("reset", (e) => {
  e.preventDefault(); // Take over the reset behavior to handle UI state smoothly
  resetNumberConverter();
});
numberInput.addEventListener("input", () => {
  numberError.textContent = "";
  numberInput.removeAttribute("aria-invalid");
});
