import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, "..", "db.json");

app.use(cors());
app.use(express.json());
app.use(cors());

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const writeDB = (data: any) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const generateId = (collection: any[]) =>
  Math.max(0, ...collection.map((x) => x.id)) + 1;

// ====== ITEMS ======

app.get("/items", (req, res) => {
  const db = readDB();
  res.json(db.items);
});

app.get("/items/:id", (req, res) => {
  const db = readDB();
  const item = db.items.find((i: any) => i.id == req.params.id);
  if (!item) return res.status(404).json({ error: "Item não encontrado" });
  res.json(item);
});

app.post("/items", (req, res) => {
  const db = readDB();
  const newItem = { id: generateId(db.items), ...req.body };
  db.items.push(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

app.patch("/items/:id", (req, res) => {
  const db = readDB();
  const itemIndex = db.items.findIndex((i: any) => i.id == req.params.id);
  if (itemIndex === -1)
    return res.status(404).json({ error: "Item não encontrado" });
  db.items[itemIndex] = { ...db.items[itemIndex], ...req.body };
  writeDB(db);
  res.json(db.items[itemIndex]);
});

// ====== PLAYERS ======

app.get("/players", (req, res) => {
  const db = readDB();
  res.json(db.players);
});

app.get("/players/:id", (req, res) => {
  const db = readDB();
  const player = db.players.find((p: any) => p.id == req.params.id);
  if (!player) return res.status(404).json({ error: "Player não encontrado" });
  res.json(player);
});

app.post("/players", (req, res) => {
  const db = readDB();
  const newPlayer = { id: generateId(db.players), ...req.body };
  db.players.push(newPlayer);
  writeDB(db);
  res.status(201).json(newPlayer);
});

app.patch("/players/:id", (req, res) => {
  const db = readDB();
  const playerIndex = db.players.findIndex((p: any) => p.id == req.params.id);
  if (playerIndex === -1)
    return res.status(404).json({ error: "Player não encontrado" });
  db.players[playerIndex] = { ...db.players[playerIndex], ...req.body };
  writeDB(db);
  res.json(db.players[playerIndex]);
});

app.delete("/players/:id", (req, res) => {
  const db = readDB();
  db.players = db.players.filter((p: any) => p.id != req.params.id);
  writeDB(db);
  res.status(204).send();
});

// ====== ADMINS ======

app.get("/admins", (req, res) => {
  const db = readDB();
  res.json(db.admins);
});

app.get("/admins/:id", (req, res) => {
  const db = readDB();
  const admin = db.admins.find((a: any) => a.id == req.params.id);
  if (!admin) return res.status(404).json({ error: "Admin não encontrado" });
  res.json(admin);
});

app.post("/admins", (req, res) => {
  const db = readDB();
  const newAdmin = { id: generateId(db.admins), ...req.body };
  db.admins.push(newAdmin);
  writeDB(db);
  res.status(201).json(newAdmin);
});

// ====== TRANSACTIONS ======

app.get("/transactions", (req, res) => {
  const db = readDB();
  let transactions = db.transactions;
  const { itemId, playerId, tipo, _sort, _order } = req.query;

  if (itemId)
    transactions = transactions.filter((t: any) => t.itemId == itemId);
  if (playerId)
    transactions = transactions.filter((t: any) => t.playerId == playerId);
  if (tipo) transactions = transactions.filter((t: any) => t.tipo == tipo);

  if (_sort && _order) {
    transactions.sort((a: any, b: any) => {
      const aVal = a[_sort as string];
      const bVal = b[_sort as string];
      return _order === "desc"
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal);
    });
  }

  res.json(transactions);
});

app.post("/transactions", (req, res) => {
  const db = readDB();
  const newTransaction = { id: generateId(db.transactions), ...req.body };
  db.transactions.push(newTransaction);
  writeDB(db);
  res.status(201).json(newTransaction);
});

// ====== MOCK AUTH ======

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({
      token: "mock-jwt-token",
      user: { id: 1, username: "admin", role: "admin" },
    });
  }
  res.status(401).json({ error: "Credenciais inválidas" });
});

// ====== START SERVER ======

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
