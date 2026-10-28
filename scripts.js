const form = document.getElementById('transaction-form');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const clearBtn = document.getElementById('clear-btn');
const resetBtn = document.getElementById('reset-btn');

const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const currentBalanceEl = document.getElementById('current-balance');

const transactionList = document.getElementById('transaction-list');
const noTransactionsEl = document.getElementById('no-transactions');

const filterType = document.getElementById('filter-type');
const searchInput = document.getElementById('search-input');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function formatCurrency(amount) {
    return 'LKR ' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function (t) {
        const amount = parseFloat(t.amount);
        if (t.type === 'Income') {
            totalIncome += amount;
        } else if (t.type === 'Expense') {
            totalExpenses += amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    currentBalanceEl.textContent = formatCurrency(balance);
}

function renderTransactions() {
    const filter = filterType.value;
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredTransactions = transactions.filter(function (t) {
        const matchesType = filter === 'All' || t.type === filter;
        const matchesSearch =
            t.description.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm);
        return matchesType && matchesSearch;
    });

    transactionList.innerHTML = '';
    resetBtn.disabled = transactions.length === 0;

    if (filteredTransactions.length === 0) {
        noTransactionsEl.style.display = 'block';
    } else {
        noTransactionsEl.style.display = 'none';

        filteredTransactions.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        filteredTransactions.forEach(function (t) {
            const row = document.createElement('tr');

            const typeBadgeClass = t.type === 'Income' ? 'badge-income' : 'badge-expense';
            const amountClass = t.type === 'Income' ? 'amount-income' : 'amount-expense';
            const amountSign = t.type === 'Income' ? '+' : '-';

            row.innerHTML = `
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td><span class="badge ${typeBadgeClass}">${t.type}</span></td>
                <td>${t.category}</td>
                <td class="${amountClass}">${amountSign} ${formatCurrency(parseFloat(t.amount))}</td>
                <td><button class="btn btn-delete" data-id="${t.id}">Delete</button></td>
            `;

            transactionList.appendChild(row);
        });
    }

    document.querySelectorAll('.btn-delete').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            const id = e.target.getAttribute('data-id');
            deleteTransaction(id);
        });
    });
}

function addTransaction(e) {
    e.preventDefault();
    if (!typeInput.value || !descriptionInput.value.trim() || !amountInput.value || !categoryInput.value || !dateInput.value) {
        alert('Please fill in all fields.');
        return;
    }

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Amount must be greater than zero.');
        return;
    }

    const newTransaction = {
        id: Date.now().toString(),
        type: typeInput.value,
        description: descriptionInput.value.trim(),
        amount: amount.toFixed(2),
        category: categoryInput.value,
        date: dateInput.value
    };

    transactions.push(newTransaction);
    saveToLocalStorage();
    updateSummary();
    renderTransactions();
    resetForm();

    alert('Transaction added successfully!');
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(function (t) {
            return t.id !== id;
        });
        saveToLocalStorage();
        updateSummary();
        renderTransactions();
    }
}

function resetAllTransactions() {
    if (transactions.length === 0 || !confirm('Are you sure you want to delete all transactions? This cannot be undone.')) {
        return;
    }

    transactions = [];
    saveToLocalStorage();
    filterType.value = 'All';
    searchInput.value = '';
    updateSummary();
    renderTransactions();
}

function resetForm() {
    form.reset();
    setDefaultDate();
}

form.addEventListener('submit', addTransaction);
clearBtn.addEventListener('click', resetForm);
resetBtn.addEventListener('click', resetAllTransactions);
filterType.addEventListener('change', renderTransactions);
searchInput.addEventListener('input', renderTransactions);

function init() {
    setDefaultDate();
    updateSummary();
    renderTransactions();
}

document.addEventListener('DOMContentLoaded', init);