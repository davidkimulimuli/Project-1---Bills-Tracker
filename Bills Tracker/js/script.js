// DOM ELEMENTS
const billForm = document.getElementById("billForm");
const billTable = document.getElementById("billTable");
const clearAllButton = document.getElementById("clearAll");
const totalAmount = document.getElementById("totalAmount");
const billNameField = document.getElementById("billName");
const billAmountField = document.getElementById("amountName");

// Retrieve bills from LocalStorage (JSON)
function getBills() {
    const data = localStorage.getItem("bills");
    return data ? JSON.parse(data) : [];
}

// Save bills to LocalStorage (JSON)
function saveBills(bills) {
    localStorage.setItem("bills", JSON.stringify(bills));
}

// Display bills in the table
function displayBills() {
    for (let i = billTable.rows.length - 1; i > 0; i--) {
        billTable.deleteRow(i);
    }

    const bills = getBills();
    let total = 0;

    bills.forEach((bill, index) => {
        const row = billTable.insertRow(-1);

        row.insertCell(0).textContent = bill.name;
        row.insertCell(1).textContent = bill.amount.toFixed(2) + " €";
        row.insertCell(2).textContent = bill.date;

        const statusCell = row.insertCell(3);
        statusCell.innerHTML =
            bill.status === "paid"
                ? `<span class="paid">Paid</span>`
                : `<span class="unpaid">Unpaid</span>`;

        const actionCell = row.insertCell(4);

        if (bill.status === "unpaid") {
            actionCell.innerHTML = `
                <button class="action-paid" onclick="markAsPaid(${index})">Mark as Paid</button>
                <button class="action-delete" onclick="deleteBill(${index})">Delete</button>
            `;
        } else {
            actionCell.innerHTML = `
                <button class="action-paid" disabled>Paid</button>
                <button class="action-delete" onclick="deleteBill(${index})">Delete</button>
            `;
        }

        total += bill.amount;
    });

    totalAmount.textContent = total.toFixed(2);
}

// Add bill (with validation + automatic date)
billForm.addEventListener("submit", function (event) {
    event.preventDefault();

    billNameField.classList.remove("invalid");
    billAmountField.classList.remove("invalid");

    const name = billNameField.value.trim();
    const amount = parseFloat(billAmountField.value);

    if (name.length < 2) {
        billNameField.classList.add("invalid");
        alert("Bill name must contain at least 2 characters.");
        billNameField.focus();
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        billAmountField.classList.add("invalid");
        alert("Amount must be a positive number.");
        billAmountField.focus();
        return;
    }

    const today = new Date().toLocaleDateString();

    const bills = getBills();
    bills.push({
        name: name,
        amount: amount,
        status: "unpaid",
        date: today
    });

    saveBills(bills);
    displayBills();
    billForm.reset();
});

// Mark bill as paid
function markAsPaid(index) {
    const bills = getBills();
    bills[index].status = "paid";
    saveBills(bills);
    displayBills();
}

// Delete bill
function deleteBill(index) {
    const bills = getBills();
    bills.splice(index, 1);
    saveBills(bills);
    displayBills();
}

// Clear all bills
clearAllButton.addEventListener("click", function () {
    localStorage.removeItem("bills");
    displayBills();
});

// Load bills on startup
window.onload = displayBills;
