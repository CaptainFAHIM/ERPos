import { Table } from "flowbite-react";
import { useEffect, useState } from "react";

export default function CustomerLedgerContent() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/sales/")
      .then(response => response.json())
      .then(data => {
        const formattedTransactions = data.map(sale => ({
          date: sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A",
          customer: sale.customerName || "Unknown",
          amount: `Tk ${sale.finalAmount ? sale.finalAmount.toLocaleString() : "0"}`,
          status: "Paid"
        }));
        setTransactions(formattedTransactions);
      })
      .catch(error => console.error("Error fetching sales data:", error));
  }, []);

  return (
    <div className="overflow-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Customer Ledger</h1>
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Customer</Table.HeadCell>
          <Table.HeadCell>Amount</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {transactions.map((t, index) => (
            <Table.Row key={index}>
              <Table.Cell>{t.date}</Table.Cell>
              <Table.Cell>{t.customer}</Table.Cell>
              <Table.Cell>{t.amount}</Table.Cell>
              <Table.Cell>{t.status}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
