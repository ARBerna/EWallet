import { appState } from '../variables.js';

if (typeof appState.loadExpenses === 'function') {
    appState.loadExpenses();
}

const totalAmountEl = document.getElementById('totalAmount') || document.querySelector('[id*="totalAmount"]');
const incomeMonthEl = document.getElementById('incomeMonth') || document.querySelector('[id*="incomeMonth"]');
const expensesMonthEl = document.getElementById('expensesMonth');

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;'
    }[m]));
}

function updateDashboardMetricsDisplay() {
    if (!appState.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    const totalTarget = document.getElementById('totalAmount');
    if (totalTarget) totalTarget.textContent = '$' + (Number(appState.balance) || 0).toFixed(2);
    const incomeTarget = document.getElementById('incomeMonth');
    if (incomeTarget) incomeTarget.textContent = '$' + (Number(appState.income) || 0).toFixed(2);
    const expensesTarget = document.getElementById('expensesMonth');
    if (expensesTarget) expensesTarget.textContent = '$' + (Number(appState.expenses) || 0).toFixed(2);

    const usernameContainer = document.querySelector('.username-text') || document.querySelector('h2');
    if (usernameContainer && appState.accountCreated && appState.username) {
        const cleanName = escapeHTML(appState.username);
        if (usernameContainer.innerHTML.includes('(Username)')) {
            usernameContainer.innerHTML = usernameContainer.innerHTML.replace('(Username)', cleanName);
        } else {
            usernameContainer.textContent = cleanName;
        }
    }

    if (totalAmountEl) totalAmountEl.textContent = '$' + (Number(appState.balance) || 0).toFixed(2);
    if (incomeMonthEl) incomeMonthEl.textContent = '$' + (Number(appState.income) || 0).toFixed(2);
    if (expensesMonthEl) expensesMonthEl.textContent = '$' + (Number(appState.expenses) || 0).toFixed(2);
}

let pieChartInstance = null;

function renderOrUpdateFinancialChart() {
    const chartCanvas = document.getElementById('pieChart');
    if (!chartCanvas || typeof Chart === 'undefined') return;
    const ctx = chartCanvas.getContext('2d');

    const currentIncome = Math.max(0, Number(appState.income) || 0);
    const currentExpenses = Math.max(0, Number(appState.expenses) || 0);
    const currentBalance = Math.max(0, Number(appState.balance) || 0);

    if (pieChartInstance) {
        pieChartInstance.data.datasets[0].data = [currentIncome, currentExpenses, currentBalance];
        pieChartInstance.update();
    } else {
        pieChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Income', 'Expenses', 'Balance'],
                datasets: [{
                    data: [currentIncome, currentExpenses, currentBalance],
                    backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 14 },
                            color: '#000000'
                        }
                    },
                    tooltip: {
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        callbacks: {
                            label: function(context) {
                                const val = context.raw || 0;
                                return ` ${context.label}: $${val.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function initSummaryPageLifecycle() {
    updateDashboardMetricsDisplay();
    renderOrUpdateFinancialChart();
}

window.addEventListener('storage', (event) => {
    if (event.key === 'appState') {
        if (typeof appState.loadExpenses === 'function') appState.loadExpenses();
        initSummaryPageLifecycle();
    }
});

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSummaryPageLifecycle);
    } else {
        initSummaryPageLifecycle();
    }
}
