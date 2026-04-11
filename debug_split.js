const state = {
    members: ["Alice", "Bob", "Charlie"],
    expenses: [
        {
            id: "1",
            description: "Lunch",
            amount: 3000,
            payer: "Alice",
            splitAmong: ["Alice", "Bob", "Charlie"],
            customSplit: null,
            category: "Food",
            icon: "fa-utensils",
            cssClass: "cat-food",
            date: "10/04/2026"
        }
    ]
};

function calculateBalances() {
    let balances = {};
    state.members.forEach(m => balances[m] = 0);

    state.expenses.forEach(ex => {
        const amountCents = Math.round(ex.amount * 100);
        const payer = ex.payer;

        if(balances[payer] !== undefined) {
            balances[payer] += amountCents;
        }

        if (ex.customSplit) {
            // Skip for this test
        } else {
            const splitCount = ex.splitAmong.length;
            const perPersonCents = Math.floor(amountCents / splitCount);
            let remainderCents = amountCents % splitCount;

            ex.splitAmong.forEach(person => {
                if(balances[person] !== undefined) {
                    let charge = perPersonCents;
                    if (remainderCents > 0) {
                        charge += 1;
                        remainderCents -= 1;
                    }
                    balances[person] -= charge;
                }
            });
        }
    });

    return balances;
}

function simplifyDebts(balances) {
    let debtors = [];
    let creditors = [];

    for (const [person, amountCents] of Object.entries(balances)) {
        if (amountCents < 0) debtors.push({ person, amount: Math.abs(amountCents) });
        else if (amountCents > 0) creditors.push({ person, amount: amountCents });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let settlements = [];
    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
        let debtor = debtors[i];
        let creditor = creditors[j];
        let minAmountCents = Math.min(debtor.amount, creditor.amount);

        if (minAmountCents > 0) {
            settlements.push({
                from: debtor.person,
                to: creditor.person,
                amount: minAmountCents / 100 
            });
        }

        debtor.amount -= minAmountCents;
        creditor.amount -= minAmountCents;

        if (debtor.amount === 0) i++;
        if (creditor.amount === 0) j++;
    }
    return settlements;
}

const balances = calculateBalances();
console.log("Balances (cents):", balances);
const settlements = simplifyDebts(balances);
console.log("Settlements:", settlements);
