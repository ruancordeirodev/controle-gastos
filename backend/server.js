const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// evita erro de favicon
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// rota raiz (evita "Cannot GET /")
app.get("/", (req, res) => {
  res.send("API de controle de gastos rodando 🚀");
});

let transactions = [];

// GET - listar
app.get("/transactions", (req, res) => {
  res.json(transactions);
});

// POST - adicionar
app.post("/transactions", (req, res) => {
  const { description, amount, type, category } = req.body;

  if (!description || !amount || !type) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  const newTransaction = {
    id: Date.now(),
    description,
    amount,
    type,
    category: category || "geral"
  };

  transactions.push(newTransaction);
  res.json(newTransaction);
});

// DELETE - remover
app.delete("/transactions/:id", (req, res) => {
  const id = Number(req.params.id);
  transactions = transactions.filter(t => t.id !== id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});