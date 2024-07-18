$(document).ready(function () {
    let transactionChart; // Variable to hold the chart instance

    const data = {
        customers: [
            { id: 1, name: "Ahmed Ali" },
            { id: 2, name: "Aya Elsayed" },
            { id: 3, name: "Mina Adel" },
            { id: 4, name: "Sarah Reda" },
            { id: 5, name: "Mohamed Sayed" }
        ],
        transactions: [
            { id: 1, customer_id: 1, date: "2022-01-01", amount: 1000 },
            { id: 2, customer_id: 1, date: "2022-01-02", amount: 2000 },
            { id: 3, customer_id: 2, date: "2022-01-01", amount: 550 },
            { id: 4, customer_id: 3, date: "2022-01-01", amount: 500 },
            { id: 5, customer_id: 2, date: "2022-01-02", amount: 1300 },
            { id: 6, customer_id: 4, date: "2022-01-01", amount: 750 },
            { id: 7, customer_id: 3, date: "2022-01-02", amount: 1250 },
            { id: 8, customer_id: 5, date: "2022-01-01", amount: 2500 },
            { id: 9, customer_id: 5, date: "2022-01-02", amount: 875 }
        ]
    };

    const filterNameInput = $('#filter-name');
    const filterAmountInput = $('#filter-amount');
    const customersTableBody = $('#customers-table tbody');
    const transactionChartCanvas = $('#transaction-chart');

    const customers = data.customers;
    const transactions = data.transactions;

    function renderTable() {
        customersTableBody.empty();

        const filteredCustomers = customers.filter(customer => {
            return customer.name.toLowerCase().includes(filterNameInput.val().toLowerCase());
        });

        const filteredTransactions = transactions.filter(transaction => {
            return transaction.amount >= (filterAmountInput.val() ? parseFloat(filterAmountInput.val()) : 0);
        });

        const customerTransactionsMap = filteredTransactions.reduce((acc, transaction) => {
            if (!acc[transaction.customer_id]) {
                acc[transaction.customer_id] = { amount: 0, count: 0, transactions: [] };
            }
            acc[transaction.customer_id].amount += transaction.amount;
            acc[transaction.customer_id].count++;
            acc[transaction.customer_id].transactions.push(transaction);
            return acc;
        }, {});

        filteredCustomers.forEach(customer => {
            if (customerTransactionsMap[customer.id]) {
                const totalAmount = customerTransactionsMap[customer.id].amount;
                const transactionCount = customerTransactionsMap[customer.id].count;

                const $row = $('<tr>');
                $row.append(`<td>${customer.name}</td>`);
                $row.append(`<td>${totalAmount}</td>`);
                $row.append(`<td>${transactionCount}</td>`);
                $row.append(`<td><button class="btn btn-primary btn-sm show-transactions">Show Transactions</button></td>`);
                $row.data('transactions', customerTransactionsMap[customer.id].transactions);
                customersTableBody.append($row);


                const $transactionRow = $('<tr class="transaction-details" style="display: none;">');
                const $transactionCell = $('<td colspan="4">');
                $transactionRow.append($transactionCell);
                customersTableBody.append($transactionRow);
            }
        });
    }

    function renderChart(customerTransactions) {
        if (transactionChart) {
            transactionChart.destroy();
        }

        const labels = [...new Set(customerTransactions.map(trans => trans.date))];
        const amounts = labels.map(label => {
            return customerTransactions.filter(trans => trans.date === label)
                .reduce((total, trans) => total + trans.amount, 0);
        });

        transactionChart = new Chart(transactionChartCanvas[0].getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Transaction Amount',
                    data: amounts,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    filterNameInput.on('input', renderTable);
    filterAmountInput.on('input', renderTable);

    customersTableBody.on('click', '.show-transactions', function () {
        const $row = $(this).closest('tr');
        const $nextRow = $row.next('.transaction-details');

        if ($nextRow.is(':visible')) {
            $nextRow.hide();
        } else {
            const customerTransactions = $row.data('transactions');
            if (customerTransactions) {
                const transactionDetails = customerTransactions.map(trans => {
                    return `<p>Date: ${trans.date}, Amount: ${trans.amount}</p>`;
                }).join('');
                $nextRow.find('td').html(transactionDetails);
                renderChart(customerTransactions);
                $nextRow.show();
            }
        }
    });

    renderTable();
});
