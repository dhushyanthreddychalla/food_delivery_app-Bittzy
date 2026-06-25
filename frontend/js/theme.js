(function() {
  const THEME_KEY = "fd_theme";
  
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.body.classList.remove("dark-mode");
    }
  }

  // Initial Check
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);

  // Global toggle function
  window.toggleGlobalTheme = function(event) {
    const current = localStorage.getItem(THEME_KEY) || "light";
    const next = current === "light" ? "dark" : "light";
    
    // Circular reveal animation if browser supports document.startViewTransition
    if (!document.startViewTransition || !event) {
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      return next;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: next === 'dark' ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 400,
          easing: 'ease-in',
          pseudoElement: next === 'dark' ? '::view-transition-new(root)' : '::view-transition-old(root)',
        }
      );
    });

    return next;
  };
})();
