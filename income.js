import { appState, loadAppState, saveAppState } from './variables.js';

if (typeof loadAppState === 'function') loadAppState();

let editingRow = null;
// Track active update identifiers without destroying state array sequences
let editTransactionId = null;

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;'
    }[m]));
}

function updateIncomeDisplay() 
{
    const display = document.getElementById('incomeDisplay');
    if (display) {
        display.textContent = '$' + (Number(appState.balance) || 0).toFixed(2);
    }
}

// Global renderer wrapper helper to keep data states tightly synchronized
function renderIncomeEntriesFromState() {
    const incomeEntries = document.getElementById('incomeEntries');
    if (!incomeEntries) return;

    const incomes = appState.transactions.filter(t => t.type === 'income');
    incomeEntries.innerHTML = incomes.map(i => {
        const safeId = escapeHTML(i.id);
        return `
            <tr data-id="${safeId}">
                <td>${escapeHTML(i.date)}</td>
                <td>${escapeHTML(i.source)}</td>
                <td>$${(Number(i.amount) || 0).toFixed(2)}</td>
                <td>${escapeHTML(i.notes)}</td>
                <td>
                    <button class="editBtn" data-id="${safeId}">Edit</button>
                    <button class="deleteBtn" data-id="${safeId}">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function initIncomePage() 
{
    if (!appState.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    const usernameContainer = document.querySelector('.username-text') || document.querySelector('h2');
    if (usernameContainer && appState.accountCreated && appState.username) {
        const cleanName = escapeHTML(appState.username);
        if (usernameContainer.innerHTML.includes('(Username)')) {
            usernameContainer.innerHTML = usernameContainer.innerHTML.replace('(Username)', cleanName);
        } else {
            usernameContainer.textContent = cleanName;
        }
    }

    updateIncomeDisplay();
    renderIncomeEntriesFromState();

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

        const id = row.dataset.id || button.dataset.id;

        if (button.classList.contains('editBtn')) 
        {
            const target = id ? appState.transactions.find(t => t.id === id) : appState.transactions.find(t => 
                t.type === 'income' && 
                t.date === row.cells[0].textContent && 
                t.source === row.cells[1].textContent
            );

            if (!target) return;

            document.getElementById('incomeDate').value = target.date || '';
            document.getElementById('incomeSource').value = target.source || '';
            document.getElementById('incomeAmount').value = target.amount || '';
            document.getElementById('incomeNotes').value = target.notes || '';
            
            editTransactionId = target.id;

            addButton.textContent = 'Update Income';
            editingRow = row;
            row.remove();
            updateIncomeDisplay();
        }

        if (button.classList.contains('deleteBtn')) 
        {
            const dateCell = row.cells[0];
            const sourceCell = row.cells[1];
            const amountCell = row.cells[2];
            const amountToRemove = parseFloat(amountCell.textContent.replace('$', '')) || 0;

            if (id) {
                appState.transactions = appState.transactions.filter(t => t.id !== id);
            } else {
                appState.transactions = appState.transactions.filter(t => 
                    !(t.type === 'income' && t.date === dateCell.textContent && t.source === sourceCell.textContent && t.amount === amountToRemove)
                );
            }

            appState.syncExpenses();

            updateIncomeDisplay();
            renderIncomeEntriesFromState();
            
            row.remove();
            
            if (editTransactionId === id) {
                incomeForm.reset();
                editTransactionId = null;
                addButton.textContent = 'Add Income';
                editingRow = null;
            }
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

        const amountValue = parseFloat(amount) || 0;
        
        const safeUUID = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        };

        if (editTransactionId) {
            const idx = appState.transactions.findIndex(t => t.id === editTransactionId);
            if (idx !== -1) {
                appState.transactions[idx] = { id: editTransactionId, type: 'income', date, source, amount: amountValue, notes };
            }
            editTransactionId = null;
        } else {
            appState.transactions.push({
                id: safeUUID(),
                type: 'income',
                date: date,
                source: source,
                amount: amountValue,
                notes: notes
            });
        }

        appState.syncExpenses();

        updateIncomeDisplay();

        const newRow = document.createElement('tr');
        const internalAssignedId = appState.transactions[appState.transactions.length - 1]?.id || '';
        newRow.setAttribute('data-id', escapeHTML(internalAssignedId));
        
        newRow.innerHTML = `
            <td>${escapeHTML(date)}</td>
            <td>${escapeHTML(source)}</td>
            <td>$${Number(amountValue).toFixed(2)}</td>
            <td>${escapeHTML(notes)}</td>
            <td>
                <button class="editBtn" data-id="${escapeHTML(internalAssignedId)}">Edit</button>
                <button class="deleteBtn" data-id="${escapeHTML(internalAssignedId)}">Delete</button>
            </td>
        `;

        incomeEntries.appendChild(newRow);
        renderIncomeEntriesFromState(); 
        
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

window.addEventListener('storage', (event) => {
    if (event.key === 'appState') {
        if (typeof loadAppState === 'function') loadAppState();
        
        if (!appState.isLoggedIn) {
            const isSubPage = window.location.pathname.includes('/HTML_Files/');
            window.location.href = isSubPage ? '../index.html' : 'index.html';
            return;
        }
        
        const usernameContainer = document.querySelector('.username-text') || document.querySelector('h2');
        if (usernameContainer && appState.username) {
            usernameContainer.textContent = escapeHTML(appState.username);
        }

        updateIncomeDisplay();
        renderIncomeEntriesFromState();
    }
});

document.addEventListener('DOMContentLoaded', initIncomePage);
