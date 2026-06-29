

export const appState = {
    balance: 500.00,
    transactions: [], 
    income: 50.00,
    expenses: 80.00,


    // Loads saved expense records from localStorage 
    loadExpenses() {
        try {
            const stored = localStorage.getItem('ewallet_expenses');
            this.transactions = [];
            if (stored) {
                this.transactions = JSON.parse(stored);
            }
        } catch (error) {
            console.error("Critical error reading expense storage state:", error);
        }
    },

    syncExpenses() {
        try {
            localStorage.setItem('ewallet_expenses', JSON.stringify(this.transactions));
        } catch (error) {
            console.error("Critical error saving expense storage state:", error);
        }
    }
};
