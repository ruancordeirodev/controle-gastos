const form = document.getElementById("form");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");

const list = document.getElementById("list");
const balanceEl = document.getElementById("balance");
const ctx = document.getElementById("chart");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let chart;

function updateChart(income, expense) {
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

function updateUI() {
  list.innerHTML = "";

  let income = 0;
  let expense = 0;

  transactions.forEach((t) => {

    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }

    const li = document.createElement("li");

    li.innerHTML = `
      <span>${t.description} (${t.category})</span>
      <span>${t.type === "income" ? "+" : "-"} R$ ${t.amount.toFixed(2)}</span>
    `;

    list.appendChild(li);
  });

  const balance = income - expense;

  balanceEl.innerHTML = `
    Saldo: R$ ${balance.toFixed(2)} <br>
    <small>Receitas: R$ ${income.toFixed(2)} | Despesas: R$ ${expense.toFixed(2)}</small>
  `;

  updateChart(income, expense);

  localStorage.setItem("transactions", JSON.stringify(transactions));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  transactions.push({
    id: Date.now(),
    description: description.value,
    amount: Number(amount.value),
    type: type.value,
    category: category.value
  });

  description.value = "";
  amount.value = "";

  updateUI();
});

updateUI();