
    import { appState } from '../variables.js';
    
    const incomeEntries = document.getElementById('incomeEntries');
    const addButton = document.getElementById('addBtn');
    let editingRow = null;

    function updateIncomeDisplay() {
        document.getElementById('incomeDisplay').textContent = '$' + appState.balance.toFixed(2);
    }

    incomeEntries.addEventListener('click', (event) => 
    {
        const target = event.target;
        
        if (target.classList.contains('editBtn')) 
        {
            const row = target.closest('tr');
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
            saveAppState();
        }

        if (target.classList.contains('deleteBtn')) {
            const row = target.closest('tr');

            const amountToRemove = parseFloat(row.cells[2].textContent);
            appState.balance -= amountToRemove;

            updateIncomeDisplay();
            saveAppState();

            row.remove();
        }
    });

    function submitForm(event) {
        event.preventDefault();

        const date = document.getElementById('incomeDate').value;
        const source = document.getElementById('incomeSource').value;
        const amount = document.getElementById('incomeAmount').value;
        const notes = document.getElementById('incomeNotes').value;

        if (!date || !source || !amount) {
            alert('Please complete date, source, and amount fields.');
            return false;
        }

        appState.balance += parseFloat(amount);
        updateIncomeDisplay();
        saveAppState();

        const tbody = document.getElementById('incomeEntries');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${date}</td>
            <td>${source}</td>
            <td>${Number(amount).toFixed(2)}</td>
            <td>${notes}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>
        `;

        tbody.appendChild(newRow);
        editingRow = null;
        addButton.textContent = 'Add Income';
        document.getElementById('incomeDate').value = '';
        document.getElementById('incomeSource').value = '';
        document.getElementById('incomeAmount').value = '';
        document.getElementById('incomeNotes').value = '';

        return false;
    }

    document.getElementById('incomeForm').addEventListener('submit', submitForm);
    updateIncomeDisplay();
