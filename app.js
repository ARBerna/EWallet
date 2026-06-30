import { appState } from '../variables.js';

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;'
    }[m]));
}

document.addEventListener('DOMContentLoaded', () => {
    const hasExpenseView = !!document.getElementById('expenseForm');
    const hasPlanningView = !!document.getElementById('planningForm');

    if (hasExpenseView) {
        initExpensesFeature();
    } else if (hasPlanningView) {
        initPlanningFeature();
    }
});

function initExpensesFeature() {
    const form = document.getElementById('expenseForm');
    const tableBody = document.getElementById('expenseEntriesTableBody');
    
    appState.loadExpenses();
    renderExpenseUI();

    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const date = document.getElementById('expensesDate').value;
        const source = document.getElementById('expensesSource').value;
        const amount = parseFloat(document.getElementById('expensesAmount').value);
        const category = document.getElementById('expensesCategory').value;
        const notes = document.getElementById('expensesNotes').value;
        const editId = form.dataset.editId;

        if (editId) {
            const idx = appState.transactions.findIndex(t => t.id === editId && t.type === 'expense');
            if (idx !== -1) {
                appState.transactions[idx] = { id: editId, type: 'expense', date, source, amount, category, notes };
            }
            delete form.dataset.editId;
            document.getElementById('submitBtn').innerText = 'Add Expense';
        } else {
            const id = crypto.randomUUID();
            appState.transactions.push({ id, type: 'expense', date, source, amount, category, notes });
        }

        appState.syncExpenses();
        renderExpenseUI();
        form.reset();
    });

    tableBody.addEventListener('click', (ev) => {
        const actionBtn = ev.target.closest('button[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;

        if (action === 'delete') {
            appState.transactions = appState.transactions.filter(t => t.id !== id);
            appState.syncExpenses();
            renderExpenseUI();
        } else if (action === 'edit') {
            const target = appState.transactions.find(t => t.id === id);
            if (!target) return;

            document.getElementById('expensesDate').value = target.date;
            document.getElementById('expensesSource').value = target.source;
            document.getElementById('expensesAmount').value = target.amount;
            document.getElementById('expensesCategory').value = target.category;
            document.getElementById('expensesNotes').value = target.notes;

            form.dataset.editId = id;
            document.getElementById('submitBtn').innerText = 'Update Expense';
        }
    });

    function renderExpenseUI() {
        const expenses = appState.transactions.filter(t => t.type === 'expense');
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let localCalculatedBalance = appState.balance;
        let localCalculatedExpenses = 0;

        tableBody.innerHTML = expenses.map(e => {
            localCalculatedBalance -= e.amount;
            if (e.date.startsWith(currentMonthStr)) {
                localCalculatedExpenses += e.amount;
            }
            return `
                <tr data-id="${e.id}">
                    <td>${escapeHTML(e.date)}</td>
                    <td>${escapeHTML(e.source)}</td>
                    <td><span style="font-weight:bold; font-size:0.85em;">[${e.category}]</span></td>
                    <td>$${e.amount.toFixed(2)}</td>
                    <td>${escapeHTML(e.notes)}</td>
                    <td>
                        <button data-action="edit" data-id="${e.id}">Edit</button>
                        <button data-action="delete" data-id="${e.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        const totalAmountEl = document.getElementById('totalAmountDisplay');
        const monthAmountEl = document.getElementById('monthAmountDisplay');

       if (totalAmountEl) totalAmountEl.innerText = `$${appState.balance.toFixed(2)}`;
       if (monthAmountEl) monthAmountEl.innerText = `$${appState.expenses.toFixed(2)}`;
    }
}

function initPlanningFeature() {
    const form = document.getElementById('planningForm');
    const tableBody = document.getElementById('planningEntriesTableBody');
    
    appState.loadExpenses(); 

    const goalAmountInput = document.getElementById('goalAmount');
    if (goalAmountInput) {
        const savedGoal = localStorage.getItem('eWallet_planningGoal');
       
        if (savedGoal !== null) {
            goalAmountInput.value = savedGoal;
        }
        
        goalAmountInput.addEventListener('input', () => {
            localStorage.setItem('eWallet_planningGoal', goalAmountInput.value);
            renderPlanningUI();
        });
    }

    renderPlanningUI();
    
    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const date = document.getElementById('planningDate').value;
        const description = document.getElementById('planningDescription').value;
        const amount = parseFloat(document.getElementById('planningAmount').value);
        const savedAmount = parseFloat(document.getElementById('planningSavedAmount')?.value || 0);
        const editId = form.dataset.editId;

        if (editId) {
            const idx = appState.transactions.findIndex(t => t.id === editId && t.type === 'plan');
            if (idx !== -1) {
                 appState.transactions[idx] = { id: editId, type: 'plan', date, description, amount, savedAmount };
            }
            delete form.dataset.editId;
            document.getElementById('submitPlanBtn').innerText = 'Create Plan';
        } else {
            const id = crypto.randomUUID();
           appState.transactions.push({ id, type: 'plan', date, description, amount, savedAmount });
        }
        
        appState.syncExpenses();
        renderPlanningUI();
        form.reset();
    });

    tableBody.addEventListener('click', (ev) => {
        const actionBtn = ev.target.closest('button[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;

        if (action === 'delete') {
            appState.transactions = appState.transactions.filter(t => t.id !== id);
            appState.syncExpenses();
            renderPlanningUI();
        } else if (action === 'edit') {
            const target = appState.transactions.find(t => t.id === id);
            if (!target) return;

            document.getElementById('planningDate').value = target.date;
            document.getElementById('planningDescription').value = target.description;
            document.getElementById('planningAmount').value = target.amount;
            const savedAmountInput = document.getElementById('planningSavedAmount');
            if (savedAmountInput) savedAmountInput.value = target.savedAmount || 0;
            form.dataset.editId = id;
            document.getElementById('submitPlanBtn').innerText = 'Update Plan';
        }
    });

    function renderPlanningUI() {
        const plans = appState.transactions.filter(t => t.type === 'plan');
        const expenses = appState.transactions.filter(t => t.type === 'expense');
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let totalPlanned = plans.reduce((sum, p) => sum + p.amount, 0);
        let monthPlanned = plans.filter(p => p.date.startsWith(currentMonthStr)).reduce((sum, p) => sum + p.amount, 0);
        let totalSaved = plans.reduce((sum, p) => sum + (parseFloat(p.savedAmount) || 0), 0);
        
        const customGoalEl = document.getElementById('goalAmount');
        const activeGoalTarget = customGoalEl ? (parseFloat(customGoalEl.value) || 0) : 0.00;
        let totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        let remainingValue = Math.max(0, activeGoalTarget - totalSaved)

        tableBody.innerHTML = plans.map(p => `
            <tr data-id="${p.id}">
                <td>${escapeHTML(p.date)}</td>
                <td>${escapeHTML(p.description)}</td>
                <td>$${(parseFloat(p.savedAmount) || 0).toFixed(2)}</td>
                <td>$${p.amount.toFixed(2)}</td>
                <td>
                    <button data-action="edit" data-id="${p.id}">Edit</button>
                    <button data-action="delete" data-id="${p.id}">Delete</button>
                </td>
            </tr>
        `).join('');

        document.getElementById('totalPlanningAmountDisplay').innerText = `$${totalPlanned.toFixed(2)}`;
        document.getElementById('monthPlanningAmountDisplay').innerText = `$${monthPlanned.toFixed(2)}`;
        document.getElementById('totalSavedAmountDisplay').innerText = `$${totalSaved.toFixed(2)}`;
        document.getElementById('remainingTillGoalDisplay').innerText = `$${remainingValue.toFixed(2)}`;
        
 
    }
}
