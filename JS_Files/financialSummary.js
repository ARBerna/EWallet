import { appState } from '../variables.js';

//update values
document.getElementById('totalAmount').textContent = '$' + appState.balance.toFixed(2);
document.getElementById('incomeMonth').textContent = '$' + appState.income.toFixed(2);
document.getElementById('expensesMonth').textContent = '$' + appState.expenses.toFixed(2);

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