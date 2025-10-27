const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const loginBtn = document.getElementById("loginBtn");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const data = {
    username: form.username.value.trim(),
    password: form.password.value.trim(),
  };

  btnText.textContent = "Logging in...";
  spinner.classList.remove("hidden");
  loginBtn.disabled = true;
  loginBtn.classList.add("opacity-70", "cursor-not-allowed");
//   await new Promise(resolve => setTimeout(resolve, 2000));
  try {
    const res = await fetch(`${url}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      msg.textContent = "✅ " + result.message;
      msg.className = "text-green-600 font-semibold text-center mt-4";
      localStorage.setItem("token", result.token);

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    } else {
      msg.textContent = "❌ " + (result.error || "Invalid credentials");
      msg.className = "text-red-600 font-semibold text-center mt-4";
    }
  } catch (error) {
    console.error(error);
    msg.textContent = "❌ Network error";
    msg.className = "text-red-600 font-semibold text-center mt-4";
  } finally {
    btnText.textContent = "Login";
    spinner.classList.add("hidden");
    loginBtn.disabled = false;
    loginBtn.classList.remove("opacity-70", "cursor-not-allowed");
  }
});
