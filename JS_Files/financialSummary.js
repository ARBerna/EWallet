import { appState } from '../variables.js';

// Load local transactions records
appState.loadExpenses();

const totalAmountEl = document.getElementById('totalAmount') || document.querySelector('[id*="totalAmount"]');
const incomeMonthEl = document.getElementById('incomeMonth') || document.querySelector('[id*="incomeMonth"]');
const expensesMonthEl = document.getElementById('expensesMonth')

//Update values
const totalTarget = document.getElementById('totalAmount');
if (totalTarget) totalTarget.textContent = '$' + appState.balance.toFixed(2);
const incomeTarget = document.getElementById('incomeMonth');
if (incomeTarget) incomeTarget.textContent = '$' + appState.income.toFixed(2);
const expensesTarget = document.getElementById('expensesMonth');
if (expensesTarget) expensesTarget.textContent = '$' + appState.expenses.toFixed(2);

const usernameContainer = document.querySelector('.username-text') || document.querySelector('h2');
if (usernameContainer && appState.accountCreated && appState.username) {
    usernameContainer.innerHTML = usernameContainer.innerHTML.replace('(Username)', String(appState.username)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
}

if (totalAmountEl) totalAmountEl.textContent = '$' + appState.balance.toFixed(2);
if (incomeMonthEl) incomeMonthEl.textContent = '$' + appState.income.toFixed(2);
if (expensesMonthEl) expensesMonthEl.textContent = '$' + appState.expenses.toFixed(2);


//create pie chart
const chartCanvas = document.getElementById('pieChart');
if (chartCanvas) {
const ctx = chartCanvas.getContext('2d');
const pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Income', 'Expenses', 'Balance'],
        datasets: [{
            data: [appState.income, appState.expenses, appState.balance],
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
                    font: {
                        size: 14
                    },
                    color: '#000000'
                }
            },
            tooltip: {
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                }
            }
        }
    }
});
}
