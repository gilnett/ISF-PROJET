const themeToggleButton = document.getElementById("theme-toggle");
let currentTheme = "default";

// Change le thème entre clair, sombre et gris
themeToggleButton.addEventListener("click", () => {
  const body = document.body;

  if (currentTheme === "default") {
    body.classList.add("dark-theme");
    body.classList.remove("gray-theme");
    currentTheme = "dark";
  } else if (currentTheme === "dark") {
    body.classList.add("gray-theme");
    body.classList.remove("dark-theme");
    currentTheme = "gray";
  } else {
    body.classList.remove("dark-theme", "gray-theme");
    currentTheme = "default";
  }
});
