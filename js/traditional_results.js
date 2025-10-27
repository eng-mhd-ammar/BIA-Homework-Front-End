const token = localStorage.getItem("token");
if (!token) window.location.href = "auth/login.html";

const tableId = localStorage.getItem("tableId");
if (!tableId) {
  alert("No table selected");
  window.location.href = "index.html";
}

const msg = document.getElementById("msg");
const traditionalInfo = document.getElementById("traditionalInfo");
const ctx = document.getElementById("weightsChart").getContext("2d");

async function fetchTraditionalResult() {
  msg.textContent = "Loading Traditional Algorithm results...";
  try {
    const res = await fetch(`${url}/traditional-results/${tableId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // if (res.status === 401) window.location.href = "auth/login.html";

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load traditional results");

    msg.textContent = "";
    renderTraditionalResults(data);

  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-600 font-semibold text-center mb-4";
  }
}

function renderTraditionalResults(data) {
  traditionalInfo.innerHTML = `
    <p><strong>Best Chromosome:</strong> [${data.best_chromosome.join(", ")}]</p>
    <p><strong>Selected Features:</strong> [${data.selected_features.join(", ")}]</p>
    <p><strong>Feature Weights:</strong> [${data.feature_weights.map(w => w.toFixed(3)).join(", ")}]</p>
    <p><strong>Number of Features:</strong> ${data.best_chromosome.length}</p>
    <p><strong>Number of Selected Features:</strong> ${data.selected_features.length} / ${data.best_chromosome.length}</p>
  `;

  const labels = data.feature_weights.map((_, i) => `Feature ${i}`);
  const weights = data.feature_weights.map(w => w.toFixed(3));

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Feature Weight (Progression)",
        data: weights,
        borderColor: "blue",
        fill: false,
        tension: 0,
        pointRadius: 3,
        pointBackgroundColor: "blue"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

fetchTraditionalResult();
