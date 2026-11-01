/**
 * SplitzAI - Next-Gen Shared Expense Engine & FinTech Workspace
 * Pure Vanilla JS. Zero Frameworks. Pure Power.
 */

// --- Global Constants & Currency Rates (Base: INR) ---
const CURRENCIES = {
    INR: { symbol: '₹', name: 'INR (Indian Rupee)', rate: 1.0 },
    USD: { symbol: '$', name: 'USD (US Dollar)', rate: 83.2 },
    EUR: { symbol: '€', name: 'EUR (Euro)', rate: 90.5 },
    GBP: { symbol: '£', name: 'GBP (British Pound)', rate: 105.8 },
    AED: { symbol: 'د.إ', name: 'AED (UAE Dirham)', rate: 22.65 },
    JPY: { symbol: '¥', name: 'JPY (Japanese Yen)', rate: 0.55 }
};

// --- System State ---
let systemState = {
    activeGroupId: null,
    globalCurrency: 'INR',
    groups: []
};

// Pointer to active workspace
let state = {
    id: 'default',
    groupName: "Weekend Getaway",
    currency: 'INR',
    members: [],
    expenses: []
};

// Filter & UI States
let filterMember = null;
let filterCategory = 'ALL';
let searchQuery = '';
let currentEditExpenseId = null;
let currentTheme = localStorage.getItem('splitzTheme') || 'dark';

// Active settlement modal state
let activeSettlementTarget = null;

// Extracted OCR receipt buffer
let lastExtractedReceipt = null;

// --- DOM Cache ---
let DOM = {};

function initDOM() {
    DOM = {
        // App Layout & Nav
        appSidebar: document.getElementById('app-sidebar'),
        sidebarBackdrop: document.getElementById('sidebar-backdrop'),
        btnOpenSidebar: document.getElementById('btn-open-sidebar'),
        btnCloseSidebar: document.getElementById('btn-close-sidebar'),
        displayWorkspaceTitle: document.getElementById('display-workspace-title'),
        btnThemeToggle: document.getElementById('btn-theme-toggle'),
        btnThemeToggleMobile: document.getElementById('btn-theme-toggle-mobile'),
        globalCurrencySelect: document.getElementById('global-currency-select'),

        // Sidebar Groups & Members
        groupsList: document.getElementById('groups-list'),
        btnAddGroup: document.getElementById('btn-add-group'),
        groupNameInput: document.getElementById('group-name-input'),
        btnDeleteActiveGroup: document.getElementById('btn-delete-active-group'),
        membersList: document.getElementById('members-list'),
        memberCount: document.getElementById('member-count'),
        addMemberForm: document.getElementById('add-member-form'),
        newMemberName: document.getElementById('new-member-name'),

        // Hero HUD
        heroCurrencySymbol: document.getElementById('hero-currency-symbol'),
        totalExpenseEl: document.getElementById('total-expense'),
        heroPerPersonPill: document.getElementById('hero-per-person-pill'),
        heroStatusPill: document.getElementById('hero-status-pill'),
        totalDebtsVal: document.getElementById('total-debts-val'),
        activeDebtsCount: document.getElementById('active-debts-count'),
        clearedDebtsVal: document.getElementById('cleared-debts-val'),
        topCategoryVal: document.getElementById('top-category-val'),
        topCategoryPercent: document.getElementById('top-category-percent'),

        // Action Triggers
        btnOpenExpenseModal: document.getElementById('btn-open-expense-modal'),
        btnSettleAllModal: document.getElementById('btn-settle-all-modal'),
        btnScanReceiptTop: document.getElementById('btn-scan-receipt-top'),
        btnShareTop: document.getElementById('btn-share-top'),
        btnExportHub: document.getElementById('btn-export-hub'),

        // AI Chat / NLP
        aiChatForm: document.getElementById('ai-chat-form'),
        aiChatInput: document.getElementById('ai-chat-input'),

        // Expenses List & Filters
        expensesListEl: document.getElementById('expenses-list'),
        expenseCountPill: document.getElementById('expense-count-pill'),
        expenseSearchInput: document.getElementById('expense-search-input'),
        btnClearSearch: document.getElementById('btn-clear-search'),
        categoryFilterChips: document.getElementById('category-filter-chips'),
        activeFilterAlert: document.getElementById('active-filter-alert'),
        btnResetFilters: document.getElementById('btn-reset-filters'),

        // Settlements & Analytics
        settlementsListEl: document.getElementById('settlements-list'),
        analyticsContent: document.getElementById('analytics-content'),
        categoryBars: document.getElementById('category-bars'),
        memberShareBars: document.getElementById('member-share-bars'),

        // Expense Modal
        expenseModal: document.getElementById('expense-modal'),
        expenseModalTitle: document.getElementById('expense-modal-title'),
        btnCloseExpenseModal: document.getElementById('btn-close-expense-modal'),
        btnCancelExpense: document.getElementById('btn-cancel-expense'),
        addExpenseForm: document.getElementById('add-expense-form'),
        expenseDesc: document.getElementById('expense-desc'),
        expenseAmount: document.getElementById('expense-amount'),
        expenseCurrency: document.getElementById('expense-currency'),
        expensePayer: document.getElementById('expense-payer'),
        expenseCategorySelect: document.getElementById('expense-category-select'),
        splitMethodSelect: document.getElementById('split-method-select'),
        splitOptions: document.getElementById('split-options'),
        splitInstructionNote: document.getElementById('split-instruction-note'),
        btnSubmitExpenseForm: document.getElementById('btn-submit-expense-form'),
        btnScanReceipt: document.getElementById('btn-scan-receipt'),

        // Scanner Modal
        receiptScannerModal: document.getElementById('receipt-scanner-modal'),
        btnCloseScannerModal: document.getElementById('btn-close-scanner-modal'),
        scannerDropzone: document.getElementById('scanner-dropzone'),
        receiptFileInput: document.getElementById('receipt-file-input'),
        dropzonePrompt: document.getElementById('dropzone-prompt'),
        scanPreviewWrap: document.getElementById('scan-preview-wrap'),
        scanPreviewImg: document.getElementById('scan-preview-img'),
        extractedDataCard: document.getElementById('extracted-data-card'),
        extMerchant: document.getElementById('ext-merchant'),
        extAmount: document.getElementById('ext-amount'),
        extCategory: document.getElementById('ext-category'),
        extDate: document.getElementById('ext-date'),
        btnApplyExtractedData: document.getElementById('btn-apply-extracted-data'),

        // Settlement Modal
        settleModal: document.getElementById('settle-modal'),
        btnCloseSettleModal: document.getElementById('btn-close-settle-modal'),
        btnCancelSettle: document.getElementById('btn-cancel-settle'),
        settleFromAvatar: document.getElementById('settle-from-avatar'),
        settleFromName: document.getElementById('settle-from-name'),
        settleToAvatar: document.getElementById('settle-to-avatar'),
        settleToName: document.getElementById('settle-to-name'),
        settleModalAmount: document.getElementById('settle-modal-amount'),
        settleQrCode: document.getElementById('settle-qr-code'),
        upiDisplayId: document.getElementById('upi-display-id'),
        btnCopyUpi: document.getElementById('btn-copy-upi'),
        btnConfirmSettleAction: document.getElementById('btn-confirm-settle-action'),

        // Export Hub Modal
        exportModal: document.getElementById('export-modal'),
        btnCloseExportModal: document.getElementById('btn-close-export-modal'),
        btnCopySummaryText: document.getElementById('btn-copy-summary-text'),
        btnDownloadCsv: document.getElementById('btn-download-csv'),
        btnExportJson: document.getElementById('btn-export-json'),
        importJsonFile: document.getElementById('import-json-file'),
        summaryPreviewText: document.getElementById('summary-preview-text'),

        // Confirm Dialog Modal
        confirmDialogModal: document.getElementById('confirm-dialog-modal'),
        confirmDialogTitle: document.getElementById('confirm-dialog-title'),
        confirmDialogMessage: document.getElementById('confirm-dialog-message'),
        btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
        btnConfirmAccept: document.getElementById('btn-confirm-accept'),

        // Canvas & Toast
        confettiCanvas: document.getElementById('confetti-canvas'),
        toastContainer: document.getElementById('toast-container')
    };
}

// --- Initialization ---
function init() {
    initDOM();
    applyTheme(currentTheme);
    setupEventListeners();
    loadPersistedData();
    updateUI();
}

// --- Persistence & Migration ---
function loadPersistedData() {
    try {
        const raw = localStorage.getItem('splitzGroupsV9') || localStorage.getItem('splitzGroupsV8');
        if (raw) {
            systemState = JSON.parse(raw);
        }
    } catch (err) {
        console.error("Data parse error", err);
    }

    if (!systemState.groups || !Array.isArray(systemState.groups) || systemState.groups.length === 0) {
        // Seed default pristine workspace
        const defaultGroup = {
            id: 'group_default',
            groupName: "Weekend Getaway",
            currency: 'INR',
            members: [
                { id: 'm1', name: 'Alice', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alice' },
                { id: 'm2', name: 'Bob', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Bob' },
                { id: 'm3', name: 'Charlie', avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Charlie' }
            ],
            expenses: [
                {
                    id: 'exp_1',
                    description: "Villa Beachfront Stay",
                    amount: 6000,
                    originalAmount: 6000,
                    originalCurrency: 'INR',
                    payer: "Alice",
                    splitAmong: ["Alice", "Bob", "Charlie"],
                    customSplit: null,
                    category: "Accommodation",
                    icon: "fa-bed",
                    cssClass: "cat-accomm",
                    date: new Date(Date.now() - 86400000 * 2).toLocaleDateString()
                },
                {
                    id: 'exp_2',
                    description: "Seafood Feast & Drinks",
                    amount: 2400,
                    originalAmount: 2400,
                    originalCurrency: 'INR',
                    payer: "Bob",
                    splitAmong: ["Alice", "Bob", "Charlie"],
                    customSplit: null,
                    category: "Food & Dining",
                    icon: "fa-utensils",
                    cssClass: "cat-food",
                    date: new Date(Date.now() - 86400000).toLocaleDateString()
                },
                {
                    id: 'exp_3',
                    description: "Airport Cab Transfer",
                    amount: 900,
                    originalAmount: 900,
                    originalCurrency: 'INR',
                    payer: "Charlie",
                    splitAmong: ["Alice", "Charlie"],
                    customSplit: null,
                    category: "Transportation",
                    icon: "fa-car",
                    cssClass: "cat-travel",
                    date: new Date().toLocaleDateString()
                }
            ]
        };
        systemState = {
            activeGroupId: defaultGroup.id,
            globalCurrency: 'INR',
            groups: [defaultGroup]
        };
    }

    if (!systemState.globalCurrency) systemState.globalCurrency = 'INR';
    if (DOM.globalCurrencySelect) DOM.globalCurrencySelect.value = systemState.globalCurrency;

    setActiveGroup(systemState.activeGroupId || systemState.groups[0].id);
    saveData();
}

function saveData() {
    localStorage.setItem('splitzGroupsV9', JSON.stringify(systemState));
}

function setActiveGroup(id) {
    const found = systemState.groups.find(g => g.id === id);
    if (found) {
        state = found;
        systemState.activeGroupId = id;
        if (!state.expenses) state.expenses = [];
        if (!state.members) state.members = [];
        if (DOM.groupNameInput) DOM.groupNameInput.value = state.groupName || "Untitled Workspace";
        if (DOM.displayWorkspaceTitle) DOM.displayWorkspaceTitle.textContent = state.groupName || "Untitled Workspace";
        filterMember = null;
        updateUI();
        saveData();
    }
}

// --- Theme Management ---
function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('splitzTheme', theme);
    
    const iconClass = theme === 'light' ? 'fa-moon' : 'fa-sun';
    const textLabel = theme === 'light' ? 'Dark' : 'Light';
    
    if (DOM.btnThemeToggle) {
        const icon = DOM.btnThemeToggle.querySelector('i');
        const text = DOM.btnThemeToggle.querySelector('.btn-ctrl-text');
        if (icon) icon.className = `fa-solid ${iconClass}`;
        if (text) text.textContent = textLabel;
    }
    if (DOM.btnThemeToggleMobile) {
        const icon = DOM.btnThemeToggleMobile.querySelector('i');
        if (icon) icon.className = `fa-solid ${iconClass}`;
    }
}

function toggleTheme() {
    applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    showToast(`Switched to ${currentTheme} theme`, 'info');
}

// --- Currency Math & Conversion ---
function convertAmount(amount, fromCur, toCur) {
    if (fromCur === toCur) return amount;
    const fromRate = CURRENCIES[fromCur]?.rate || 1.0;
    const toRate = CURRENCIES[toCur]?.rate || 1.0;
    // convert fromCur to INR base, then to toCur
    const inr = amount * fromRate;
    return inr / toRate;
}

function formatCurrency(amount, cur = systemState.globalCurrency) {
    const sym = CURRENCIES[cur]?.symbol || '₹';
    const converted = convertAmount(amount, 'INR', cur);
    return `${sym}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// --- Event Handlers & Wiring ---
function setupEventListeners() {
    // Theme toggles
    DOM.btnThemeToggle && DOM.btnThemeToggle.addEventListener('click', toggleTheme);
    DOM.btnThemeToggleMobile && DOM.btnThemeToggleMobile.addEventListener('click', toggleTheme);

    // Global Currency Select
    DOM.globalCurrencySelect && DOM.globalCurrencySelect.addEventListener('change', (e) => {
        systemState.globalCurrency = e.target.value;
        saveData();
        updateUI();
        showToast(`Workspace currency changed to ${systemState.globalCurrency}`, 'info');
    });

    // Mobile Sidebar Drawer
    const toggleSidebar = (open) => {
        if (DOM.appSidebar) DOM.appSidebar.classList.toggle('active', open);
        if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.toggle('active', open);
    };
    DOM.btnOpenSidebar && DOM.btnOpenSidebar.addEventListener('click', () => toggleSidebar(true));
    DOM.btnCloseSidebar && DOM.btnCloseSidebar.addEventListener('click', () => toggleSidebar(false));
    DOM.sidebarBackdrop && DOM.sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));

    // Create New Workspace Group
    DOM.btnAddGroup && DOM.btnAddGroup.addEventListener('click', () => {
        const name = prompt("Enter a name for your new workspace:", `Workspace ${systemState.groups.length + 1}`);
        if (!name || !name.trim()) return;

        const newGroup = {
            id: 'group_' + Date.now(),
            groupName: name.trim(),
            currency: systemState.globalCurrency,
            members: [
                { id: 'm_' + Date.now(), name: 'You', avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=You` }
            ],
            expenses: []
        };
        systemState.groups.push(newGroup);
        setActiveGroup(newGroup.id);
        showToast(`Workspace "${newGroup.groupName}" created!`, 'success');
        if (window.innerWidth <= 900) toggleSidebar(false);
    });

    // Rename Active Workspace
    DOM.groupNameInput && DOM.groupNameInput.addEventListener('input', (e) => {
        state.groupName = e.target.value || "Untitled Workspace";
        if (DOM.displayWorkspaceTitle) DOM.displayWorkspaceTitle.textContent = state.groupName;
        renderGroups();
        saveData();
    });

    // Delete Active Workspace
    DOM.btnDeleteActiveGroup && DOM.btnDeleteActiveGroup.addEventListener('click', () => {
        if (systemState.groups.length <= 1) {
            showToast("Cannot delete the only remaining workspace.", "error");
            return;
        }
        showConfirm(
            "Delete Workspace?",
            `Are you sure you want to permanently delete "${state.groupName}" and all its records?`,
            () => {
                systemState.groups = systemState.groups.filter(g => g.id !== state.id);
                setActiveGroup(systemState.groups[0].id);
                showToast("Workspace deleted successfully", "info");
            }
        );
    });

    // Add Member Form
    DOM.addMemberForm && DOM.addMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawName = DOM.newMemberName.value.trim();
        if (!rawName) return;

        const exists = state.members.some(m => m.name.toLowerCase() === rawName.toLowerCase());
        if (exists) {
            showToast(`Member "${rawName}" is already in this group!`, 'error');
            return;
        }

        const newMember = {
            id: 'mem_' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: rawName,
            avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(rawName)}`
        };
        state.members.push(newMember);
        DOM.newMemberName.value = '';
        updateUI();
        saveData();
        showToast(`Added ${rawName} to group`, 'success');
    });

    // AI NLP Prompt Form
    DOM.aiChatForm && DOM.aiChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const promptText = DOM.aiChatInput.value.trim();
        if (!promptText) return;

        const parsed = parseNLPExpense(promptText);
        if (parsed.success) {
            state.expenses.unshift(parsed.expense);
            DOM.aiChatInput.value = '';
            updateUI();
            saveData();
            showToast(`✨ AI logged: ${formatCurrency(parsed.expense.amount)} for "${parsed.expense.description}"`, 'success');
        } else {
            showToast(`🤖 ${parsed.reason}`, 'error');
        }
    });

    // Quick AI prompt chips click
    document.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.getAttribute('data-prompt');
            if (DOM.aiChatInput) {
                DOM.aiChatInput.value = text;
                DOM.aiChatForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // Open/Close Add Expense Modal
    DOM.btnOpenExpenseModal && DOM.btnOpenExpenseModal.addEventListener('click', () => openExpenseModal());
    DOM.btnCloseExpenseModal && DOM.btnCloseExpenseModal.addEventListener('click', () => closeExpenseModal());
    DOM.btnCancelExpense && DOM.btnCancelExpense.addEventListener('click', () => closeExpenseModal());

    DOM.splitMethodSelect && DOM.splitMethodSelect.addEventListener('change', () => {
        populateSplitOptions();
    });

    DOM.expensePayer && DOM.expensePayer.addEventListener('change', () => {
        if (DOM.splitMethodSelect.value === 'equally') {
            // Keep split intact
        }
    });

    // Expense Form Submit
    DOM.addExpenseForm && DOM.addExpenseForm.addEventListener('submit', handleExpenseFormSubmit);

    // Filter Chips
    if (DOM.categoryFilterChips) {
        DOM.categoryFilterChips.addEventListener('click', (e) => {
            const btn = e.target.closest('.chip-filter');
            if (!btn) return;
            DOM.categoryFilterChips.querySelectorAll('.chip-filter').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            filterCategory = btn.getAttribute('data-category');
            renderExpenses();
            updateFilterBanner();
        });
    }

    // Search Input
    DOM.expenseSearchInput && DOM.expenseSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        if (DOM.btnClearSearch) {
            DOM.btnClearSearch.style.display = searchQuery ? 'block' : 'none';
        }
        renderExpenses();
        updateFilterBanner();
    });

    DOM.btnClearSearch && DOM.btnClearSearch.addEventListener('click', () => {
        DOM.expenseSearchInput.value = '';
        searchQuery = '';
        DOM.btnClearSearch.style.display = 'none';
        renderExpenses();
        updateFilterBanner();
    });

    DOM.btnResetFilters && DOM.btnResetFilters.addEventListener('click', () => {
        filterMember = null;
        filterCategory = 'ALL';
        searchQuery = '';
        if (DOM.expenseSearchInput) DOM.expenseSearchInput.value = '';
        if (DOM.btnClearSearch) DOM.btnClearSearch.style.display = 'none';
        if (DOM.categoryFilterChips) {
            DOM.categoryFilterChips.querySelectorAll('.chip-filter').forEach(c => {
                c.classList.toggle('active', c.getAttribute('data-category') === 'ALL');
            });
        }
        updateUI();
    });

    // Scanner Modal Wiring
    DOM.btnScanReceiptTop && DOM.btnScanReceiptTop.addEventListener('click', openScannerModal);
    DOM.btnScanReceipt && DOM.btnScanReceipt.addEventListener('click', () => {
        closeExpenseModal();
        openScannerModal();
    });
    DOM.btnCloseScannerModal && DOM.btnCloseScannerModal.addEventListener('click', closeScannerModal);

    // Dropzone / File upload
    if (DOM.receiptFileInput) {
        DOM.receiptFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleReceiptFile(file);
        });
    }

    // Sample receipt chips
    document.querySelectorAll('.btn-sample-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const sampleType = btn.getAttribute('data-sample');
            simulateReceiptScan(sampleType);
        });
    });

    DOM.btnApplyExtractedData && DOM.btnApplyExtractedData.addEventListener('click', applyExtractedDataToForm);

    // Settle Modal Wiring
    DOM.btnCloseSettleModal && DOM.btnCloseSettleModal.addEventListener('click', closeSettleModal);
    DOM.btnCancelSettle && DOM.btnCancelSettle.addEventListener('click', closeSettleModal);
    DOM.btnConfirmSettleAction && DOM.btnConfirmSettleAction.addEventListener('click', confirmActiveSettlement);

    DOM.btnSettleAllModal && DOM.btnSettleAllModal.addEventListener('click', () => {
        const balances = calculateBalances();
        const settlements = simplifyDebts(balances);
        if (settlements.length === 0) {
            showToast("Everything is already settled up! 🎉", "info");
            triggerConfetti();
            return;
        }
        openSettleModal(settlements[0].from, settlements[0].to, settlements[0].amount);
    });

    DOM.btnCopyUpi && DOM.btnCopyUpi.addEventListener('click', () => {
        if (DOM.upiDisplayId) {
            navigator.clipboard.writeText(DOM.upiDisplayId.textContent);
            showToast("UPI ID copied to clipboard!", "success");
        }
    });

    // Export & Share Hub Wiring
    const openExportModal = () => {
        populateSummaryPreview();
        if (DOM.exportModal) DOM.exportModal.classList.add('active');
    };
    DOM.btnShareTop && DOM.btnShareTop.addEventListener('click', openExportModal);
    DOM.btnExportHub && DOM.btnExportHub.addEventListener('click', openExportModal);
    DOM.btnCloseExportModal && DOM.btnCloseExportModal.addEventListener('click', () => {
        if (DOM.exportModal) DOM.exportModal.classList.remove('active');
    });

    DOM.btnCopySummaryText && DOM.btnCopySummaryText.addEventListener('click', () => {
        const text = DOM.summaryPreviewText.value;
        navigator.clipboard.writeText(text);
        showToast("Summary copied for WhatsApp / Telegram!", "success");
    });

    DOM.btnDownloadCsv && DOM.btnDownloadCsv.addEventListener('click', exportToCsv);
    DOM.btnExportJson && DOM.btnExportJson.addEventListener('click', exportToJson);

    if (DOM.importJsonFile) {
        DOM.importJsonFile.addEventListener('change', importFromJson);
    }
}

// --- UI Rendering Updates ---
function updateUI() {
    renderGroups();
    renderMembers();
    renderHeroHUD();
    renderExpenses();
    renderSettlements();
    renderAnalyticsAndCharts();
    updateFilterBanner();
}

function updateFilterBanner() {
    if (!DOM.activeFilterAlert) return;
    const isFiltered = filterMember !== null || filterCategory !== 'ALL' || searchQuery.length > 0;
    DOM.activeFilterAlert.style.display = isFiltered ? 'flex' : 'none';
}

function renderGroups() {
    if (!DOM.groupsList) return;
    DOM.groupsList.innerHTML = '';

    systemState.groups.forEach(g => {
        const div = document.createElement('div');
        const isActive = g.id === state.id;
        div.className = `group-item ${isActive ? 'active' : ''}`;
        div.innerHTML = `
            <div class="group-item-title">
                <i class="fa-solid ${isActive ? 'fa-folder-open text-accent' : 'fa-folder'}"></i>
                <span>${escapeHtml(g.groupName || 'Untitled')}</span>
            </div>
            <span class="badge-count">${(g.members || []).length}</span>
        `;
        div.onclick = () => {
            setActiveGroup(g.id);
            if (window.innerWidth <= 900 && DOM.appSidebar) {
                DOM.appSidebar.classList.remove('active');
                DOM.sidebarBackdrop.classList.remove('active');
            }
        };
        DOM.groupsList.appendChild(div);
    });
}

function renderMembers() {
    if (!DOM.membersList) return;
    DOM.membersList.innerHTML = '';
    const balances = calculateBalances();

    state.members.forEach(member => {
        const name = member.name || "Unknown";
        const avatar = member.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`;
        const balInr = (balances[name] || 0) / 100;

        let tagClass = 'tag-settled';
        let tagText = 'Settled';
        if (balInr > 0.05) {
            tagClass = 'tag-positive';
            tagText = `Gets ${formatCurrency(balInr)}`;
        } else if (balInr < -0.05) {
            tagClass = 'tag-negative';
            tagText = `Owes ${formatCurrency(Math.abs(balInr))}`;
        }

        const isFiltered = filterMember === name;
        const li = document.createElement('li');
        li.className = `member-item ${isFiltered ? 'filtered-active' : ''}`;
        li.innerHTML = `
            <div class="member-profile">
                <img src="${avatar}" alt="${escapeHtml(name)}" class="member-avatar">
                <div class="member-name-block">
                    <span class="member-name">${escapeHtml(name)}</span>
                    <span class="member-tag ${tagClass}">${tagText}</span>
                </div>
            </div>
            <button class="btn-remove-member" title="Remove member" onclick="event.stopPropagation(); removeMember('${member.id}')">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        li.onclick = () => {
            filterMember = (filterMember === name) ? null : name;
            updateUI();
        };
        DOM.membersList.appendChild(li);
    });

    if (DOM.memberCount) DOM.memberCount.textContent = state.members.length;
}

function renderHeroHUD() {
    const sym = CURRENCIES[systemState.globalCurrency]?.symbol || '₹';
    if (DOM.heroCurrencySymbol) DOM.heroCurrencySymbol.textContent = sym;

    let totalInr = 0;
    let clearedInr = 0;

    state.expenses.forEach(ex => {
        if (ex.category === 'Settlement') {
            clearedInr += ex.amount;
        } else {
            totalInr += ex.amount;
        }
    });

    const totalConverted = convertAmount(totalInr, 'INR', systemState.globalCurrency);
    if (DOM.totalExpenseEl) {
        DOM.totalExpenseEl.textContent = totalConverted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const memberCount = Math.max(state.members.length, 1);
    const perPersonInr = totalInr / memberCount;
    if (DOM.heroPerPersonPill) {
        DOM.heroPerPersonPill.innerHTML = `<i class="fa-solid fa-users"></i> ${formatCurrency(perPersonInr)} / person`;
    }

    // Active Debts
    const balances = calculateBalances();
    const settlements = simplifyDebts(balances);
    let activeDebtsInr = 0;
    settlements.forEach(s => activeDebtsInr += s.amount);

    if (DOM.totalDebtsVal) DOM.totalDebtsVal.textContent = formatCurrency(activeDebtsInr);
    if (DOM.activeDebtsCount) DOM.activeDebtsCount.textContent = `${settlements.length} greedy route${settlements.length === 1 ? '' : 's'} pending`;
    if (DOM.clearedDebtsVal) DOM.clearedDebtsVal.textContent = formatCurrency(clearedInr);
}

function renderExpenses() {
    if (!DOM.expensesListEl) return;
    DOM.expensesListEl.innerHTML = '';

    let list = state.expenses.slice();

    // Member filter
    if (filterMember) {
        list = list.filter(ex => ex.payer === filterMember || (ex.splitAmong && ex.splitAmong.includes(filterMember)));
    }

    // Category filter
    if (filterCategory !== 'ALL') {
        list = list.filter(ex => ex.category === filterCategory);
    }

    // Search query filter
    if (searchQuery) {
        list = list.filter(ex => {
            const desc = (ex.description || '').toLowerCase();
            const payer = (ex.payer || '').toLowerCase();
            const cat = (ex.category || '').toLowerCase();
            return desc.includes(searchQuery) || payer.includes(searchQuery) || cat.includes(searchQuery);
        });
    }

    if (DOM.expenseCountPill) DOM.expenseCountPill.textContent = list.length;

    if (list.length === 0) {
        DOM.expensesListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon-wrap"><i class="fa-solid fa-wallet"></i></div>
                <h3>No transactions match your view</h3>
                <p>Try resetting filters or log a new transaction with the AI chat bar above.</p>
                <button class="btn-primary-sm" onclick="document.getElementById('btn-reset-filters').click()">Show All Transactions</button>
            </div>
        `;
        return;
    }

    list.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'expense-row-card';

        const isSettlement = ex.category === 'Settlement';
        const formattedAmount = formatCurrency(ex.amount);

        let splitInsight = '';
        if (!isSettlement && ex.splitAmong && ex.splitAmong.length > 0) {
            splitInsight = `<span class="split-insight-tag"><i class="fa-solid fa-users-viewfinder"></i> Split with ${ex.splitAmong.join(', ')}</span>`;
        }

        const iconClass = ex.icon || (isSettlement ? 'fa-handshake' : 'fa-receipt');
        const badgeThemeClass = ex.cssClass || (isSettlement ? 'cat-settlement' : 'cat-other');

        card.innerHTML = `
            <div class="expense-main">
                <div class="cat-avatar-icon ${badgeThemeClass}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="expense-info-block">
                    <div class="expense-title-row">
                        <span class="expense-title">${escapeHtml(ex.description)}</span>
                        <span class="category-tag-mini">${escapeHtml(ex.category || 'General')}</span>
                    </div>
                    <div class="expense-meta-row">
                        <span><i class="fa-regular fa-calendar"></i> ${ex.date || 'Recent'}</span>
                        <span>&bull;</span>
                        <span>Paid by <strong>${escapeHtml(ex.payer)}</strong></span>
                    </div>
                    ${splitInsight}
                </div>
            </div>

            <div class="expense-amount-side">
                <div class="expense-price-box">
                    ${isSettlement 
                        ? `<span class="amount-settled-pill"><i class="fa-solid fa-circle-check"></i> + ${formattedAmount}</span>` 
                        : `<span class="amount-debit-val">${formattedAmount}</span>`
                    }
                </div>
                <div class="expense-action-buttons">
                    <button class="btn-icon-subtle" title="Edit" onclick="editExpense('${ex.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon-subtle delete" title="Delete" onclick="deleteExpense('${ex.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        DOM.expensesListEl.appendChild(card);
    });
}

function renderSettlements() {
    if (!DOM.settlementsListEl) return;
    DOM.settlementsListEl.innerHTML = '';

    const balances = calculateBalances();
    const settlements = simplifyDebts(balances);

    if (settlements.length === 0) {
        DOM.settlementsListEl.innerHTML = `
            <div class="settled-all-celebration">
                <i class="fa-solid fa-award"></i>
                <h4>All Balances Settled!</h4>
                <p>Every member in this workspace is square. Zero debts pending.</p>
            </div>
        `;
        return;
    }

    settlements.forEach(s => {
        const card = document.createElement('div');
        card.className = 'settlement-card-item';
        card.innerHTML = `
            <div class="settlement-flow">
                <strong>${escapeHtml(s.from)}</strong>
                <i class="fa-solid fa-arrow-right-long flow-arrow-icon"></i>
                <strong>${escapeHtml(s.to)}</strong>
            </div>
            <div class="settlement-action-side">
                <span class="settlement-val">${formatCurrency(s.amount)}</span>
                <button class="btn-settle-action" onclick="openSettleModal('${escapeHtml(s.from)}', '${escapeHtml(s.to)}', ${s.amount})">
                    <i class="fa-solid fa-qrcode"></i> Settle
                </button>
            </div>
        `;
        DOM.settlementsListEl.appendChild(card);
    });
}

function renderAnalyticsAndCharts() {
    let totalAmt = 0;
    const catTotals = {};
    const memberPaidTotals = {};

    state.members.forEach(m => memberPaidTotals[m.name] = 0);

    state.expenses.forEach(ex => {
        if (ex.category !== 'Settlement') {
            totalAmt += ex.amount;
            catTotals[ex.category] = (catTotals[ex.category] || 0) + ex.amount;
            if (memberPaidTotals[ex.payer] !== undefined) {
                memberPaidTotals[ex.payer] += ex.amount;
            }
        }
    });

    // Top Category metric in HUD
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0 && totalAmt > 0) {
        const top = sortedCats[0];
        const pct = Math.round((top[1] / totalAmt) * 100);
        if (DOM.topCategoryVal) DOM.topCategoryVal.textContent = top[0];
        if (DOM.topCategoryPercent) DOM.topCategoryPercent.textContent = `${pct}% of group expenses`;
    } else {
        if (DOM.topCategoryVal) DOM.topCategoryVal.textContent = "None";
        if (DOM.topCategoryPercent) DOM.topCategoryPercent.textContent = `0% of group expenses`;
    }

    // AI Insight text
    if (DOM.analyticsContent) {
        if (totalAmt === 0) {
            DOM.analyticsContent.innerHTML = `<p class="empty-text">Add your first expense to unlock deep AI spending breakdown & debt paths.</p>`;
        } else {
            const topSpender = Object.entries(memberPaidTotals).sort((a, b) => b[1] - a[1])[0];
            const topSpenderPct = Math.round((topSpender[1] / totalAmt) * 100);
            DOM.analyticsContent.innerHTML = `
                <span class="insights-highlight-tag"><i class="fa-solid fa-sparkles"></i> SplitzAI Financial Intelligence</span>
                <p>
                    Group spending stands at <strong>${formatCurrency(totalAmt)}</strong>. 
                    <strong>${topSpender[0]}</strong> has funded the majority (<strong>${topSpenderPct}%</strong>). 
                    Your heaviest outflow is <strong>${sortedCats[0][0]}</strong>.
                </p>
            `;
        }
    }

    // Category Visual Bars
    if (DOM.categoryBars) {
        DOM.categoryBars.innerHTML = '';
        if (sortedCats.length === 0 || totalAmt === 0) {
            DOM.categoryBars.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted);">No category data yet.</p>`;
        } else {
            const catColors = {
                'Food & Dining': 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                'Transportation': 'linear-gradient(90deg, #06b6d4, #38bdf8)',
                'Accommodation': 'linear-gradient(90deg, #10b981, #34d399)',
                'Entertainment': 'linear-gradient(90deg, #a855f7, #c084fc)',
                'Shopping': 'linear-gradient(90deg, #ec4899, #f472b6)',
                'Other': 'linear-gradient(90deg, #64748b, #94a3b8)'
            };

            sortedCats.forEach(([cat, amt]) => {
                const pct = Math.round((amt / totalAmt) * 100);
                const bg = catColors[cat] || 'var(--accent-teal)';
                const row = document.createElement('div');
                row.className = 'cat-bar-item';
                row.innerHTML = `
                    <div class="cat-bar-meta">
                        <span class="cat-bar-name">${cat} &bull; ${pct}%</span>
                        <span class="cat-bar-amount">${formatCurrency(amt)}</span>
                    </div>
                    <div class="cat-progress-track">
                        <div class="cat-progress-fill" style="width: ${pct}%; background: ${bg};"></div>
                    </div>
                `;
                DOM.categoryBars.appendChild(row);
            });
        }
    }

    // Member Contribution Bars
    if (DOM.memberShareBars) {
        DOM.memberShareBars.innerHTML = '';
        state.members.forEach(m => {
            const paid = memberPaidTotals[m.name] || 0;
            const pct = totalAmt > 0 ? Math.round((paid / totalAmt) * 100) : 0;
            const row = document.createElement('div');
            row.className = 'member-share-row';
            row.innerHTML = `
                <img src="${m.avatarUrl}" class="share-avatar" alt="${m.name}">
                <div class="share-info">
                    <div class="share-top-row">
                        <span>${escapeHtml(m.name)}</span>
                        <span>${formatCurrency(paid)} (${pct}%)</span>
                    </div>
                    <div class="cat-progress-track">
                        <div class="cat-progress-fill" style="width: ${pct}%; background: var(--accent-teal);"></div>
                    </div>
                </div>
            `;
            DOM.memberShareBars.appendChild(row);
        });
    }
}

// --- Math & Debt Simplification Engine ---
function calculateBalances() {
    const balances = {};
    state.members.forEach(m => balances[m.name] = 0);

    state.expenses.forEach(ex => {
        const amountCents = Math.round(ex.amount * 100);
        if (balances[ex.payer] !== undefined) {
            balances[ex.payer] += amountCents;
        }

        if (ex.customSplit) {
            const { method, values } = ex.customSplit;
            const participants = Object.keys(values);

            if (method === 'exact') {
                participants.forEach(p => {
                    if (balances[p] !== undefined) balances[p] -= Math.round((values[p] || 0) * 100);
                });
            } else if (method === 'percentage') {
                let allocated = 0;
                participants.forEach((p, idx) => {
                    const isLast = idx === participants.length - 1;
                    const share = isLast ? (amountCents - allocated) : Math.floor((amountCents * values[p]) / 100);
                    allocated += share;
                    if (balances[p] !== undefined) balances[p] -= share;
                });
            } else if (method === 'shares') {
                const totalShares = Object.values(values).reduce((a, b) => a + b, 0);
                let allocated = 0;
                participants.forEach((p, idx) => {
                    const isLast = idx === participants.length - 1;
                    const share = isLast ? (amountCents - allocated) : Math.floor((amountCents * values[p]) / (totalShares || 1));
                    allocated += share;
                    if (balances[p] !== undefined) balances[p] -= share;
                });
            }
        } else {
            const splitList = ex.splitAmong && ex.splitAmong.length > 0 ? ex.splitAmong : state.members.map(m => m.name);
            const count = splitList.length;
            const perPerson = Math.floor(amountCents / count);
            let remainder = amountCents % count;

            splitList.forEach(p => {
                if (balances[p] !== undefined) {
                    const charge = perPerson + (remainder > 0 ? 1 : 0);
                    remainder--;
                    balances[p] -= charge;
                }
            });
        }
    });

    return balances;
}

function simplifyDebts(balances) {
    const debtors = [];
    const creditors = [];

    for (const [person, cents] of Object.entries(balances)) {
        if (cents < -5) debtors.push({ person, amount: Math.abs(cents) });
        else if (cents > 5) creditors.push({ person, amount: cents });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
        const deb = debtors[i];
        const cred = creditors[j];
        const minAmt = Math.min(deb.amount, cred.amount);

        if (minAmt > 0) {
            settlements.push({
                from: deb.person,
                to: cred.person,
                amount: minAmt / 100
            });
        }

        deb.amount -= minAmt;
        cred.amount -= minAmt;

        if (deb.amount < 1) i++;
        if (cred.amount < 1) j++;
    }

    return settlements;
}

// --- AI NLP Parser Engine ---
function extractSmartDesc(raw, payer, matchStr) {
    let t = raw;
    // Check for 'for <item>'
    const forMatch = t.match(/for\s+([^,]+?)(?:\s+(?:split\s+with|with|paid\s+by)|$)/i);
    if (forMatch && forMatch[1].trim()) {
        let candidate = forMatch[1].trim().replace(matchStr, '').trim();
        if (candidate.length > 1) return candidate;
    }
    // Check for '<item> paid by <payer>'
    const paidByMatch = t.match(/^(.+?)\s+paid\s+by/i);
    if (paidByMatch && paidByMatch[1].trim()) {
        let candidate = paidByMatch[1].replace(matchStr, '').trim();
        if (candidate.length > 1) return candidate;
    }
    // Fallback: strip known keywords and payer names
    let cleaned = t
        .replace(matchStr, '')
        .replace(new RegExp(payer, 'gi'), '')
        .replace(/paid\s+by/gi, '')
        .replace(/paid/gi, '')
        .replace(/split\s+with\s+[\w\s,and]+/gi, '')
        .replace(/for\s+/gi, '')
        .trim();
    return cleaned || 'Group Expense';
}

function parseNLPExpense(text) {
    const raw = text.trim();
    const lower = raw.toLowerCase();

    // Currency detection
    let detectedCur = systemState.globalCurrency;
    if (lower.includes('$') || lower.includes('usd') || lower.includes('dollar')) detectedCur = 'USD';
    else if (lower.includes('€') || lower.includes('eur') || lower.includes('euro')) detectedCur = 'EUR';
    else if (lower.includes('£') || lower.includes('gbp') || lower.includes('pound')) detectedCur = 'GBP';
    else if (lower.includes('₹') || lower.includes('rs') || lower.includes('inr')) detectedCur = 'INR';

    // Amount extraction: look for numbers with optional currency prefix
    const amountRegex = /(?:(?:rs|inr|₹|\$|£|€)\s*)?(\d+(?:\.\d{1,2})?)/i;
    const match = raw.match(amountRegex);
    if (!match) {
        return { success: false, reason: "Couldn't locate the expense amount. Try: 'Alice paid 1500 for taxi'" };
    }
    const rawAmount = parseFloat(match[1]);
    if (isNaN(rawAmount) || rawAmount <= 0) {
        return { success: false, reason: "Detected amount is invalid." };
    }

    // Normalize amount to base currency (INR)
    const amountInr = convertAmount(rawAmount, detectedCur, 'INR');

    // Identify payer
    let payer = null;
    let minIndex = 99999;
    state.members.forEach(mem => {
        const idx = lower.indexOf(mem.name.toLowerCase());
        if (idx !== -1 && idx < minIndex) {
            payer = mem.name;
            minIndex = idx;
        }
    });

    if (!payer) {
        payer = state.members[0]?.name || "You";
    }

    // Identify split participants: "split with Bob and Charlie" or "for Bob, Charlie"
    let splitAmong = [];
    state.members.forEach(mem => {
        const memLower = mem.name.toLowerCase();
        // check if mentioned in second half or as participant
        if (lower.includes(memLower) && mem.name !== payer) {
            splitAmong.push(mem.name);
        }
    });

    // If participants specified, include payer unless strictly stated otherwise
    if (splitAmong.length > 0) {
        if (!splitAmong.includes(payer)) splitAmong.unshift(payer);
    } else {
        // Default to all group members
        splitAmong = state.members.map(m => m.name);
    }

    // Clean and extract description accurately
    let cleanDesc = extractSmartDesc(raw, payer, match[0]);

    const catInfo = categorizeExpense(cleanDesc + " " + raw);

    return {
        success: true,
        expense: {
            id: 'exp_' + Date.now(),
            description: capitalize(cleanDesc),
            amount: Math.round(amountInr * 100) / 100,
            originalAmount: rawAmount,
            originalCurrency: detectedCur,
            payer: payer,
            splitAmong: splitAmong,
            customSplit: null,
            category: catInfo.name,
            icon: catInfo.icon,
            cssClass: catInfo.cssClass,
            date: new Date().toLocaleDateString()
        }
    };
}

function categorizeExpense(text) {
    const t = text.toLowerCase();
    if (t.includes('food') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast') || 
        t.includes('pizza') || t.includes('bistro') || t.includes('cafe') || t.includes('eat') || 
        t.includes('beer') || t.includes('drink') || t.includes('bar') || t.includes('burger')) {
        return { name: 'Food & Dining', icon: 'fa-utensils', cssClass: 'cat-food' };
    }
    if (t.includes('taxi') || t.includes('uber') || t.includes('cab') || t.includes('flight') || 
        t.includes('train') || t.includes('gas') || t.includes('fuel') || t.includes('car') || t.includes('travel')) {
        return { name: 'Transportation', icon: 'fa-car', cssClass: 'cat-travel' };
    }
    if (t.includes('hotel') || t.includes('stay') || t.includes('airbnb') || t.includes('resort') || 
        t.includes('villa') || t.includes('room') || t.includes('rent')) {
        return { name: 'Accommodation', icon: 'fa-bed', cssClass: 'cat-accomm' };
    }
    if (t.includes('movie') || t.includes('cinema') || t.includes('game') || t.includes('ticket') || 
        t.includes('party') || t.includes('fun') || t.includes('club')) {
        return { name: 'Entertainment', icon: 'fa-gamepad', cssClass: 'cat-entert' };
    }
    if (t.includes('shop') || t.includes('market') || t.includes('groceries') || t.includes('mall') || 
        t.includes('clothes') || t.includes('store')) {
        return { name: 'Shopping', icon: 'fa-bag-shopping', cssClass: 'cat-shop' };
    }
    return { name: 'Other', icon: 'fa-receipt', cssClass: 'cat-other' };
}

// --- Add/Edit Expense Modal Engine ---
function openExpenseModal(editId = null) {
    currentEditExpenseId = editId;
    if (editId) {
        const ex = state.expenses.find(e => e.id === editId);
        if (!ex) return;
        DOM.expenseModalTitle.textContent = "Edit Expense";
        DOM.btnSubmitExpenseForm.textContent = "Save Changes";
        DOM.expenseDesc.value = ex.description;
        DOM.expenseAmount.value = ex.originalAmount || ex.amount;
        DOM.expenseCurrency.value = ex.originalCurrency || systemState.globalCurrency;
        populatePayerOptions(ex.payer);
        DOM.expenseCategorySelect.value = ex.category;
        
        if (ex.customSplit) {
            DOM.splitMethodSelect.value = ex.customSplit.method;
            populateSplitOptions(ex.customSplit.values);
        } else {
            DOM.splitMethodSelect.value = 'equally';
            populateSplitOptions(null, ex.splitAmong);
        }
    } else {
        DOM.expenseModalTitle.textContent = "Add New Expense";
        DOM.btnSubmitExpenseForm.textContent = "Add Expense";
        DOM.addExpenseForm.reset();
        DOM.expenseCurrency.value = systemState.globalCurrency;
        populatePayerOptions();
        DOM.splitMethodSelect.value = 'equally';
        populateSplitOptions();
    }
    DOM.expenseModal.classList.add('active');
}

function closeExpenseModal() {
    DOM.expenseModal.classList.remove('active');
    currentEditExpenseId = null;
}

function populatePayerOptions(selectedPayer = null) {
    if (!DOM.expensePayer) return;
    DOM.expensePayer.innerHTML = '';
    state.members.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        if (selectedPayer && m.name === selectedPayer) opt.selected = true;
        DOM.expensePayer.appendChild(opt);
    });
}

function populateSplitOptions(customValues = null, preselectedMembers = null) {
    if (!DOM.splitOptions) return;
    DOM.splitOptions.innerHTML = '';
    const method = DOM.splitMethodSelect.value;

    if (method === 'equally') {
        DOM.splitInstructionNote.textContent = "Check members participating in this split:";
        state.members.forEach(m => {
            const isChecked = preselectedMembers ? preselectedMembers.includes(m.name) : true;
            const label = document.createElement('label');
            label.className = `split-badge-item ${isChecked ? 'active' : ''}`;
            label.innerHTML = `
                <input type="checkbox" value="${escapeHtml(m.name)}" ${isChecked ? 'checked' : ''}>
                <span>${escapeHtml(m.name)}</span>
            `;
            label.querySelector('input').addEventListener('change', (e) => {
                label.classList.toggle('active', e.target.checked);
            });
            DOM.splitOptions.appendChild(label);
        });
    } else {
        let suffix = "₹";
        let placeholder = "0.00";
        if (method === 'percentage') { suffix = "%"; placeholder = "33.3"; }
        if (method === 'shares') { suffix = "ratio"; placeholder = "1"; }
        DOM.splitInstructionNote.textContent = `Specify individual ${method} breakdown:`;

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-split-box';

        state.members.forEach(m => {
            const val = customValues && customValues[m.name] !== undefined ? customValues[m.name] : '';
            const row = document.createElement('div');
            row.className = 'custom-split-row';
            row.innerHTML = `
                <div class="custom-split-user">
                    <img src="${m.avatarUrl}" class="custom-split-avatar" alt="${m.name}">
                    <span>${escapeHtml(m.name)}</span>
                </div>
                <div class="custom-split-input-wrap">
                    <input type="number" step="0.01" min="0" placeholder="${placeholder}" class="custom-split-input" data-member="${escapeHtml(m.name)}" value="${val}">
                    <span class="custom-split-suffix">${suffix}</span>
                </div>
            `;
            wrapper.appendChild(row);
        });
        DOM.splitOptions.appendChild(wrapper);
    }
}

function handleExpenseFormSubmit(e) {
    e.preventDefault();
    const desc = DOM.expenseDesc.value.trim();
    const amountRaw = parseFloat(DOM.expenseAmount.value);
    const cur = DOM.expenseCurrency.value;
    const payer = DOM.expensePayer.value;
    const catChoice = DOM.expenseCategorySelect.value;
    const splitMethod = DOM.splitMethodSelect.value;

    if (!desc || isNaN(amountRaw) || amountRaw <= 0) {
        showToast("Please enter a valid description and amount.", "error");
        return;
    }

    const amountInr = Math.round(convertAmount(amountRaw, cur, 'INR') * 100) / 100;

    let splitAmong = [];
    let customSplit = null;

    if (splitMethod === 'equally') {
        const checked = DOM.splitOptions.querySelectorAll('input[type="checkbox"]:checked');
        splitAmong = Array.from(checked).map(cb => cb.value);
        if (splitAmong.length === 0) {
            showToast("Please select at least one participating member.", "error");
            return;
        }
    } else {
        const inputs = DOM.splitOptions.querySelectorAll('.custom-split-input');
        customSplit = { method: splitMethod, values: {} };
        let total = 0;

        inputs.forEach(inp => {
            const val = parseFloat(inp.value) || 0;
            if (val > 0) {
                customSplit.values[inp.dataset.member] = val;
                total += val;
                splitAmong.push(inp.dataset.member);
            }
        });

        if (splitAmong.length === 0) {
            showToast("Please allocate values to at least one member.", "error");
            return;
        }

        if (splitMethod === 'percentage' && Math.abs(total - 100) > 0.5) {
            showToast(`Percentages must sum to 100% (Currently: ${total.toFixed(1)}%)`, "error");
            return;
        }
    }

    // Category determination
    let catInfo = categorizeExpense(desc);
    if (catChoice !== 'Auto') {
        const icons = {
            'Food & Dining': 'fa-utensils',
            'Transportation': 'fa-car',
            'Accommodation': 'fa-bed',
            'Entertainment': 'fa-gamepad',
            'Shopping': 'fa-bag-shopping',
            'Other': 'fa-receipt'
        };
        const classes = {
            'Food & Dining': 'cat-food',
            'Transportation': 'cat-travel',
            'Accommodation': 'cat-accomm',
            'Entertainment': 'cat-entert',
            'Shopping': 'cat-shop',
            'Other': 'cat-other'
        };
        catInfo = {
            name: catChoice,
            icon: icons[catChoice] || 'fa-receipt',
            cssClass: classes[catChoice] || 'cat-other'
        };
    }

    if (currentEditExpenseId) {
        const idx = state.expenses.findIndex(e => e.id === currentEditExpenseId);
        if (idx !== -1) {
            state.expenses[idx] = {
                ...state.expenses[idx],
                description: desc,
                amount: amountInr,
                originalAmount: amountRaw,
                originalCurrency: cur,
                payer: payer,
                splitAmong: splitAmong,
                customSplit: customSplit,
                category: catInfo.name,
                icon: catInfo.icon,
                cssClass: catInfo.cssClass
            };
            showToast("Expense updated successfully!", "success");
        }
    } else {
        const newEx = {
            id: 'exp_' + Date.now(),
            description: desc,
            amount: amountInr,
            originalAmount: amountRaw,
            originalCurrency: cur,
            payer: payer,
            splitAmong: splitAmong,
            customSplit: customSplit,
            category: catInfo.name,
            icon: catInfo.icon,
            cssClass: catInfo.cssClass,
            date: new Date().toLocaleDateString()
        };
        state.expenses.unshift(newEx);
        showToast(`Added "${desc}" to ledger`, "success");
    }

    closeExpenseModal();
    updateUI();
    saveData();
}

// --- AI Receipt OCR Scanner Simulator Engine ---
function openScannerModal() {
    if (DOM.receiptScannerModal) DOM.receiptScannerModal.classList.add('active');
    resetScannerUI();
}

function closeScannerModal() {
    if (DOM.receiptScannerModal) DOM.receiptScannerModal.classList.remove('active');
}

function resetScannerUI() {
    if (DOM.dropzonePrompt) DOM.dropzonePrompt.style.display = 'block';
    if (DOM.scanPreviewWrap) DOM.scanPreviewWrap.style.display = 'none';
    if (DOM.extractedDataCard) DOM.extractedDataCard.style.display = 'none';
    lastExtractedReceipt = null;
}

function handleReceiptFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        runScannerAnimation(e.target.result, {
            merchant: "Store Purchase",
            amount: 1450.00,
            currency: "INR",
            category: "Shopping",
            date: new Date().toLocaleDateString()
        });
    };
    reader.readAsDataURL(file);
}

function simulateReceiptScan(type) {
    const samples = {
        dinner: {
            img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
            merchant: "Mario's Italian Bistro",
            amount: 2450.00,
            currency: "INR",
            category: "Food & Dining",
            date: new Date().toLocaleDateString()
        },
        uber: {
            img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
            merchant: "Uber Airport Cab",
            amount: 680.00,
            currency: "INR",
            category: "Transportation",
            date: new Date().toLocaleDateString()
        },
        resort: {
            img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
            merchant: "Palm Grove Luxury Resort",
            amount: 8200.00,
            currency: "INR",
            category: "Accommodation",
            date: new Date().toLocaleDateString()
        }
    };

    const chosen = samples[type] || samples.dinner;
    runScannerAnimation(chosen.img, chosen);
}

function runScannerAnimation(imgSrc, data) {
    if (DOM.dropzonePrompt) DOM.dropzonePrompt.style.display = 'none';
    if (DOM.scanPreviewWrap) DOM.scanPreviewWrap.style.display = 'block';
    if (DOM.scanPreviewImg) DOM.scanPreviewImg.src = imgSrc;
    if (DOM.extractedDataCard) DOM.extractedDataCard.style.display = 'none';

    // Simulate AI Vision recognition latency
    setTimeout(() => {
        lastExtractedReceipt = data;
        if (DOM.extMerchant) DOM.extMerchant.textContent = data.merchant;
        if (DOM.extAmount) DOM.extAmount.textContent = formatCurrency(data.amount, data.currency);
        if (DOM.extCategory) DOM.extCategory.textContent = data.category;
        if (DOM.extDate) DOM.extDate.textContent = data.date;
        if (DOM.extractedDataCard) DOM.extractedDataCard.style.display = 'flex';
        showToast("✨ AI OCR successfully scanned receipt!", "success");
    }, 1200);
}

function applyExtractedDataToForm() {
    if (!lastExtractedReceipt) return;
    closeScannerModal();
    openExpenseModal();

    DOM.expenseDesc.value = lastExtractedReceipt.merchant;
    DOM.expenseAmount.value = lastExtractedReceipt.amount;
    DOM.expenseCurrency.value = lastExtractedReceipt.currency;
    DOM.expenseCategorySelect.value = lastExtractedReceipt.category;
    showToast("Extracted receipt data applied to form!", "info");
}

// --- Settle Up Modal & Dynamic UPI QR Engine ---
function openSettleModal(from, to, amount) {
    activeSettlementTarget = { from, to, amount };

    const fromMem = state.members.find(m => m.name === from);
    const toMem = state.members.find(m => m.name === to);

    if (DOM.settleFromName) DOM.settleFromName.textContent = from;
    if (DOM.settleToName) DOM.settleToName.textContent = to;
    if (DOM.settleFromAvatar) DOM.settleFromAvatar.src = fromMem?.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${from}`;
    if (DOM.settleToAvatar) DOM.settleToAvatar.src = toMem?.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${to}`;
    if (DOM.settleModalAmount) DOM.settleModalAmount.textContent = formatCurrency(amount);

    const upiId = `splitzai.${to.toLowerCase().replace(/[^a-z0-9]/g, '')}@okhdfcbank`;
    if (DOM.upiDisplayId) DOM.upiDisplayId.textContent = upiId;

    // Generate high-contrast SVG QR Code offline
    generateSvgQr(upiId, amount);

    if (DOM.settleModal) DOM.settleModal.classList.add('active');
}

function closeSettleModal() {
    if (DOM.settleModal) DOM.settleModal.classList.remove('active');
    activeSettlementTarget = null;
}

function confirmActiveSettlement() {
    if (!activeSettlementTarget) return;
    const { from, to, amount } = activeSettlementTarget;

    const settlementEx = {
        id: 'settle_' + Date.now(),
        description: `Settlement: ${from} paid ${to}`,
        amount: amount,
        originalAmount: amount,
        originalCurrency: systemState.globalCurrency,
        payer: from,
        splitAmong: [to],
        customSplit: null,
        category: 'Settlement',
        icon: 'fa-handshake',
        cssClass: 'cat-settlement',
        date: new Date().toLocaleDateString()
    };

    state.expenses.unshift(settlementEx);
    closeSettleModal();
    updateUI();
    saveData();
    triggerConfetti();
    showToast(`🎉 Recorded settlement: ${from} settled ${formatCurrency(amount)} with ${to}!`, 'success');
}

// Clean offline SVG QR matrix generator
function generateSvgQr(upi, amount) {
    if (!DOM.settleQrCode) return;
    // Generate clean QR-like pattern SVG
    const size = 100;
    const cells = 15;
    const cellSize = size / cells;
    let svg = `<svg viewBox="0 0 ${size} ${size}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="#ffffff"/>`;

    // Position detection squares (top-left, top-right, bottom-left)
    const drawCorner = (ox, oy) => {
        svg += `<rect x="${ox}" y="${oy}" width="${cellSize * 4}" height="${cellSize * 4}" fill="#0f172a"/>`;
        svg += `<rect x="${ox + cellSize}" y="${oy + cellSize}" width="${cellSize * 2}" height="${cellSize * 2}" fill="#ffffff"/>`;
        svg += `<rect x="${ox + cellSize * 1.5}" y="${oy + cellSize * 1.5}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
    };

    drawCorner(0, 0);
    drawCorner((cells - 4) * cellSize, 0);
    drawCorner(0, (cells - 4) * cellSize);

    // Pseudorandom internal pattern based on string hash
    let hash = 0;
    const str = `${upi}_${amount}`;
    for (let k = 0; k < str.length; k++) hash = (hash * 31 + str.charCodeAt(k)) & 0xffffffff;

    for (let r = 0; r < cells; r++) {
        for (let c = 0; c < cells; c++) {
            // skip corners
            if ((r < 5 && c < 5) || (r < 5 && c >= cells - 5) || (r >= cells - 5 && c < 5)) continue;
            const bit = (hash >> ((r * cells + c) % 31)) & 1;
            if (bit === 1) {
                svg += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
            }
        }
    }
    svg += `</svg>`;
    DOM.settleQrCode.innerHTML = svg;
}

// --- Export & Sharing Hub Engine ---
function populateSummaryPreview() {
    if (!DOM.summaryPreviewText) return;
    const balances = calculateBalances();
    const settlements = simplifyDebts(balances);

    let total = 0;
    state.expenses.forEach(e => { if (e.category !== 'Settlement') total += e.amount; });

    let lines = [];
    lines.push(`⚡ SplitzAI Group Summary: ${state.groupName}`);
    lines.push(`📅 Date: ${new Date().toLocaleDateString()}`);
    lines.push(`💰 Total Group Spending: ${formatCurrency(total)}`);
    lines.push(`👥 Members (${state.members.length}): ${state.members.map(m => m.name).join(', ')}`);
    lines.push(`\n--- 🤝 WHO OWES WHOM ---`);
    if (settlements.length === 0) {
        lines.push(`🎉 All settled up! No active debts.`);
    } else {
        settlements.forEach(s => {
            lines.push(`👉 ${s.from} owes ${s.to} : ${formatCurrency(s.amount)}`);
        });
    }
    lines.push(`\nPowered by SplitzAI (splitzai.vercel.app)`);
    DOM.summaryPreviewText.value = lines.join('\n');
}

function exportToCsv() {
    let rows = [["Date", "Description", "Category", "Paid By", "Amount (INR)", "Split Among"]];
    state.expenses.forEach(ex => {
        rows.push([
            ex.date || '',
            `"${(ex.description || '').replace(/"/g, '""')}"`,
            ex.category || '',
            ex.payer || '',
            ex.amount.toFixed(2),
            `"${(ex.splitAmong || []).join('; ')}"`
        ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `SplitzAI_${state.groupName.replace(/\s+/g, '_')}_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV ledger downloaded!", "success");
}

function exportToJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemState, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `SplitzAI_Backup_${Date.now()}.json`);
    dl.click();
    showToast("JSON ecosystem backup downloaded!", "success");
}

function importFromJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.groups && Array.isArray(parsed.groups)) {
                systemState = parsed;
                setActiveGroup(systemState.activeGroupId || systemState.groups[0].id);
                updateUI();
                saveData();
                showToast("Workspace ecosystem restored successfully!", "success");
            } else {
                showToast("Invalid SplitzAI backup file.", "error");
            }
        } catch (err) {
            showToast("Failed to parse JSON file.", "error");
        }
    };
    reader.readAsText(file);
}

// --- Global Action Functions (Delete, Edit, Member remove) ---
window.editExpense = function(id) {
    openExpenseModal(id);
};

window.deleteExpense = function(id) {
    showConfirm("Delete Expense?", "Are you sure you want to delete this expense record?", () => {
        state.expenses = state.expenses.filter(e => e.id !== id);
        updateUI();
        saveData();
        showToast("Expense removed from ledger", "info");
    });
};

window.removeMember = function(memberId) {
    const m = state.members.find(mem => mem.id === memberId);
    if (!m) return;
    const hasExpenses = state.expenses.some(ex => ex.payer === m.name || (ex.splitAmong && ex.splitAmong.includes(m.name)));
    if (hasExpenses) {
        showToast(`Cannot remove "${m.name}" because they have existing expenses.`, "error");
        return;
    }
    state.members = state.members.filter(mem => mem.id !== memberId);
    updateUI();
    saveData();
    showToast(`Removed ${m.name}`, "info");
};

// --- Custom Confirmation Dialog (Non-blocking) ---
function showConfirm(title, message, onConfirm) {
    if (!DOM.confirmDialogModal) {
        if (confirm(`${title}\n${message}`)) onConfirm();
        return;
    }
    DOM.confirmDialogTitle.textContent = title;
    DOM.confirmDialogMessage.textContent = message;
    DOM.confirmDialogModal.classList.add('active');

    const handleAccept = () => {
        DOM.confirmDialogModal.classList.remove('active');
        DOM.btnConfirmAccept.removeEventListener('click', handleAccept);
        DOM.btnConfirmCancel.removeEventListener('click', handleCancel);
        onConfirm();
    };

    const handleCancel = () => {
        DOM.confirmDialogModal.classList.remove('active');
        DOM.btnConfirmAccept.removeEventListener('click', handleAccept);
        DOM.btnConfirmCancel.removeEventListener('click', handleCancel);
    };

    DOM.btnConfirmAccept.addEventListener('click', handleAccept);
    DOM.btnConfirmCancel.addEventListener('click', handleCancel);
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast-pill toast-${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon} toast-icon"></i> <span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
}

// --- Confetti Celebration Engine ---
function triggerConfetti() {
    const canvas = DOM.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#2dd4bf', '#06b6d4', '#c084fc', '#f59e0b', '#10b981', '#f43f5e'];

    for (let i = 0; i < 90; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: Math.random() * 6 + 4,
            d: Math.random() * 90,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
            tiltAngle: 0,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16 - 4
        });
    }

    let frames = 0;
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frames++;
        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2 + p.vy;
            p.x += Math.sin(p.d) * 2 + p.vx;
            p.vy += 0.15; // gravity
            p.tilt = Math.sin(p.tiltAngle - (frames / 3)) * 15;

            ctx.beginPath();
            ctx.lineWidth = p.r / 2;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        });

        if (frames < 120) {
            requestAnimationFrame(render);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    render();
}

// --- Utility Helpers ---
function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run init on DOM ready
document.addEventListener('DOMContentLoaded', init);
