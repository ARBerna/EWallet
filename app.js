
let planInfo = new Map();


function syncStorage() {
    localStorage.setItem('executed_plans', JSON.stringify(getAll()));
    renderUI();
}

function loadStorage() {
    const stored = localStorage.getItem('executed_plans');
    if (stored) {
        const rawList = JSON.parse(stored);
        rawList.forEach(item => planInfo.set(item.id, item));
    }
}


function createPurchase(purchaseTitle, purchaseAmt, purchaseCategory, planDate, existingId = null) {
    const newForm = {
        id: existingId || crypto.randomUUID(), 
        purchaseTitle: purchaseTitle,
        purchaseAmt: parseFloat(purchaseAmt),
        
        purchaseCategory: purchaseCategory || (purchaseTitle.toLowerCase().includes('vacation') || purchaseTitle.toLowerCase().includes('trip') ? 'fun' : 'Tech'),
        planDate: planDate, 
    };

    if (newForm.id) {
        planInfo.set(newForm.id, newForm);
        syncStorage();
    }
}


function getAll() {
    return Array.from(planInfo.values());
}


function updatedPurchase(id, updatedForm) {
    if (planInfo.has(id)) {
        planInfo.set(id, updatedForm);
        syncStorage();
    }
}


function deletePurchase(id) {
    if (planInfo.has(id)) {
        planInfo.delete(id);
        syncStorage();
    }
}


const form = document.getElementById('purchaseForm');
const container = document.getElementById('plansContainer');
const counter = document.getElementById('totalPlansCount');

function renderUI() {
    const plans = getAll();
    counter.innerText = `${plans.length} Active Plans`;

    container.innerHTML = plans.map(p => `
        <div class="purchase-item-card" data-id="${p.id}">
            <div class="meta-block">
                <span class="purchase-title">${p.purchaseTitle}</span>
                <div class="purchase-timeline">
                    <span class="badge ${p.purchaseCategory.toLowerCase() === 'fun' ? 'badge-fun' : 'badge-tech'}">${p.purchaseCategory}</span>
                    Plan Date: ${p.planDate}
                </div>
            </div>
            <div class="financial-block">
                <span class="purchase-cost">$${p.purchaseAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div class="btn-action-group">
                    <button class="btn-icon btn-icon-edit" onclick="editPlan('${p.id}')" title="Edit Plan">✏️</button>
                    <button class="btn-icon btn-icon-delete" onclick="deletePlan('${p.id}')" title="Delete Plan">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}


form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value; 

    const editId = form.dataset.editId;
    if (editId) {
        const updatedForm = {
            id: editId,
            purchaseTitle: title,
            purchaseAmt: parseFloat(amount),
            purchaseCategory: category,
            planDate: date,
            isPurchased: false
        };
        updatedPurchase(editId, updatedForm);
         
        delete form.dataset.editId;
        form.querySelector('.btn-submit').innerText = 'Schedule Purchase';
    } else {
        createPurchase(title, amount, category, date);
    }

    form.reset();
});

window.deletePlan = (id) => {
    deletePurchase(id);
};

window.editPlan = (id) => {
    const target = planInfo.get(id);
    if (!target) return;

    document.getElementById('title').value = target.purchaseTitle;
    document.getElementById('amount').value = target.purchaseAmt;
    document.getElementById('date').value = target.planDate;

    form.dataset.editId = id;
    form.querySelector('.btn-submit').innerText = 'Update Plan';
};

loadStorage();
renderUI();
