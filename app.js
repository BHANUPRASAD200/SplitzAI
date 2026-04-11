/**
 * Smart Expense Splitter - V8 Ecosystem Engine (Restored)
 * Features: Multi-Group, AI NLP, Pro Splitting, Avatars, Editing
 */

// --- Multi-Group Ecosystem State ---
let systemState = {
    activeGroupId: null,
    groups: []
};

// Pointer to the current active group
let state = {
    id: 'default',
    groupName: "New Group",
    members: [], 
    expenses: []
};

let filterMember = null;
let currentEditExpenseId = null;
let currentTheme = localStorage.getItem('splitzTheme') || 'light';
const exchangeRates = { INR: 1.0, USD: 83.0, EUR: 90.0, GBP: 105.0 };

// --- DOM Elements ---
const DOM = {
    groupNameInput: document.getElementById('group-name-input'),
    membersList: document.getElementById('members-list'),
    memberCount: document.getElementById('member-count'),
    addMemberForm: document.getElementById('add-member-form'),
    newMemberName: document.getElementById('new-member-name'),
    groupsList: document.getElementById('groups-list'),
    btnAddGroup: document.getElementById('btn-add-group'),
    
    totalExpenseEl: document.getElementById('total-expense'),
    expensesListEl: document.getElementById('expenses-list'),
    settlementsListEl: document.getElementById('settlements-list'),
    
    btnOpenModal: document.getElementById('btn-open-expense-modal'),
    btnCloseModal: document.getElementById('btn-close-expense-modal'),
    modalOverlay: document.getElementById('expense-modal'),
    
    addExpenseForm: document.getElementById('add-expense-form'),
    expenseDesc: document.getElementById('expense-desc'),
    expenseAmount: document.getElementById('expense-amount'),
    expenseCurrency: document.getElementById('expense-currency'),
    expensePayer: document.getElementById('expense-payer'),
    splitOptions: document.getElementById('split-options'),
    splitMethodSelect: document.getElementById('split-method-select'),
    
    aiAnalyticsContent: document.getElementById('analytics-content'),
    categoryChartContainer: document.getElementById('category-chart-container'),
    categoryBars: document.getElementById('category-bars'),
    
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnScanReceipt: document.getElementById('btn-scan-receipt'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    btnThemeToggleMobile: document.getElementById('btn-theme-toggle-mobile'),
    btnResetGroup: document.getElementById('btn-reset-group'),
    
    aiChatForm: document.getElementById('ai-chat-form'),
    aiChatInput: document.getElementById('ai-chat-input')
};

// --- Initialization & Migration ---
function init() {
    applyTheme(currentTheme);
    setupEventListeners();
    
    const legacy = localStorage.getItem('splitzState');
    const multi = localStorage.getItem('splitzGroupsV8');

    if (multi) {
        systemState = JSON.parse(multi);
    } else if (legacy) {
        const parsed = JSON.parse(legacy);
        const membersArr = Array.isArray(parsed.members) ? parsed.members : [];
        const firstGroup = {
            id: 'legacy_group_' + Date.now(),
            groupName: parsed.groupName || "My First Group",
            members: membersArr.map(m => {
                const nameStr = typeof m === 'string' ? m : (m.name || "Unknown");
                return {
                    id: 'mem_' + Math.random().toString(36).substr(2, 9),
                    name: nameStr,
                    avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${nameStr}`
                };
            }),
            expenses: parsed.expenses || []
        };
        systemState.groups = [firstGroup];
        systemState.activeGroupId = firstGroup.id;
        localStorage.removeItem('splitzState');
    }

    if (systemState.groups.length === 0) {
        const defaultGroup = {
            id: 'default',
            groupName: "Weekend Getaway",
            members: [
                { id: 'm1', name: 'Alice', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alice' },
                { id: 'm2', name: 'Bob', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Bob' },
                { id: 'm3', name: 'Charlie', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Charlie' }
            ],
            expenses: []
        };
        systemState.groups = [defaultGroup];
        systemState.activeGroupId = defaultGroup.id;
    }

    setActiveGroup(systemState.activeGroupId);
    saveData();
}

function setActiveGroup(id) {
    const g = systemState.groups.find(group => group.id === id);
    if (g) {
        state = g;
        systemState.activeGroupId = id;
        if (DOM.groupNameInput) DOM.groupNameInput.value = state.groupName;
        updateUI();
    }
}

function saveData() {
    localStorage.setItem('splitzGroupsV8', JSON.stringify(systemState));
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('splitzTheme', theme);
    const iconClass = theme === 'light' ? 'fa-moon' : 'fa-sun';
    const updateIcon = (btn) => {
        if (!btn) return;
        const icon = btn.querySelector('i');
        if (icon) icon.className = `fa-solid ${iconClass}`;
    };
    updateIcon(DOM.btnThemeToggle);
    updateIcon(DOM.btnThemeToggleMobile);
}

// --- Event Listeners ---
function setupEventListeners() {
    const toggleTheme = () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
    };

    if (DOM.btnThemeToggle) DOM.btnThemeToggle.addEventListener('click', toggleTheme);
    if (DOM.btnThemeToggleMobile) DOM.btnThemeToggleMobile.addEventListener('click', toggleTheme);
    
    DOM.btnAddGroup && DOM.btnAddGroup.addEventListener('click', () => {
        let name = prompt("Enter name for your new group:", "New Workspace");
        if (!name) name = "Group " + (systemState.groups.length + 1); 
        const newGroup = {
            id: 'group_' + Date.now(),
            groupName: name,
            members: [],
            expenses: []
        };
        systemState.groups.push(newGroup);
        setActiveGroup(newGroup.id);
        saveData();
    });
    
    DOM.btnResetGroup && DOM.btnResetGroup.addEventListener('click', () => {
        if(confirm("Are you sure? This clears ALL workspaces.")) {
            localStorage.removeItem('splitzGroupsV8');
            location.reload();
        }
    });

    DOM.groupNameInput && DOM.groupNameInput.addEventListener('input', (e) => {
        state.groupName = e.target.value;
        saveData();
        renderGroups();
    });

    DOM.addMemberForm && DOM.addMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = DOM.newMemberName.value.trim();
        if (name && !state.members.find(m => (typeof m === 'string' ? m : m.name) === name)) {
            const newMember = {
                id: 'mem_' + Date.now(),
                name: name,
                avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`
            };
            state.members.push(newMember);
            DOM.newMemberName.value = '';
            updateUI();
            saveData();
        }
    });

    DOM.btnOpenModal && DOM.btnOpenModal.addEventListener('click', () => {
        currentEditExpenseId = null;
        DOM.modalOverlay.querySelector('.modal-title').textContent = "Add New Expense";
        DOM.addExpenseForm.querySelector('button[type="submit"]').textContent = "Add Expense";
        DOM.addExpenseForm.reset();
        if (DOM.splitMethodSelect) DOM.splitMethodSelect.value = 'equally';
        populateModalOptions();
        DOM.modalOverlay.classList.add('active');
    });

    DOM.btnCloseModal && DOM.btnCloseModal.addEventListener('click', () => {
        DOM.modalOverlay.classList.remove('active');
    });

    DOM.splitMethodSelect && DOM.splitMethodSelect.addEventListener('change', () => {
        populateModalOptions();
    });

    DOM.addExpenseForm && DOM.addExpenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = DOM.expenseDesc.value.trim();
        const amount = parseFloat(DOM.expenseAmount.value);
        const payer = DOM.expensePayer.value;
        const splitMethod = DOM.splitMethodSelect.value;
        
        if (!desc || isNaN(amount) || amount <= 0) return;

        let finalAmountInr = amount;
        finalAmountInr = Math.round(finalAmountInr * 100) / 100;
        
        let splitAmong = [];
        let customSplit = null;

        if (splitMethod === 'equally') {
            const checkboxes = document.querySelectorAll('.split-options input[type="checkbox"]:checked');
            splitAmong = Array.from(checkboxes).map(cb => cb.value);
            if (splitAmong.length === 0) { alert("Select at least one person."); return; }
        } else {
            const inputs = document.querySelectorAll('.custom-split-input');
            customSplit = { method: splitMethod, values: {} };
            let totalWeights = 0;
            inputs.forEach(inp => {
                const val = parseFloat(inp.value) || 0;
                if (val > 0) {
                    customSplit.values[inp.dataset.member] = val;
                    totalWeights += val;
                    splitAmong.push(inp.dataset.member);
                }
            });
            if (splitAmong.length === 0) { alert("Assign values."); return; }
            if (splitMethod === 'percentage' && Math.abs(totalWeights - 100) > 0.1) {
                alert(`Percentages must sum to 100% (Current: ${totalWeights}%)`);
                return;
            }
        }

        const categoryInfo = categorizeExpense(desc);
        
        if (currentEditExpenseId) {
            const idx = state.expenses.findIndex(ex => ex.id === currentEditExpenseId);
            if (idx !== -1) {
                state.expenses[idx] = {
                    ...state.expenses[idx],
                    description: desc, amount: finalAmountInr, payer: payer,
                    splitAmong: splitAmong, customSplit: customSplit,
                    category: categoryInfo.name, icon: categoryInfo.icon, cssClass: categoryInfo.cssClass
                };
            }
        } else {
            const newExpense = {
                id: Date.now().toString(),
                description: desc, amount: finalAmountInr, payer: payer,
                splitAmong: splitAmong, customSplit: customSplit,
                category: categoryInfo.name, icon: categoryInfo.icon, cssClass: categoryInfo.cssClass,
                date: new Date().toLocaleDateString()
            };
            state.expenses.unshift(newExpense);
        }

        DOM.addExpenseForm.reset();
        DOM.modalOverlay.classList.remove('active');
        currentEditExpenseId = null;
        updateUI();
        saveData();
    });

    DOM.aiChatForm && DOM.aiChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = DOM.aiChatInput.value.trim();
        if (!input) return;
        const result = parseNLPExpense(input);
        if (result) {
            state.expenses.unshift(result);
            DOM.aiChatInput.value = '';
            updateUI();
            saveData();
            alert(`🤖 AI Added: ₹${result.amount.toFixed(2)} for ${result.description}`);
        } else {
            alert("🤖 AI couldn't parse that. Try 'Alice paid 500 for lunch split with Bob'.");
        }
    });
}

// --- UI Rendering ---
function renderGroups() {
    if (!DOM.groupsList) return;
    DOM.groupsList.innerHTML = '';
    const groups = Array.isArray(systemState.groups) ? systemState.groups : [];
    groups.forEach(g => {
        const div = document.createElement('div');
        div.className = `group-item ${systemState.activeGroupId === g.id ? 'active' : ''}`;
        div.onclick = () => { setActiveGroup(g.id); saveData(); };
        const gName = g.groupName || "Untitled Group";
        div.innerHTML = `<i class="fa-solid ${systemState.activeGroupId === g.id ? 'fa-folder-open' : 'fa-folder'}"></i><span>${gName}</span>`;
        DOM.groupsList.appendChild(div);
    });
}

function updateUI() {
    renderGroups();
    renderMembers();
    renderExpenses();
    renderSettlements();
    generateAnalytics();

    let total = 0, clearedInr = 0;
    state.expenses.forEach(ex => {
        if (ex.category !== 'Settlement') total += ex.amount;
        else clearedInr += ex.amount;
    });
    if (DOM.totalExpenseEl) DOM.totalExpenseEl.textContent = total.toFixed(2);
    
    const balances = calculateBalances();
    const settlements = simplifyDebts(balances);
    let activeDebtsInr = 0;
    settlements.forEach(s => activeDebtsInr += s.amount);
    
    if (document.getElementById('total-debts-val')) document.getElementById('total-debts-val').textContent = `₹${activeDebtsInr.toFixed(2)}`;
    if (document.getElementById('cleared-debts-val')) document.getElementById('cleared-debts-val').textContent = `₹${clearedInr.toFixed(2)}`;
    DOM.memberCount.innerText = state.members.length;
}

function renderMembers() {
    DOM.membersList.innerHTML = '';
    const balances = calculateBalances();
    state.members.forEach(member => {
        const name = typeof member === 'string' ? member : (member.name || "Unknown");
        const avatar = member.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`;
        const mid = member.id || ('m_' + Math.random());
        const li = document.createElement('li');
        li.className = 'member-item' + (filterMember === name ? ' filtered-active' : '');
        const amtInr = (balances[name] || 0) / 100;
        let balanceHTML = `<span class="balance-tag neutral">Settled</span>`;
        if (amtInr > 0) balanceHTML = `<span class="balance-tag positive">Owes you ₹${amtInr.toFixed(0)}</span>`;
        if (amtInr < 0) balanceHTML = `<span class="balance-tag negative">Owes ₹${Math.abs(amtInr).toFixed(0)}</span>`;
        li.onclick = (e) => { if(!e.target.closest('.remove-member')) setFilterMember(name); };
        li.innerHTML = `
            <div class="member-info"><img src="${avatar}" class="member-dp" alt="${name}">
            <div style="display:flex; flex-direction:column">
                <span style="font-weight:700">${name}</span>${balanceHTML}
            </div></div>
            <button class="remove-member" onclick="removeMember('${mid}')"><i class="fa-solid fa-trash-can"></i></button>`;
        DOM.membersList.appendChild(li);
    });
}

function renderExpenses() {
    DOM.expensesListEl.innerHTML = '';
    const displayList = filterMember ? state.expenses.filter(ex => ex.payer === filterMember || ex.splitAmong.includes(filterMember)) : state.expenses;
    if (displayList.length === 0) {
        DOM.expensesListEl.innerHTML = '<div class="empty-state">No expenses yet. Add one to get started!</div>';
        return;
    }
    displayList.forEach(ex => {
        const div = document.createElement('div');
        div.className = 'expense-row';
        const participants = ex.splitAmong.join(', ');
        let splitDetailHTML = `<div class="split-insight">Split with ${participants}</div>`;
        if (ex.category === 'Settlement') splitDetailHTML = ``;
        const amtStr = `₹${ex.amount.toFixed(2)}`;
        let amountHTML = `<div class="amount-debit">${amtStr}</div>`;
        if (ex.category === 'Settlement') amountHTML = `<div class="amount-credit">+ ${amtStr}</div>`;
        div.innerHTML = `
            <div class="expense-main"><div class="cat-icon ${ex.cssClass}"><i class="fa-solid ${ex.icon}"></i></div>
            <div><div class="expense-desc">${ex.description}</div>
            <div class="expense-meta">${ex.date} &bull; Paid by <strong>${ex.payer}</strong></div>${splitDetailHTML}
            </div></div><div class="expense-amount-wrap"><div class="expense-amount-info">${amountHTML}</div>
            <div class="expense-actions" style="display:flex; gap:0.25rem">
                <button class="btn-edit" onclick="editExpense('${ex.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-delete" onclick="deleteExpense('${ex.id}')"><i class="fa-solid fa-trash-can"></i></button>
            </div></div>`;
        DOM.expensesListEl.appendChild(div);
    });
}

function renderSettlements() {
    const balances = calculateBalances();
    const settlements = simplifyDebts(balances);
    if (settlements.length === 0) {
        DOM.settlementsListEl.innerHTML = `<div class="settled-up-msg"><i class="fa-regular fa-face-smile-wink"></i><p>You're all settled up!</p></div>`;
        return;
    }
    DOM.settlementsListEl.innerHTML = '';
    settlements.forEach(s => {
        const div = document.createElement('div');
        div.className = 'settlement-item';
        div.innerHTML = `<div class="settlement-text"><strong>${s.from}</strong> owes <strong>${s.to}</strong></div>
            <div style="display:flex; align-items:center; gap:1rem"><div class="settlement-amount">₹${s.amount.toFixed(2)}</div>
            <button class="btn-settle" onclick="settleDebt('${s.from}', '${s.to}', ${s.amount})">Settle</button></div>`;
        DOM.settlementsListEl.appendChild(div);
    });
}

function populateModalOptions(preservePayer = false) {
    let currentPayer = state.members[0]?.name;
    if (preservePayer && DOM.expensePayer.value) currentPayer = DOM.expensePayer.value;
    DOM.expensePayer.innerHTML = '';
    state.members.forEach(member => {
        const name = typeof member === 'string' ? member : (member.name || "Unknown");
        const option = document.createElement('option');
        option.value = name; option.textContent = name;
        if (name === currentPayer) option.selected = true;
        DOM.expensePayer.appendChild(option);
    });
    currentPayer = DOM.expensePayer.value;
    DOM.splitOptions.innerHTML = '';
    const method = DOM.splitMethodSelect.value;
    if (method === 'equally') {
        state.members.forEach(member => {
            const name = typeof member === 'string' ? member : (member.name || "Unknown");
            const label = document.createElement('label');
            label.className = 'split-checkbox active';
            const isPayer = name === currentPayer;
            label.innerHTML = `<input type="checkbox" value="${name}" checked ${isPayer ? 'disabled' : ''}> <span>${name}</span>`;
            DOM.splitOptions.appendChild(label);
        });
    } else {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-split-options';
        state.members.forEach(member => {
            const name = typeof member === 'string' ? member : (member.name || "Unknown");
            const avatar = typeof member === 'object' && member.avatarUrl ? member.avatarUrl : `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`;
            const row = document.createElement('div');
            row.className = 'custom-split-row';
            let placeholder = "0.00", suffix = "₹";
            if (method === 'percentage') { placeholder = "0"; suffix = "%"; }
            if (method === 'shares') { placeholder = "1"; suffix = "parts"; }
            row.innerHTML = `<div style="display:flex; align-items:center; gap:0.75rem"><img src="${avatar}" class="avatar-sm"><span style="font-weight:600">${name}</span></div>
                <div style="display:flex; align-items:center; gap:0.5rem"><input type="number" step="0.01" min="0" placeholder="${placeholder}" class="custom-split-input" data-member="${name}"><span>${suffix}</span></div>`;
            wrapper.appendChild(row);
        });
        DOM.splitOptions.appendChild(wrapper);
    }
}

// --- AI & Math Engine ---
function categorizeExpense(desc) {
    const d = desc.toLowerCase();
    if (d.includes('food') || d.includes('dinner') || d.includes('lunch') || d.includes('eat')) return { name: 'Food & Dining', icon: 'fa-utensils', cssClass: 'cat-food' };
    if (d.includes('travel') || d.includes('cab') || d.includes('uber') || d.includes('flight')) return { name: 'Transportation', icon: 'fa-car', cssClass: 'cat-travel' };
    if (d.includes('hotel') || d.includes('stay') || d.includes('rent')) return { name: 'Accommodation', icon: 'fa-bed', cssClass: 'cat-accomm' };
    return { name: 'Other', icon: 'fa-receipt', cssClass: 'cat-other' };
}

function calculateBalances() {
    let balances = {};
    state.members.forEach(m => { const name = typeof m === 'string' ? m : (m.name || "Unknown"); balances[name] = 0; });
    state.expenses.forEach(ex => {
        const amountCents = Math.round(ex.amount * 100);
        if(balances[ex.payer] !== undefined) balances[ex.payer] += amountCents;
        if (ex.customSplit) {
            const m = ex.customSplit.method, v = ex.customSplit.values, participants = Object.keys(v);
            if (m === 'exact') participants.forEach(p => { if (balances[p] !== undefined) balances[p] -= Math.round(v[p]*100); });
            else if (m === 'percentage') {
                let allocated = 0;
                participants.forEach((p, i) => {
                    let share = (i === participants.length - 1) ? (amountCents - allocated) : Math.floor((amountCents * v[p])/100);
                    allocated += share; if (balances[p] !== undefined) balances[p] -= share;
                });
            } else if (m === 'shares') {
                const total = Object.values(v).reduce((a,b)=>a+b,0); let allocated = 0;
                participants.forEach((p, i) => {
                    let share = (i === participants.length - 1) ? (amountCents - allocated) : Math.floor((amountCents * v[p])/total);
                    allocated += share; if (balances[p] !== undefined) balances[p] -= share;
                });
            }
        } else {
            const count = ex.splitAmong.length, per = Math.floor(amountCents / count); let rem = amountCents % count;
            ex.splitAmong.forEach(p => { if (balances[p] !== undefined) { let c = per + (rem > 0 ? 1 : 0); rem--; balances[p] -= c; } });
        }
    });
    return balances;
}

function simplifyDebts(balances) {
    let sorted = Object.entries(balances).filter(b => Math.abs(b[1]) > 1).sort((a,b) => b[1] - a[1]);
    let debtors = sorted.filter(b => b[1] < 0).map(b => ({ name: b[0], amount: Math.abs(b[1]) }));
    let creditors = sorted.filter(b => b[1] > 0).map(b => ({ name: b[0], amount: b[1] }));
    let res = [], i = 0, j = 0;
    while(i < debtors.length && j < creditors.length) {
        let amt = Math.min(debtors[i].amount, creditors[j].amount);
        res.push({ from: debtors[i].name, to: creditors[j].name, amount: amt / 100 });
        debtors[i].amount -= amt; creditors[j].amount -= amt;
        if(debtors[i].amount < 1) i++; if(creditors[j].amount < 1) j++;
    }
    return res;
}

function parseNLPExpense(text) {
    const t = text.toLowerCase();
    const amountMatch = t.match(/(\d+(\.\d+)?)/);
    if (!amountMatch) return null;
    const amount = parseFloat(amountMatch[0]);
    let payer = state.members[0]?.name;
    state.members.forEach(m => { if (t.includes(m.name.toLowerCase())) payer = m.name; });
    const splitAmong = state.members.map(m => m.name);
    const categoryInfo = categorizeExpense(t);
    return { id: Date.now().toString(), description: text, amount, payer, splitAmong, category: categoryInfo.name, icon: categoryInfo.icon, cssClass: categoryInfo.cssClass, date: new Date().toLocaleDateString() };
}

function generateAnalytics() {
    if (!DOM.aiAnalyticsContent) return;
    let totalAmt = 0, catTotals = {};
    state.expenses.forEach(ex => { 
        if(ex.category !== 'Settlement') { totalAmt += ex.amount; catTotals[ex.category] = (catTotals[ex.category] || 0) + ex.amount; }
    });
    if (totalAmt === 0) { DOM.aiAnalyticsContent.innerHTML = '<p class="empty-text">Not enough data for insights yet.</p>'; return; }
    let topCat = Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0][0];
    DOM.aiAnalyticsContent.innerHTML = `<p>Your largest expense is <strong>${topCat}</strong>.</p>`;
}

// --- Global Helpers ---
window.editExpense = function(id) {
    const ex = state.expenses.find(e => e.id === id);
    if (!ex) return;
    currentEditExpenseId = id;
    DOM.modalOverlay.querySelector('.modal-title').textContent = "Edit Expense";
    DOM.addExpenseForm.querySelector('button[type="submit"]').textContent = "Save Changes";
    DOM.expenseDesc.value = ex.description; DOM.expenseAmount.value = ex.amount;
    populateModalOptions(true); DOM.expensePayer.value = ex.payer;
    if(ex.customSplit) {
        DOM.splitMethodSelect.value = ex.customSplit.method; populateModalOptions(true);
        setTimeout(() => {
            const inputs = document.querySelectorAll('.custom-split-input');
            inputs.forEach(inp => { if (ex.customSplit.values[inp.dataset.member]) inp.value = ex.customSplit.values[inp.dataset.member]; });
        }, 50);
    } else {
        DOM.splitMethodSelect.value = 'equally'; populateModalOptions(true);
        setTimeout(() => {
            const cbs = document.querySelectorAll('.split-options input[type="checkbox"]');
            cbs.forEach(cb => { cb.checked = ex.splitAmong.includes(cb.value); });
        }, 50);
    }
    DOM.modalOverlay.classList.add('active');
};

window.deleteExpense = function(id) { if(confirm("Delete this expense?")) { state.expenses = state.expenses.filter(e => e.id !== id); updateUI(); saveData(); } };
window.removeMember = removeMember; 
window.settleDebt = function(from, to, amount) {
    if(confirm(`Mark ₹${amount.toFixed(2)} as paid?`)) {
        state.expenses.unshift({ id: Date.now().toString(), description: `Settlement: ${from} to ${to}`, amount, payer: from, splitAmong: [to], category: 'Settlement', icon: 'fa-handshake', cssClass: 'cat-settlement', date: new Date().toLocaleDateString() });
        updateUI(); saveData();
    }
};

function removeMember(id) {
    const m = state.members.find(mem => mem.id === id);
    if (!m) return;
    if (state.expenses.some(ex => ex.payer === m.name || ex.splitAmong.includes(m.name))) { alert("Member has expenses."); return; }
    state.members = state.members.filter(mem => mem.id !== id);
    updateUI(); saveData();
}

function setFilterMember(name) { filterMember = (filterMember === name) ? null : name; updateUI(); }

document.addEventListener('DOMContentLoaded', init);
