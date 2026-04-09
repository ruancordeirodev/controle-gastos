const form = document.getElementById("form");
const list = document.getElementById("list");
const balance = document.getElementById("balance");

let transactions = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  transactions.push({ description, amount, type });

  updateUI();
  form.reset();
});

function updateUI() {
  list.innerHTML = "";

  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    const li = document.createElement("li");
    li.textContent = `${t.description} - R$ ${t.amount.toFixed(2)}`;
    list.appendChild(li);
  });

  balance.textContent = `Saldo: R$ ${(income - expense).toFixed(2)}`;
}