const form = document.getElementById("form");
const list = document.getElementById("list");

const filterType = document.getElementById("filter-type");
const filterCategory = document.getElementById("filter-category");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income-total");
const expenseEl = document.getElementById("expense-total");

const exportBtn = document.getElementById("export");

const STORAGE_KEY = "transactions_v6";

let transactions = load();
let editId = null;

let chart;

updateUI();

// ADD / EDIT
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  if (!description || amount <= 0) return;

  if (editId) {
    transactions = transactions.map(t =>
      t.id === editId ? { ...t, description, amount, type, category } : t
    );
    editId = null;
  } else {
    transactions.push({
      id: Date.now(),
      description,
      amount,
      type,
      category
    });
  }

  save();
  updateUI();
  form.reset();
});

// DELETE
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  updateUI();
}

// EDIT
function editTransaction(id) {
  const t = transactions.find(t => t.id === id);
  if (!t) return;

  document.getElementById("description").value = t.description;
  document.getElementById("amount").value = t.amount;
  document.getElementById("type").value = t.type;
  document.getElementById("category").value = t.category;

  editId = id;
}

// FILTERS
filterType.addEventListener("change", updateUI);
filterCategory.addEventListener("change", updateUI);

// UI
function updateUI() {
  list.innerHTML = "";

  let filtered = transactions;

  if (filterType.value !== "all") {
    filtered = filtered.filter(t => t.type === filterType.value);
  }

  if (filterCategory.value !== "all") {
    filtered = filtered.filter(t => t.category === filterCategory.value);
  }

  filtered.forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${t.description} - R$ ${t.amount.toFixed(2)} (${t.category})</span>
      <div>
        <button onclick="editTransaction(${t.id})">Editar</button>
        <button onclick="deleteTransaction(${t.id})">X</button>
      </div>
    `;

    list.appendChild(li);
  });

  const income = transactions.filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions.filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  incomeEl.textContent = `R$ ${income.toFixed(2)}`;
  expenseEl.textContent = `R$ ${expense.toFixed(2)}`;
  balanceEl.textContent = `R$ ${(income - expense).toFixed(2)}`;

  updateChart(income, expense);
}

// CHART
function updateChart(income, expense) {
  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [income, expense]
      }]
    }
  });
}

// EXPORT CSV
exportBtn.addEventListener("click", () => {
  let csv = "Descrição,Valor,Tipo,Categoria\n";

  transactions.forEach(t => {
    csv += `${t.description},${t.amount},${t.type},${t.category}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "gastos.csv";
  a.click();
});

// STORAGE
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function load() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}