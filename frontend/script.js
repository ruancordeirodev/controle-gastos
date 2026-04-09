const STORAGE_KEY = "finance_v10";

let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];


// ELEMENTOS

const form = document.getElementById("form");
const list = document.getElementById("list");

const incomeEl = document.getElementById("income-total");
const expenseEl = document.getElementById("expense-total");
const balanceEl = document.getElementById("balance");


// SAVE

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// =====================
// ADD TRANSACTION
// =====================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  const transaction = {
    id: crypto.randomUUID(),
    description,
    amount,
    type,
    category,
    date: new Date().toISOString()
  };

  transactions.push(transaction);
  save();
  form.reset();
  render();
});

// =====================
// REMOVE
// =====================
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
}

// =====================
// ANALYTICS
// =====================
function analyze(transactions) {

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expense;

  const categories = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  const topCategory = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])[0];

  const expenseRatio = income > 0 ? expense / income : 1;

  let weekendExpense = 0;

  transactions.forEach(t => {
    if (t.type !== "expense") return;

    const day = new Date(t.date).getDay();
    if (day === 0 || day === 6) weekendExpense += t.amount;
  });

  const weekendRatio = expense > 0 ? weekendExpense / expense : 0;

  let score = 100;

  score -= expenseRatio * 50;
  if (balance < 0) score -= 25;
  if (weekendRatio > 0.5) score -= 15;
  if (topCategory && topCategory[1] > expense * 0.6) score -= 10;

  score = Math.max(0, Math.min(100, score));

  const last5 = transactions.slice(-5);
  const last5Expense = last5
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const trend = last5Expense > expense * 0.4 ? "up" : "stable";

  const avgExpense = expense / (transactions.length || 1);
  const forecast = income - avgExpense * 1.1;

  return {
    income,
    expense,
    balance,
    score: Math.round(score),
    trend,
    forecast,
    topCategory,
    weekendRatio
  };
}

// =====================
// INSIGHTS
// =====================
function insights(a) {
  const msg = [];

  if (a.score >= 80) msg.push("Saúde financeira excelente");
  else if (a.score >= 50) msg.push("Saúde financeira moderada");
  else msg.push("Risco financeiro alto");

  if (a.weekendRatio > 0.5) msg.push("Gastos no fim de semana elevados");
  if (a.trend === "up") msg.push("Gastos em crescimento");
  if (a.forecast < 0) msg.push("Projeção futura negativa");

  return msg;
}

// =====================
// LISTA
// =====================
function renderList() {
  list.innerHTML = "";

  transactions.forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${t.description} (${t.category})</span>
      <strong>${t.type === "expense" ? "-" : "+"} R$ ${t.amount}</strong>
      <button onclick="removeTransaction('${t.id}')">X</button>
    `;

    list.appendChild(li);
  });
}


// DASHBOARD

function renderDashboard(a) {
  incomeEl.textContent = `R$ ${a.income.toFixed(2)}`;
  expenseEl.textContent = `R$ ${a.expense.toFixed(2)}`;
  balanceEl.textContent = `R$ ${a.balance.toFixed(2)}`;
}


// GRÁFICO

let chartInstance = null;

function renderChart(a) {
  const ctx = document.getElementById("chart").getContext("2d");

  const data = {
    labels: ["Entradas", "Despesas"],
    datasets: [{
      label: "Financeiro",
      data: [a.income, a.expense],
      backgroundColor: ["#2ecc71", "#e74c3c"]
    }]
  };

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data
  });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const a = analyze(transactions);
  const ins = insights(a);

  doc.setFontSize(14);
  doc.text("RELATÓRIO FINANCEIRO", 10, 10);

  doc.setFontSize(11);
  doc.text(`Entradas: R$ ${a.income.toFixed(2)}`, 10, 25);
  doc.text(`Despesas: R$ ${a.expense.toFixed(2)}`, 10, 35);
  doc.text(`Saldo: R$ ${a.balance.toFixed(2)}`, 10, 45);
  doc.text(`Score: ${a.score}`, 10, 55);

  let y = 70;
  doc.text("INSIGHTS:", 10, y);
  y += 10;

  ins.forEach(i => {
    doc.text("- " + i, 10, y);
    y += 10;
  });

  doc.save("relatorio_financeiro.pdf");
}


function render() {
  const analysis = analyze(transactions);

  renderList();
  renderDashboard(analysis);
  renderChart(analysis);

  console.log("SCORE:", analysis.score);
}


render();


// EVENTS

document.getElementById("export").addEventListener("click", exportarPDF);