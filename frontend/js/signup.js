document.getElementById("signupBtn").onclick = () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("pass").value.trim();
  if(!email.includes("@")) return toast("Valid email enter cheyyi ✅", "error");
  if(pass.length < 1) return toast("Password enter cheyyi ✅", "error");

  setUser(email);
  toast("✅ Account created & logged in!", "success");
  setTimeout(()=> window.location.href = "index.html", 180);
};
