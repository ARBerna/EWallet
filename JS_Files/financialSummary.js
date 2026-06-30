import { appState } from '../variables.js';

// Load local storage raw transactions records
appState.loadExpenses();

const totalAmountEl = document.getElementById('totalAmount') || document.querySelector('[id*="totalAmount"]');
const incomeMonthEl = document.getElementById('incomeMonth') || document.querySelector('[id*="incomeMonth"]');
const expensesMonthEl = document.getElementById('expensesMonth')

//Update values
document.getElementById('totalAmount')?.setAttribute('textContent', '$' + appState.balance.toFixed(2));
document.getElementById('incomeMonth')?.setAttribute('textContent', '$' + appState.income.toFixed(2));
document.getElementById('expensesMonth')?.setAttribute('textContent', '$' + appState.expenses.toFixed(2));


// Update values only elements exist on the current state
if (totalAmountEl) totalAmountEl.textContent = '$' + appState.balance.toFixed(2);
if (incomeMonthEl) incomeMonthEl.textContent = '$' + appState.income.toFixed(2);
if (expensesMonthEl) expensesMonthEl.textContent = '$' + appState.expenses.toFixed(2);


//create pie chart
const ctx = document.getElementById('pieChart').getContext('2d');
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