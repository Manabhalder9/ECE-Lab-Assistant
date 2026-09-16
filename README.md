# ECE Lab Assistant

A web-based toolkit for Electronics and Communication Engineering (ECE) students to perform common electronics calculations, number-system conversions, and digital logic experiments in one place.

**Live Demo:** https://manabhalder9.github.io/ECE-Lab-Assistant/

---

## About the Project

**ECE Lab Assistant** is an educational web application designed to help ECE students understand and practice fundamental electronics and digital concepts through simple interactive tools.

The goal is to bring commonly used calculations and basic learning utilities into a single, clean, and easy-to-use interface.

The project currently includes:

* Electronics calculations
* Resistor color code decoding
* Number system conversion
* Digital logic gate simulation
* RC circuit time-constant calculation
* Basic explanations of ECE concepts

The application is responsive and can be used on desktops, laptops, tablets, and mobile devices.

---

## Features

### Ohm's Law Calculator

Calculates Voltage, Current, or Resistance when the other two values are provided.

Formulas:

```text
V = I × R
I = V / R
R = V / I
```

Features:

* Simple input interface
* Automatic calculation
* Input validation
* Calculation breakdown
* Reset functionality

---

### Resistor Color Code Calculator

Decodes resistor values using standard color codes.

Supports:

* 4-band resistors
* 5-band resistors

Displays:

* Resistance value
* Tolerance
* Color-band sequence
* Calculation breakdown
* Visual resistor representation

---

### Number System Converter

Converts whole numbers between:

* Binary
* Decimal
* Octal
* Hexadecimal

The converter includes input validation for each number system and displays the corresponding values in all supported systems.

---

### Logic Gate Simulator

An interactive simulator for basic digital logic gates:

* AND
* OR
* NOT
* NAND
* NOR
* XOR
* XNOR

Features include:

* Interactive binary inputs
* Real-time output
* Boolean expressions
* Truth tables
* Basic logic-gate explanations

---

### RC Circuit Calculator

Calculates the time constant of a basic RC circuit.

Formula:

```text
τ = R × C
```

Supports:

**Resistance**

* Ω
* kΩ
* MΩ

**Capacitance**

* F
* mF
* µF
* nF
* pF

The calculator also explains basic capacitor charging and discharging behavior at different multiples of the time constant.

---

## Technology Stack

The project is built using fundamental web technologies:

* **HTML5** — Page structure and semantic elements
* **CSS3** — Styling and responsive design
* **Vanilla JavaScript** — Calculations, validation, navigation, and interactions

The project does not require a backend or external database.

---

## Project Structure

```text
ECE-Lab-Assistant/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── assets/
│   ├── images/
│   └── icons/
│
├── README.md
│
└── .gitignore
```

---

## Design & Interface

The application uses a clean, modern, and technical interface designed specifically for an engineering student toolkit.

The design focuses on:

* Simple navigation
* Clear information hierarchy
* Responsive layouts
* Readable results
* Consistent UI components
* Minimal visual clutter
* Beginner-friendly interaction

The application uses a **single-page multi-screen architecture**. Users can switch between Home, Tools, About, and individual tools without loading separate HTML pages.

---

## Validation & Error Handling

Client-side validation is implemented to prevent invalid calculations.

Examples include:

* Empty inputs
* Non-numeric values
* Invalid number-system characters
* Negative values where not applicable
* Division by zero
* Invalid resistor selections
* Invalid RC circuit values

The application also prevents invalid calculation results such as:

```text
NaN
Infinity
undefined
```

from being displayed to the user.

---

## Learning Objectives

This project was developed as a practical way to learn and apply:

* HTML5
* CSS3
* JavaScript fundamentals
* DOM manipulation
* Event handling
* Form validation
* Conditional logic
* Mathematical calculations
* Unit conversion
* Boolean logic
* Truth tables
* Basic electronics concepts
* Responsive web design
* Git and GitHub
* Web deployment

---

## Future Improvements

Possible future additions include:

* Frequency and wavelength calculator
* Decibel calculator
* Series and parallel resistor calculator
* Capacitor and inductor calculators
* Diode calculator
* Transistor-related tools
* More circuit simulations
* Additional ECE learning utilities

New features can be added gradually while keeping the project lightweight and easy to use.

---

## Project Status

**Deployed and Working**

Live application:

**https://manabhalder9.github.io/ECE-Lab-Assistant/**

---

## Author

**Manab Halder**

B.Tech — Electronics & Communication Engineering
Bengal College of Engineering & Technology (BCET)

---

## License

This project is created for educational and portfolio purposes.
