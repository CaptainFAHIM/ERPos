import { Table } from "flowbite-react";

export default function LowStockReportContent() {
  return (
    <div className="overflow-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Low Stock Report</h1>

      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Product</Table.HeadCell>
          <Table.HeadCell>Current Stock</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          <Table.Row>
            <Table.Cell>Wireless Mouse</Table.Cell>
            <Table.Cell>5</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </div>
  );
}
