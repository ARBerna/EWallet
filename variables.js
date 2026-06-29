var appState = {
    balance: 500,
    transactions: [],
    income: 50,
    expenses: 80
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
        console.error('Failed to load appState from localStorage:', error);
    }
}

loadAppState();
window.appState = appState;