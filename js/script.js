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

        // Bill name
        row.insertCell(0).textContent =
            bill.name;

        // NEW FEATURE - COUNTRY
        row.insertCell(1).textContent =
            bill.country || "-";

        // NEW  FEATURE - CURRENCY
        row.insertCell(2).textContent =
            bill.currency || "-";

        // ORIGINAL AMOUNT
        row.insertCell(3).textContent =
            `${Number(bill.originalAmount ?? bill.amount).toFixed(2)} ${bill.currency || ""}`;

        // CONVERTED AMOUNT IN EUR
        row.insertCell(4).textContent =
            bill.convertedAmount != null
                ? `${Number(bill.convertedAmount).toFixed(2)} EUR`
                : "-";

        // Date
        row.insertCell(5).textContent =
            bill.date;

        const statusCell =
            row.insertCell(6);

        statusCell.innerHTML =
            bill.status === "paid"
                ? `<span class="paid">Paid</span>`
                : `<span class="unpaid">Unpaid</span>`;

        const actionCell =
            row.insertCell(7);

        if (bill.status === "unpaid") {

            actionCell.innerHTML = `
                <button class="action-paid" onclick="markAsPaid(${index})">
                    Mark as Paid
                </button>
                <button class="action-delete" onclick="deleteBill(${index})">
                    Delete
                </button>
            `;

        } else {

            actionCell.innerHTML = `
                <button class="action-paid" disabled>
                    Paid
                </button>
                <button class="action-delete" onclick="deleteBill(${index})">
                    Delete
                </button>
            `;

        }

        total += Number(bill.convertedAmount ?? bill.amount);

    });

    totalAmount.textContent =
        total.toFixed(2);

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

        // NEW FEATURE - COUNTRY SELECTED
    country: countryNameDisplay.textContent,

    // NEW FEATURE - ORIGINAL CURRENCY CODE
    currency: sourceCurrency.textContent,

    // NEW FEATURE - ORIGINAL AMOUNT ENTERED BY USER
    amount: amount,

    // NEW FEATURE - CONVERTED AMOUNT IN EUR
    convertedAmount:
        amount *
        parseFloat(exchangeRateDisplay.textContent),


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

//NEW FEATURES ADDITIONS START HERE!

// NEW FEATURE - REST COUNTRIES DOM ELEMENTS
const countrySelect = document.getElementById("countrySelect");
const countryFlag = document.getElementById("countryFlag");
const countryNameDisplay = document.getElementById("countryName");
const countryCapital = document.getElementById("countryCapital");
const countryCurrency = document.getElementById("countryCurrency");
const sourceCurrency = document.getElementById("sourceCurrency");
const exchangeRateDisplay = document.getElementById("exchangeRate");

// NEW FEATURE - LOAD COUNTRIES INTO DROPDOWN
const API_KEY = "rc_live_bf874cf2f9cb4e659c95c18cde11cc17";

async function loadCountries() {

    try {

        const response = await fetch(
            "https://api.restcountries.com/countries/v5?limit=100",
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`
                }
            }
        );

        const data = await response.json();

        console.log("STATUS:", response.status);

        const countries =
            data.data.objects;

        countries.forEach(country => {

            const option =
                document.createElement("option");

            option.value =
                country.names.common;

            option.textContent =
                country.names.common;

            countrySelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Error loading countries:",
            error
        );

    }
}


// NEW FEATURE - DISPLAY COUNTRY INFORMATION
async function displayCountryInfo(countryName) {

    try {

        const response = await fetch(
            `https://api.restcountries.com/countries/v5/names.common/${encodeURIComponent(countryName)}`,
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`
                }
            }
        );

        const result = await response.json();

        const country =
            result.data.objects[0];

        countryNameDisplay.textContent =
            country.names.common;

        countryCapital.textContent =
            country.capitals
                ? country.capitals[0].name
                : "N/A";

        const currencyCode =
            country.currencies[0].code;

        countryCurrency.textContent =
            currencyCode;

        sourceCurrency.textContent =
            currencyCode;

        if (
            country.flag &&
            country.flag.url_png
        ) {

            countryFlag.src =
                country.flag.url_png;

        }

        getExchangeRate(currencyCode);

    } catch (error) {

        console.error(
            "Error displaying country information:",
            error
        );

    }
}

// NEW FEATURE - FETCH EXCHANGE RATE FROM FRANKFURTER API
async function getExchangeRate(currencyCode) {

    try {

        if (currencyCode === "EUR") {

            exchangeRateDisplay.textContent = "1.0000";

            return;

        }

        const response = await fetch(
            `https://api.frankfurter.dev/v2/rate/${currencyCode}/EUR`
        );

        const data = await response.json();

        console.log("FRANKFURTER DATA:", data);

        exchangeRateDisplay.textContent =
            Number(data.rate).toFixed(4);

    } catch (error) {

        console.error(
            "Error loading exchange rate:",
            error
        );

    }
}

// NEW FEATURE - COUNTRY DROPDOWN EVENT LISTENER
countrySelect.addEventListener(
    "change",
    function () {

        if (countrySelect.value) {

            displayCountryInfo(
                countrySelect.value
            );

        }

    }
);

// NEW FEATURE - LOAD COUNTRIES WHEN PAGE STARTS
window.onload = function () {

    displayBills();

    loadCountries();

};

