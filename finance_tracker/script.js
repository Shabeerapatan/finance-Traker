let chartLabels = []; // Transaction categories
let incomeData = []; // Income amounts
let expenseData = []; // Expense amounts

// Get HTML elements
const balanceEl = document.getElementById("balance");
const incomeTransactionsEl = document.getElementById("income-transactions");
const expenseTransactionsEl = document.getElementById("expense-transactions");
const transactionForm = document.getElementById("transaction-form");
const transactionTypeInput = document.getElementById("transaction-type");
const transactionAmountInput = document.getElementById("transaction-amount");
const transactionCategoryInput = document.getElementById(
  "transaction-category"
);

// Budgeting elements
const remainingBudgetDisplay = document.getElementById("remaining-budget");
const budgetStatusDisplay = document.getElementById("budget-status");

// Initialize transactions array from localStorage (or empty if none exists)
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Initialize the chart
const ctx = document.getElementById("chart-canvas").getContext("2d");
const myChart = new Chart(ctx, {
  type: "doughnut", // Doughnut chart for financial data
  data: {
    labels: chartLabels, // Labels for the x-axis (transaction categories)
    datasets: [
      {
        label: "Income",
        data: incomeData, // Income data for the chart
        backgroundColor: "rgba(75, 192, 192, 1)", // Color for income
      },
      {
        label: "Expenses",
        data: expenseData, // Expense data for the chart
        backgroundColor: "rgba(255, 99, 132, 1)", // Color for expenses
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  },
});

// Function to update the chart
function updateChart() {
  myChart.data.labels = chartLabels;
  myChart.data.datasets[0].data = incomeData;
  myChart.data.datasets[1].data = expenseData;
  myChart.update();
}

// Function to calculate and update balance
function updateBalance() {
  let balance = 0;
  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      balance += transaction.amount;
    } else if (transaction.type === "expense") {
      balance -= transaction.amount;
    }
  });
  balanceEl.textContent = balance.toFixed(2);
}

// Function to update the budget based on transactions
function updateBudget() {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((acc, item) => (acc += item.amount), 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, item) => (acc += item.amount), 0);

  const remainingBudget = (totalIncome - totalExpenses).toFixed(2);
  remainingBudgetDisplay.innerText = `$${remainingBudget}`;

  // Update status based on current expenses and total income
  if (totalExpenses > totalIncome) {
    budgetStatusDisplay.innerText = "Overspent";
    budgetStatusDisplay.style.color = "red";
  } else {
    budgetStatusDisplay.innerText = "On Budget";
    budgetStatusDisplay.style.color = "green";
  }
}

// Function to display transactions
function displayTransactions() {
  incomeTransactionsEl.innerHTML = "";
  expenseTransactionsEl.innerHTML = "";

  transactions.forEach((transaction) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `${transaction.date} - ${
      transaction.category
    } <span>$${transaction.amount.toFixed(2)}</span>`;

    if (transaction.type === "income") {
      listItem.classList.add("income");
      incomeTransactionsEl.appendChild(listItem);
    } else if (transaction.type === "expense") {
      listItem.classList.add("expense");
      expenseTransactionsEl.appendChild(listItem);
    }
  });
}

// Function to add a new transaction
function addTransaction(event) {
  event.preventDefault();

  const type = transactionTypeInput.value;
  const amount = Number(transactionAmountInput.value);
  const category = transactionCategoryInput.value;

  if (type === "" || isNaN(amount) || amount === 0 || category === "") {
    return;
  }

  // Get current date
  const date = new Date().toLocaleDateString(); // Format the date as needed

  // Create new transaction object
  const transaction = {
    type: type,
    amount: amount,
    category: category,
    date: date, // Add date to the transaction object
  };

  // Add transaction to the transactions array
  transactions.push(transaction);

  // Update localStorage
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Update balance, transactions, and budget
  updateBalance();
  displayTransactions();
  updateBudget();

  // Add data to chart
  chartLabels.push(category);
  if (type === "income") {
    incomeData.push(amount);
    expenseData.push(null); // Align expenses with income
  } else if (type === "expense") {
    expenseData.push(amount);
    incomeData.push(null); // Align income with expenses
  }

  // Update the chart
  updateChart();

  // Clear form inputs
  transactionTypeInput.value = "";
  transactionAmountInput.value = "";
  transactionCategoryInput.value = "";
}

// Add event listener to form submit
transactionForm.addEventListener("submit", addTransaction);

// Load and display existing transactions from localStorage when the page loads
function loadTransactions() {
  transactions.forEach((transaction) => {
    chartLabels.push(transaction.category);
    if (transaction.type === "income") {
      incomeData.push(transaction.amount);
      expenseData.push(null);
    } else if (transaction.type === "expense") {
      expenseData.push(transaction.amount);
      incomeData.push(null);
    }
  });
  displayTransactions();
  updateBalance();
  updateBudget();
  updateChart();
}

// Load transactions on page load
loadTransactions();
