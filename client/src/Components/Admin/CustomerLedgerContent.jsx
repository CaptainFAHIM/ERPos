import { Table } from "flowbite-react";

export default function CustomerLedgerContent() {
  const transactions = [
    { date: "2025-02-01", customer: "John Doe", amount: "$150", status: "Paid" },
    { date: "2025-02-02", customer: "Alice Smith", amount: "$200", status: "Due" },
  ];

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
