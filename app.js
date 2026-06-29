
document.addEventListener('DOMContentLoaded', () => {
    const hasExpenseView = !!document.getElementById('expenseForm');
    const hasPlanningView = !!document.getElementById('planningForm');

    if (hasExpenseView) {
        initExpensesFeature();
    } else if (hasPlanningView) {
        initPlanningFeature();
    }
});

// EXPENSE FEATURE CONTROLLER
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
            expenseInfo.set(editId, { id: editId, date, source, amount, category, notes });
            delete form.dataset.editId;
            document.getElementById('submitBtn').innerText = 'Add Expense';
        } else {
            const id = crypto.randomUUID();
            expenseInfo.set(id, { id, date, source, amount, category, notes });
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
            expenseInfo.delete(id);
            appState.syncExpenses();
            renderExpenseUI();
        } else if (action === 'edit') {
            const target = expenseInfo.get(id);
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
        const list = Array.from(expenseInfo.values());
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
                        <button data-action="edit" data-id="${e.id}">Edit</button>
                        <button data-action="delete" data-id="${e.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('totalAmountDisplay').innerText = `$${totalSum.toFixed(2)}`;
        document.getElementById('monthAmountDisplay').innerText = `$${currentMonthSum.toFixed(2)}`;
    }
}

// PLANNING FEATURE CONTROLLER
function initPlanningFeature() {
    const form = document.getElementById('planningForm');
    
    appState.loadPlanning();
    appState.loadExpenses();
    renderPlanningUI();

    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        
        const date = document.getElementById('planningDate').value;
        const amount = parseFloat(document.getElementById('planningAmount').value);
        const id = crypto.randomUUID();

        planningInfo.set(id, { id, date, amount });
        appState.syncPlanning();
        renderPlanningUI();
        form.reset();
    });

    function renderPlanningUI() {
        const plans = Array.from(planningInfo.values());
        const expenses = Array.from(expenseInfo.values());
        const currentMonthStr = new Date().toISOString().slice(0, 7);

        // Calculate Plan Goals
        let totalPlanned = plans.reduce((sum, p) => sum + p.amount, 0);
        let monthPlanned = plans.filter(p => p.date.startsWith(currentMonthStr)).reduce((sum, p) => sum + p.amount, 0);
        
        let totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        let remainingValue = CONFIG_BASELINES.DEFAULT_GOAL_TARGET - totalExpenses;

        document.getElementById('totalPlanningAmountDisplay').innerText = `$${totalPlanned.toFixed(2)}`;
        document.getElementById('monthPlanningAmountDisplay').innerText = `$${monthPlanned.toFixed(2)}`;
        document.getElementById('remainingTillGoalDisplay').innerText = `$${Math.max(0, remainingValue).toFixed(2)}`;
    }
}
