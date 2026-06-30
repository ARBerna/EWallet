 export const appState = {
    balance: 500.00,
    transactions: [], 
    income: 50.00,
    expenses: 80.00,

    loadExpenses() {
        try {
            const stored = localStorage.getItem('ewallet_expenses');
            this.transactions = []; 
            if (stored) {
                this.transactions = JSON.parse(stored);
            }
            if (typeof this.updateTotals === 'function') this.updateTotals();
        } catch (error) {
            console.error("Error reading expense storage state:", error);
        }
    },

    syncExpenses() {
        try {
            if (typeof this.updateTotals === 'function') this.updateTotals();
            localStorage.setItem('ewallet_expenses', JSON.stringify(this.transactions));

            window.dispatchEvent(new CustomEvent('stateUpdated'));
        } catch (error) {
            console.error("Error saving expense storage state:", error);
        }
    },

        updateTotals() {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let calculatedExpenses = 0;
        let calculatedIncome = 50.00; 
        let runningBalance = 500.00;
        this.transactions.forEach(t => {
            const amount = parseFloat(t.amount) || 0;

            // FIXED: Process transaction data dynamically while cross-checking the local date month string safely
            if (t.type === 'income') {
                runningBalance += amount;
                if (t.date && t.date.startsWith(currentMonthStr)) {
                    calculatedIncome += amount;
                }
            } else if (t.type === 'expense') {
                runningBalance -= amount;
                if (t.date && t.date.startsWith(currentMonthStr)) {
                    calculatedExpenses += amount;
                }
            }
        });

        this.expenses = calculatedExpenses;
        this.income = calculatedIncome;
        this.balance = runningBalance; 
    }
};


function saveAppState() {
    localStorage.setItem('appState', JSON.stringify(appState));
}

function loadAppState() {
    const saved = localStorage.getItem('appState');
    if (!saved) return;

    try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {

            if (parsed.transactions) appState.transactions = parsed.transactions;
            appState.updateTotals();
            window.appState = appState;
        }
    } catch (error) {
        console.log('Failed to load appState from localStorage:', error);
    }
}

loadAppState();
window.appState = appState;
