const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const expenseForm = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const typeInput = document.getElementById("type");
const expenseList = document.getElementById("expense-list");
const filterCategory = document.getElementById("filter-category");
const clearAllBtn = document.getElementById("clear-all");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateValues() {
  let totalIncome = transactions
    .filter(item => item.amount > 0)
    .reduce((acc, item) => acc + item.amount, 0);

  let totalExpense = transactions
    .filter(item => item.amount < 0)
    .reduce((acc, item) => acc + item.amount, 0);

  let totalBalance = totalIncome + totalExpense;

  balance.innerText = totalBalance.toFixed(2);
  income.innerText = totalIncome.toFixed(2);
  expense.innerText = Math.abs(totalExpense).toFixed(2);

  updateChart();
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "expense" : "income");
  item.innerHTML = `
    <span>${transaction.date} | ${transaction.category} - ${transaction.title}</span>
    <span>${sign}₹${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  expenseList.appendChild(item);
}

function addTransaction(e) {
  e.preventDefault();
  if (titleInput.value.trim() === "" || amountInput.value.trim() === "") return;

  let amountValue = +amountInput.value;
  if (typeInput.value === "expense") {
    amountValue = -Math.abs(amountValue);
  } else {
    amountValue = Math.abs(amountValue);
  }

  const transaction = {
    id: Date.now(),
    title: titleInput.value,
    amount: amountValue,
    category: categoryInput.value,
    date: dateInput.value,
    type: typeInput.value
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  titleInput.value = "";
  amountInput.value = "";
  dateInput.value = "";

  init();
}

function removeTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  init();
}

function filterTransactions() {
  const category = filterCategory.value;
  expenseList.innerHTML = "";
  const filtered = category === "All" ? transactions : transactions.filter(t => t.category === category);
  filtered.forEach(addTransactionDOM);
  updateValues();
}

function clearAll() {
  if (confirm("Are you sure you want to delete all transactions?")) {
    transactions = [];
    localStorage.clear();
    init();
  }
}

function init() {
  expenseList.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

let chart;
function updateChart() {
  const categories = ["Food", "Travel", "Shopping", "Bills", "Others"];
  const data = categories.map(cat =>
    transactions.filter(t => t.category === cat && t.amount < 0)
                .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  );

  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels: categories,
      datasets: [{
        data: data,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4caf50", "#9966ff"]
      }]
    }
  });
}

expenseForm.addEventListener("submit", addTransaction);
filterCategory.addEventListener("change", filterTransactions);
clearAllBtn.addEventListener("click", clearAll);

init();
