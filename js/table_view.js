const token = localStorage.getItem("token");
if (!token) window.location.href = "auth/login.html";

const tableId = localStorage.getItem("tableId");
if (!tableId) {
  alert("No table selected");
  window.location.href = "index.html";
}

let currentPage = 1;
let totalPages = 1;
let loading = false;
let columns = [];

const msg = document.getElementById("msg");
const loader = document.getElementById("loader");
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
const tableNameEl = document.getElementById("tableName");

async function fetchTable(page = 1) {
  try {
    loading = true;
    loader.classList.remove("hidden");

    const res = await fetch(`${url}/view-table/${tableId}?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    // if (res.status === 401) window.location.href = "auth/login.html";
    if (!res.ok) throw new Error(data.error || "Failed to load table data");

    renderTable(data, page > 1);
    currentPage = data.pagination.current_page;
    totalPages = data.pagination.total_pages;
    loading = false;
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.className = "text-red-600 font-semibold text-center mb-4";
    loading = false;
  } finally {
    loader.classList.add("hidden");
  }
}

function renderTable(data, append = false) {
  tableNameEl.textContent = data.table_name;

  if (!append) {
    columns = data.columns;
    tableHead.innerHTML = `
      <tr>
        <th class="px-4 py-2 text-left">#</th>
        ${columns.map(c => `<th class="px-4 py-2 text-left">${c}</th>`).join("")}
      </tr>
    `;
    tableBody.innerHTML = "";
  }

  const startIndex = (data.pagination.current_page - 1) * data.pagination.per_page;
  tableBody.innerHTML += data.data.map((row, index) => `
    <tr class="border-b hover:bg-gray-50 transition">
      <td class="px-4 py-2">${startIndex + index + 1}</td>
      ${columns.map(col => `<td class="px-4 py-2">${row[col] ?? ""}</td>`).join("")}
    </tr>
  `).join("");
}

window.addEventListener("scroll", () => {
  if (loading) return;
  if (currentPage >= totalPages) return;

  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    fetchTable(currentPage + 1);
  }
});

fetchTable(1);
