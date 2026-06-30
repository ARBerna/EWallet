export const appState = {
    balance: 500.00,
    transactions: [], 
    income: 50.00,
    expenses: 80.00,
    accountCreated: false,
    isLoggedIn: false,
    username: "(Username)",

    loadExpenses() {
        try {
           
            const saved = localStorage.getItem('appState');
            this.transactions = []; 
            
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    this.accountCreated = !!parsed.accountCreated;
                    this.isLoggedIn = !!parsed.isLoggedIn;
                    this.username = parsed.username || "(Username)";
                    this.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
                }
            } else {
               
                const stored = localStorage.getItem('ewallet_expenses');
                if (stored) {
                    this.transactions = JSON.parse(stored);
                }
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
            
            saveAppState();

            window.dispatchEvent(new CustomEvent('stateUpdated'));
        } catch (error) {
            console.error("Error saving expense storage state:", error);
        }
    },

    updateTotals() {
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        let calculatedExpenses = 0;
        
        const baseBalance = parseFloat(localStorage.getItem('ewallet_baseBalance')) || 500.00;
        const baseIncome = parseFloat(localStorage.getItem('ewallet_baseIncome')) || 50.00;

        let calculatedIncome = baseIncome; 
        let runningBalance = baseBalance;
        
        this.transactions.forEach(t => {
            const amount = parseFloat(t.amount) || 0;
            const dateStr = t.date ? String(t.date) : '';

            if (t.type === 'income') {
                runningBalance += amount;
                if (dateStr.startsWith(currentMonthStr)) {
                    calculatedIncome += amount;
                }
            } else if (t.type === 'expense') {
                runningBalance -= amount;
                if (dateStr.startsWith(currentMonthStr)) {
                    calculatedExpenses += amount;
                }
            }
        });

        this.expenses = calculatedExpenses;
        this.income = calculatedIncome;
        this.balance = runningBalance; 
    }
};

export function saveAppState() {
    try {
        localStorage.setItem('appState', JSON.stringify({
            accountCreated: appState.accountCreated || false,
            isLoggedIn: appState.isLoggedIn || false,
            username: appState.username || "(Username)",
            passwordHash: appState.passwordHash || "",
            transactions: appState.transactions || []
        }));

        if (appState.isLoggedIn && appState.username) {
            let accounts = [];
            const stored = localStorage.getItem('ewallet_accounts_db');
            if (stored) accounts = JSON.parse(stored);

            const idx = accounts.findIndex(a => a.username.toLowerCase() === appState.username.toLowerCase());
            if (idx !== -1) {
                accounts[idx].transactions = appState.transactions || [];
                localStorage.setItem('ewallet_accounts_db', JSON.stringify(accounts));
            }
        }
    } catch (error) {
        console.error('Failed to parse saveAppState multi-account structure:', error);
    }
}

export function loadAppState() {
    const saved = localStorage.getItem('appState');
    if (!saved) {
        if (typeof appState.updateTotals === 'function') appState.updateTotals();
        return;
    }

    try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
            if (parsed.accountCreated !== undefined) appState.accountCreated = parsed.accountCreated;
            if (parsed.isLoggedIn !== undefined) appState.isLoggedIn = parsed.isLoggedIn;
            if (parsed.username !== undefined) appState.username = parsed.username;
            if (parsed.passwordHash !== undefined) appState.passwordHash = parsed.passwordHash;
            if (parsed.transactions) appState.transactions = parsed.transactions;
            
            appState.updateTotals();
            window.appState = appState;
        }
    } catch (error) {
        console.error('Failed to load appState from localStorage:', error);
    }
}


if (typeof window !== 'undefined') {
    loadAppState();
    window.appState = appState;

    window.addEventListener('storage', (event) => {
        if (event.key === 'appState') {
            loadAppState();
            window.dispatchEvent(new CustomEvent('stateUpdated'));
        }
    });
}