// Applies the dark class before first paint to prevent theme flash.
// Lives in an external file so the strict CSP (script-src 'self') allows it.
(function () {
  var stored = localStorage.getItem("wiro-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored === "dark" || (!stored && prefersDark)) {
    document.documentElement.classList.add("dark");
  }
})();
