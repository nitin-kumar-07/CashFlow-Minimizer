// Cashflow Minimizer - Beginner Friendly Version
// This script lets you add, display, settle, and delete transactions
// All data is stored in localStorage so it stays after reloading the page

// Get transactions from localStorage or start with an empty array
let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update the dashboard summary (total transactions, amount, active members)
function updateDashboard() {
  // Total transactions
  document.getElementById('totalTransactions').textContent = transactions.length;
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  document.getElementById('totalAmount').textContent = '₹' + total.toLocaleString();
  const members = new Set();
  transactions.forEach(t => {
    members.add(t.payer);
    members.add(t.receiver);
  });
  document.getElementById('activeMembers').textContent = members.size;
}

// Show all transactions in the UI
function displayTransactions() {
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  if (transactions.length === 0) {
    document.getElementById('empty-transactions').classList.remove('hidden');
    updateDashboard();
    return;
  } else {
    document.getElementById('empty-transactions').classList.add('hidden');
  }
  // Show each transaction as a card
  transactions.slice(-10).reverse().forEach(t => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between gap-4 rounded-xl shadow glass px-5 py-4 border-l-4 ' +
      (t.payer === getCurrentUser() ? 'border-red-500 bg-red-50/60' : 'border-green-500 bg-green-50/60');
    div.innerHTML = `
      <div>
        <strong>${t.payer}</strong> pays <strong>₹${t.amount}</strong> to <strong>${t.receiver}</strong>
        <div class="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <i class="fas fa-calendar-alt"></i>
          <span>${new Date(t.date).toLocaleDateString()} ${new Date(t.date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      </div>
      <button onclick="deleteTransaction(${t.id})" class="text-red-500 hover:text-red-700 p-2 rounded-full"><i class="fas fa-trash"></i></button>
    `;
    list.appendChild(div);
  });
  updateDashboard();
}

// Get the current user (for demo, just return a placeholder)
function getCurrentUser() {
  return localStorage.getItem('user') || 'You';
}

// Add a new transaction
function addTransaction() {
  // Get values from input fields
  const payer = document.getElementById('payer').value.trim();
  const receiver = document.getElementById('receiver').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  // Basic validation
  if (!payer || !receiver || payer === receiver || isNaN(amount) || amount <= 0) {
    showNotification('Please enter valid payer, receiver, and a positive amount.', 'error');
    return;
  }
  // Create a transaction object
  const transaction = {
    id: Date.now(),
    payer,
    receiver,
    amount,
    date: new Date().toISOString()
  };
  // Add to the array and save
  transactions.push(transaction);
  saveTransactions();
  // Clear the form
  document.getElementById('payer').value = '';
  document.getElementById('receiver').value = '';
  document.getElementById('amount').value = '';
  // Update the UI
  displayTransactions();
  showNotification('Transaction added!', 'success');
  calculateSettlement(); // Update settlements
}

// Delete a transaction by id
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  displayTransactions();
  showNotification('Transaction deleted.', 'success');
  calculateSettlement(); // Update settlements
}

// Calculate and display settlements
function calculateSettlement() {
  if (transactions.length === 0) {
    showNotification('No transactions to settle.', 'info');
    return;
  }
  // Calculate net balances for each user
  const balances = {};
  transactions.forEach(t => {
    balances[t.payer] = (balances[t.payer] || 0) - Number(t.amount);
    balances[t.receiver] = (balances[t.receiver] || 0) + Number(t.amount);
  });
  // Find who owes (negative) and who is owed (positive)
  const creditors = Object.entries(balances).filter(([_, v]) => v > 0).map(([k, v]) => [k, v]);
  const debtors = Object.entries(balances).filter(([_, v]) => v < 0).map(([k, v]) => [k, -v]);
  let settlements = [];
  let i = 0, j = 0;
  // Greedy algorithm: debtor pays creditor
  while (i < creditors.length && j < debtors.length) {
    const [creditor, credit] = creditors[i];
    const [debtor, debt] = debtors[j];
    const amount = Math.min(credit, debt);
    settlements.push({ from: debtor, to: creditor, amount }); // Debtor pays Creditor
    creditors[i][1] -= amount;
    debtors[j][1] -= amount;
    if (creditors[i][1] === 0) i++;
    if (debtors[j][1] === 0) j++;
  }
  // Show settlements in the UI
  const container = document.getElementById('settlement');
  container.innerHTML = '';
  if (settlements.length === 0) {
    container.innerHTML = '<div class="text-slate-500">All transactions are settled!</div>';
    return;
  }
  settlements.forEach(s => {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-4 rounded-xl shadow glass px-5 py-4 border-l-4 border-blue-500 bg-blue-50/60';
    div.innerHTML = `<span class="font-semibold">${s.from}</span> pays <span class="font-bold text-blue-700">₹${s.amount}</span> to <span class="font-semibold">${s.to}</span>`;
    container.appendChild(div);
  });
  showNotification('Settlement calculated!', 'success');
}

// Show a simple notification
function showNotification(msg, type) {
  // type can be 'success', 'error', 'info'
  const toast = document.createElement('div');
  toast.className = 'toast-animate glass px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 bg-gradient-to-r ' +
    (type === 'success' ? 'from-green-500 to-blue-400 text-white' : type === 'error' ? 'from-pink-500 to-yellow-400 text-white' : 'from-blue-400 to-slate-200 text-slate-800');
  toast.innerHTML = `<span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.classList.add('opacity-0','translate-y-4'), 2000);
  setTimeout(() => toast.remove(), 2500);
}

// Reset all transactions
function resetAll() {
  if (!confirm('Are you sure you want to reset all transactions?')) return;
  transactions = [];
  saveTransactions();
  displayTransactions();
  updateDashboard();
  // Clear settlements
  const settlement = document.getElementById('settlement');
  if (settlement) settlement.innerHTML = '';
  showNotification('All transactions have been reset.', 'success');
  calculateSettlement(); // Update settlements
}

// Initialize the app on page load
window.onload = function() {
  displayTransactions();
  updateDashboard();
  calculateSettlement(); // Show settlements on load
};
