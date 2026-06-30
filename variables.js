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
        } catch (error) {
            console.error("Error reading expense storage state:", error);
        }
    },

    syncExpenses() {
        try {
            localStorage.setItem('ewallet_expenses', JSON.stringify(this.transactions));
        } catch (error) {
            console.error("Error saving expense storage state:", error);
        }
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
            appState = Object.assign(appState, parsed);
            window.appState = appState;
        }
    } catch (error) {
        console.log('Failed to load appState from localStorage:', error);
    }
}

loadAppState();
window.appState = appState;
