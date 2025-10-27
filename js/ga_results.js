const token = localStorage.getItem("token");
if (!token) window.location.href = "auth/login.html";

const gaResultId = localStorage.getItem("gaResultId");
if (!gaResultId) {
  alert("No GA result selected");
  window.location.href = "index.html";
}

const msg = document.getElementById("msg");
const loader = document.getElementById("loader");

async function fetchGAResult() {
  msg.textContent = "Loading GA results...";
  loader.classList.remove("hidden");

  try {
    const res = await fetch(`${url}/ga-results/${gaResultId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      // window.location.href = "auth/login.html";
      return;
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load GA results");

    msg.textContent = "";
    renderGAResults(data);
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-600 font-semibold text-center mb-4";
  } finally {
    loader.classList.add("hidden");
  }
}

function renderGAResults(data) {
  const gaInfo = document.getElementById("gaInfo");
  gaInfo.innerHTML = `
    <div class="bg-white p-6 rounded-xl shadow space-y-2">
      <h2 class="text-lg font-semibold text-indigo-700 mb-2">Summary</h2>
      <p><strong>Best Overall Fitness:</strong> ${data.fitness}</p>
      <p><strong>Total Generations:</strong> ${data.summary.total_generations}</p>
      <p><strong>Average Fitness Across Generations:</strong> ${data.summary.avg_of_avgs}</p>
      <p><strong>Selected Features:</strong> ${data.selected_features.join(", ")}</p>
      <h3 class="text-md font-semibold mt-4 text-indigo-700">Best Chromosome:</h3>
      <p class="bg-gray-100 p-3 rounded text-sm overflow-x-auto">${JSON.stringify(data.best_chromosome, null, 2)}</p>
    </div>
  `;

  const ctx = document.getElementById("gaChart").getContext("2d");
  const labels = data.generations.map((g) => "Gen " + g.generation);
  const bestOverallProgress = data.generations.map(
    (g) => g.progressions[g.progressions.length - 1]?.best_overall_fitness || 0
  );
  const generationBestProgress = data.generations.map(
    (g) => g.progressions[g.progressions.length - 1]?.generation_best_fitness || 0
  );
  const avgFitness = data.generations.map((g) => g.avg_fitness);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Generation Best (Progression)",
          data: generationBestProgress,
          borderColor: "blue",
          fill: false,
        },
        {
          label: "Average Fitness",
          data: avgFitness,
          borderColor: "orange",
          fill: false,
        },
        {
          label: "Best Overall (Progression)",
          data: bestOverallProgress,
          borderColor: "green",
          borderDash: [5, 5],
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
    },
  });

  const gaTable = document.getElementById("gaTable");
  let tableHTML = `
    <table class="min-w-full bg-white rounded-xl shadow overflow-hidden">
      <thead class="bg-indigo-600 text-white">
        <tr>
          <th class="px-4 py-2 text-left">Generation</th>
          <th class="px-4 py-2 text-left">Best Fitness</th>
          <th class="px-4 py-2 text-left">Average Fitness</th>
          <th class="px-4 py-2 text-left">Best Genes</th>
        </tr>
      </thead>
      <tbody>
        ${data.generations
          .map(
            (g) => `
          <tr class="border-b hover:bg-gray-50">
            <td class="px-4 py-2">${g.generation}</td>
            <td class="px-4 py-2">${g.best_fitness}</td>
            <td class="px-4 py-2">${g.avg_fitness}</td>
            <td class="px-4 py-2"><p class="text-xs">${JSON.stringify(g.best_genes, null, 2)}</p></td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
  gaTable.innerHTML = tableHTML;
}

fetchGAResult();
