
import { appState, loadAppState, saveAppState } from './variables.js';

loadAppState();

let editingRow = null;

function updateIncomeDisplay() 
{
    const display = document.getElementById('incomeDisplay');
    if (display) {
        display.textContent = '$' + appState.balance.toFixed(2);
    }
}

function initIncomePage() 
{
    updateIncomeDisplay();

    const incomeEntries = document.getElementById('incomeEntries');
    const addButton = document.getElementById('addBtn');
    const incomeForm = document.getElementById('incomeForm');

    if (!incomeEntries || !addButton || !incomeForm) {
        return;
    }

    incomeEntries.addEventListener('click', (event) => 
    {
        const button = event.target.closest('button');
        if (!button) return;

        const row = button.closest('tr');
        if (!row) return;

        if (button.classList.contains('editBtn')) 
        {
            const dateCell = row.cells[0];
            const sourceCell = row.cells[1];
            const amountCell = row.cells[2];
            const notesCell = row.cells[3];

            document.getElementById('incomeDate').value = dateCell.textContent;
            document.getElementById('incomeSource').value = sourceCell.textContent;
            document.getElementById('incomeAmount').value = amountCell.textContent;
            document.getElementById('incomeNotes').value = notesCell.textContent;

            const amountToRemove = parseFloat(row.cells[2].textContent);
            appState.balance -= amountToRemove;

            addButton.textContent = 'Update Income';
            editingRow = row;
            row.remove();
            updateIncomeDisplay();
        }

        if (button.classList.contains('deleteBtn')) 
        {
            const amountToRemove = parseFloat(row.cells[2].textContent);
            appState.balance -= amountToRemove;

            updateIncomeDisplay();
            
            row.remove();
        }

        saveAppState();
    });

    incomeForm.addEventListener('submit', (event) => 
    {
        event.preventDefault();

        const date = document.getElementById('incomeDate').value;
        const source = document.getElementById('incomeSource').value;
        const amount = document.getElementById('incomeAmount').value;
        const notes = document.getElementById('incomeNotes').value;

        if (!date || !source || !amount) {
            alert('Please complete date, source, and amount fields.');
            return false;
        }

        const amountValue = parseFloat(amount);
        
        appState.balance += amountValue;

        updateIncomeDisplay();

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${date}</td>
            <td>${source}</td>
            <td>${Number(amountValue).toFixed(2)}</td>
            <td>${notes}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>
        `;

        incomeEntries.appendChild(newRow);
        editingRow = null;
        addButton.textContent = 'Add Income';
        document.getElementById('incomeDate').value = '';
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
        document.getElementById('incomeNotes').value = '';

        saveAppState();

        return false;
    });
}

document.addEventListener('DOMContentLoaded', initIncomePage);
