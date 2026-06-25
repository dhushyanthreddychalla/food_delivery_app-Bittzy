// js/login.js
function $(id){ return document.getElementById(id); }

function getNextPage(){
  const p = new URLSearchParams(window.location.search);
  return p.get("next") || "index.html"; // ✅ default HOME
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("fd_logged_in") === "true") {
    window.location.href = "index.html";
    return;
  }

  const form = $("loginForm");
  const email = $("email");
  const pass = $("password");
  const toggle = $("togglePass");

  toggle?.addEventListener("click", () => {
    const hide = pass.type === "password";
    pass.type = hide ? "text" : "password";
    toggle.textContent = hide ? "🙈" : "👁️";
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const em = (email.value || "").trim();
    const pw = (pass.value || "").trim();

    if (!em) { alert("Enter email"); return; }
    if (!pw) { alert("Enter password"); return; }

    localStorage.setItem("fd_logged_in", "true");
    localStorage.setItem("fd_user_email", em);

    window.location.href = getNextPage();
  });
});
