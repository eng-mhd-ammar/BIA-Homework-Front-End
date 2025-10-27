const token = localStorage.getItem("token");
if (!token) window.location.href = "auth/login.html";

const tableList = document.getElementById("tableList");
const msg = document.getElementById("msg");
const loader = document.getElementById("loader");

const uploadBtn = document.getElementById("uploadBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadModal = document.getElementById("uploadModal");
const closeModal = document.getElementById("closeModal");
const uploadForm = document.getElementById("uploadForm");
const uploadMsg = document.getElementById("uploadMsg");
const uploadLoader = document.getElementById("uploadLoader");

async function fetchTables() {
  msg.textContent = "Loading your tables...";
  loader.classList.remove("hidden");
  tableList.innerHTML = "";

  try {
    const res = await fetch(`${url}/user-tables`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) window.location.href = "auth/login.html";

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load tables");

    msg.textContent = "";
    renderTables(data.tables);
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-600 font-semibold text-center mb-4";
  } finally {
    loader.classList.add("hidden");
  }
}

function renderTables(tables) {
  if (!tables.length) {
    tableList.innerHTML = `<p class='text-center col-span-full text-gray-500'>No tables uploaded yet.</p>`;
    return;
  }

  tableList.innerHTML = tables
    .map(
      (t) => `
      <div class="bg-white p-4 rounded-xl shadow hover:shadow-md transition">
        <h3 class="text-lg font-semibold text-indigo-700">${t.table_name}</h3>
        <a href="${url + t.source_file}"
            class="inline-block mt-1 px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            download>
            Download File
        </a>
        <div class="mt-3 text-sm">
          <p><strong>Genetic Algorithm Summary</strong></p>
          <p><strong>Fitness:</strong> ${t.ga_result?.fitness?.toFixed(3) || "—"}</p>
          <p><strong>Selected Features:</strong> ${t.ga_result?.selected_features?.length || 0}</p>
        </div>
        ${
          t.ga_result
            ? `
          <button onclick="viewTable(${t.id})"
              class="mt-2 w-full bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 text-sm">
              View Table Data
          </button>
          <button onclick="viewGAResults(${t.ga_result.id})"
              class="mt-3 w-full bg-green-600 text-white py-1 rounded-lg hover:bg-green-700 text-sm">
              View GA Results
          </button>`
            : ""
        }
        ${
          t.traditional_result
            ? `
        <button onclick="viewTraditionalResults(${t.id})"
            class="mt-2 w-full bg-orange-600 text-white py-1 rounded-lg hover:bg-orange-700 text-sm">
            View Traditional Results
        </button>`
            : ""
        }
      </div>
    `
    )
    .join("");
}

function viewTraditionalResults(tableId) {
  localStorage.setItem("tableId", tableId);
  window.location.href = "traditional_results.html";
}
function viewTable(tableId) {
  localStorage.setItem("tableId", tableId);
  window.location.href = "table_view.html";
}
function viewGAResults(gaResultId) {
  localStorage.setItem("gaResultId", gaResultId);
  window.location.href = "ga_results.html";
}

uploadBtn.addEventListener("click", () => {
  uploadModal.classList.remove("hidden");
});
closeModal.addEventListener("click", () => {
  uploadModal.classList.add("hidden");
  uploadMsg.textContent = "";
  uploadForm.reset();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "auth/login.html";
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  uploadMsg.textContent = "Uploading...";
  uploadLoader.classList.remove("hidden");

  const formData = new FormData(uploadForm);

  try {
    const res = await fetch(`${url}/upload/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      uploadMsg.textContent = "✅ " + data.message;
      uploadMsg.className = "text-green-600 text-center font-medium mt-3";
      await fetchTables();
      setTimeout(() => {
        uploadModal.classList.add("hidden");
        uploadForm.reset();
      }, 1000);
    } else {
      uploadMsg.textContent = "❌ " + (data.error || "Upload failed");
      uploadMsg.className = "text-red-600 text-center font-medium mt-3";
    }
  } catch {
    uploadMsg.textContent = "❌ Network error";
    uploadMsg.className = "text-red-600 text-center font-medium mt-3";
  } finally {
    uploadLoader.classList.add("hidden");
  }
});

fetchTables();
