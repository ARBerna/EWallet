let expenseInfo = new Map();
const form = document.getElementById('expenseForm');
const tableBody = document.getElementById('expenseEntriesTableBody');

function syncStorage() {
    localStorage.setItem('ewallet_expenses', JSON.stringify(getAllExpenses()));
    renderUI();
}

function loadStorage() {
    const stored = localStorage.getItem('ewallet_expenses');
    if (stored) {
        const rawList = JSON.parse(stored);
        rawList.forEach(item => expenseInfo.set(item.id, item));
    }
}

function createExpense(date, source, amount, category, notes, existingId = null) {
    const record = {
        id: existingId || crypto.randomUUID(),
        date: date,
        source: source,
        amount: parseFloat(amount),
        category: category,
        notes: notes || ""
    };
    expenseInfo.set(record.id, record);
    syncStorage();
}

function getAllExpenses() {
    return Array.from(expenseInfo.values());
}

function updateExpense(id, updatedRecord) {
    if (expenseInfo.has(id)) {
        expenseInfo.set(id, updatedRecord);
        syncStorage();
    }
}

function deleteExpense(id) {
    if (expenseInfo.has(id)) {
        expenseInfo.delete(id);
        syncStorage();
    }
}

function renderUI() {
    const list = getAllExpenses();
            
    // Calculate financial summary results
    let totalSum = 0;
    let currentMonthSum = 0;
    const currentMonthStr = new Date().toISOString().slice(0, 7); // Format: "YYYY-MM"

    tableBody.innerHTML = list.map(e => {
        totalSum += e.amount;
        if (e.date.startsWith(currentMonthStr)) {
            currentMonthSum += e.amount;
        }

        return `
            <tr data-id="${e.id}">
                <td>${e.date}</td>
                <td>${e.source}</td>
                <td><span style="font-weight:bold; font-size:0.85em;">[${e.category}]</span></td>
                <td>$${e.amount.toFixed(2)}</td>
                <td>${e.notes}</td>
                <td>
                    <button onclick="editExpense('${e.id}')">Edit</button>
                    <button onclick="deleteExpenseRecord('${e.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    // Update upper layout display sums
    document.getElementById('totalAmountDisplay').innerText = `$${totalSum.toFixed(2)}`;
    document.getElementById('monthAmountDisplay').innerText = `$${currentMonthSum.toFixed(2)}`;
}

form.addEventListener('submit', (ev) => {
    ev.preventDefault();
            
    const date = document.getElementById('expensesDate').value;
    const source = document.getElementById('expensesSource').value;
    const amount = document.getElementById('expensesAmount').value;
    const category = document.getElementById('expensesCategory').value;
    const notes = document.getElementById('expensesNotes').value;
    const editId = form.dataset.editId;

    if (editId) {
        const updatedRecord = {
            id: editId,
            date: date,
            source: source,
            amount: parseFloat(amount),
            category: category,
            notes: notes
        };
        updateExpense(editId, updatedRecord);
        delete form.dataset.editId;
        document.getElementById('submitBtn').innerText = 'Add Expense';
    } else {
        createExpense(date, source, amount, category, notes);
    }

    form.reset();
});

window.deleteExpenseRecord = (id) => {
            deleteExpense(id);
};

window.editExpense = (id) => {
    const target = expenseInfo.get(id);
    if (!target) return;

    document.getElementById('expensesDate').value = target.date;
    document.getElementById('expensesSource').value = target.source;
    document.getElementById('expensesAmount').value = target.amount;
    document.getElementById('expensesCategory').value = target.category;
    document.getElementById('expensesNotes').value = target.notes;

    form.dataset.editId = id;
    document.getElementById('submitBtn').innerText = 'Update Expense';
};

// load the App View
loadStorage();
renderUI();