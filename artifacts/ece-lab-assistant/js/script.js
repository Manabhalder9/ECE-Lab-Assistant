// This file contains the small interactions used by the dashboard.
// Calculator logic will be added in later development stages.
console.log("ECE Lab Assistant JavaScript has loaded.");

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