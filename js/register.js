const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");
const registerBtn = document.getElementById("registerBtn");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const data = {
    username: form.username.value.trim(),
    password: form.password.value.trim(),
  };

  btnText.textContent = "Registering...";
  spinner.classList.remove("hidden");
  registerBtn.disabled = true;
  registerBtn.classList.add("opacity-70", "cursor-not-allowed");

  try {
    const res = await fetch(`${url}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      msg.textContent = "✅ " + result.message;
      msg.className = "text-green-600 font-semibold text-center mt-4";
      form.reset();
      setTimeout(() => (window.location.href = "login.html"), 1000);
    } else {
      msg.textContent = "❌ " + (result.error || "Something went wrong");
      msg.className = "text-red-600 font-semibold text-center mt-4";
    }
  } catch (error) {
    msg.textContent = "❌ Network error";
    msg.className = "text-red-600 font-semibold text-center mt-4";
  } finally {
    btnText.textContent = "Register";
    spinner.classList.add("hidden");
    registerBtn.disabled = false;
    registerBtn.classList.remove("opacity-70", "cursor-not-allowed");
  }
});
