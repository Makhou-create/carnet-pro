// CARNET PRO - Version de démonstration

let customers = [];

function saveData() {
  localStorage.setItem("carnetProCustomers", JSON.stringify(customers));
}

function loadData() {
  const saved = localStorage.getItem("carnetProCustomers");
  customers = saved ? JSON.parse(saved) : [];
  renderCustomers();
  updateTotal();
}

function addCustomer() {
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();

  if (!name) {
    alert("Entre le nom du client.");
    return;
  }

  customers.push({
    id: Date.now(),
    name,
    phone,
    balance: 0,
    history: []
  });

  saveData();
  renderCustomers();
  updateTotal();

  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
}

function addCredit(id, amount, description = "") {
  const customer = customers.find(c => c.id === id);
  if (!customer || amount <= 0) return;

  customer.balance += amount;
  customer.history.push({
    type: "credit",
    amount,
    description,
    date: new Date().toLocaleDateString("fr-FR")
  });

  saveData();
  renderCustomers();
  updateTotal();
}

function addPayment(id, amount) {
  const customer = customers.find(c => c.id === id);
  if (!customer || amount <= 0) return;

  if (amount > customer.balance) {
    alert("Le paiement dépasse la dette du client.");
    return;
  }

  customer.balance -= amount;
  customer.history.push({
    type: "payment",
    amount,
    date: new Date().toLocaleDateString("fr-FR")
  });

  saveData();
  renderCustomers();
  updateTotal();
}

function renderCustomers() {
  const list = document.getElementById("customerList");
  if (!list) return;

  list.innerHTML = "";

  customers.forEach(customer => {
    const item = document.createElement("div");
    item.className = "customer-item";

    item.innerHTML = `
      <strong>${escapeHTML(customer.name)}</strong>
      <p>${escapeHTML(customer.phone || "")}</p>
      <p>Dette : ${customer.balance.toLocaleString("fr-FR")} FCFA</p>
      <button onclick="recordCredit(${customer.id})">Ajouter un crédit</button>
      <button onclick="recordPayment(${customer.id})">Enregistrer un paiement</button>
    `;

    list.appendChild(item);
  });
}

function updateTotal() {
  const total = customers.reduce((sum, c) => sum + c.balance, 0);
  const element = document.getElementById("totalDebt");
  if (element) {
    element.textContent = total.toLocaleString("fr-FR") + " FCFA";
  }
}

function recordCredit(id) {
  const amount = Number(prompt("Montant du crédit en FCFA :"));
  if (!Number.isFinite(amount) || amount <= 0) return;

  const description = prompt("Description (facultatif) :") || "";
  addCredit(id, amount, description);
}

function recordPayment(id) {
  const amount = Number(prompt("Montant payé en FCFA :"));
  if (!Number.isFinite(amount) || amount <= 0) return;

  addPayment(id, amount);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.addEventListener("DOMContentLoaded", loadData);
