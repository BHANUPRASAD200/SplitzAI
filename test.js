const state = { members: ["Alice", "Bob", "Charlie", "Dave"] };
function parseNLPExpense(text) {
    const rawText = text.toLowerCase();
    
    // Extract amount
    const amountMatch = rawText.match(/(?:(?:rs|inr|₹|\$|£|€)?\s*)(\d+(?:\.\d{1,2})?)/);
    if (!amountMatch) return { success: false, reason: "No amount found" };
    const amount = parseFloat(amountMatch[1]);
    
    // Find payer (first mentioned member)
    let payer = null;
    let minIndex = 9999;
    state.members.forEach(mem => {
        const idx = rawText.indexOf(mem.toLowerCase());
        if (idx !== -1 && idx < minIndex) {
            payer = mem;
            minIndex = idx;
        }
    });
    if (!payer) return { success: false, reason: "No payer identified" };
    
    // Find split among
    let splitAmong = [];
    state.members.forEach(mem => {
        if (rawText.includes(mem.toLowerCase())) {
            splitAmong.push(mem);
        }
    });

    console.log("Payer:", payer);
    console.log("Split among raw:", splitAmong);
    
    return splitAmong;
}

parseNLPExpense("3000 bill paid by alice for lunch for bob and charlie");
