"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, TextInput, Spinner } from "flowbite-react";
import { FaSearch, FaPrint, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function PurchaseReportContent() {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/payments/");
      const paidPurchases = response.data.filter(
        (entry) => entry.supplier?.dueAmount <= 0 // Only get paid data
      );
      setPurchases(paidPurchases);
      setFilteredPurchases(paidPurchases);
    } catch (error) {
      console.error("Error fetching purchase report:", error);
      setPurchases([]);
      setFilteredPurchases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = purchases.filter((entry) => {
      const matchesSearch = Object.values(entry).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const entryDate = new Date(entry.createdAt);
      const matchesDateRange =
        (!startDate || entryDate >= new Date(startDate)) &&
        (!endDate || entryDate <= new Date(endDate));
      return matchesSearch && matchesDateRange;
    });
    setFilteredPurchases(filtered);
  }, [searchTerm, purchases, startDate, endDate]);

  const handlePrint = () => {
    const printContent = document.getElementById("printableTable")?.outerHTML;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Purchase Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; padding: 0; }
              table { border-collapse: collapse; width: 100%; }
              th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
              th { background-color: #4CAF50; color: white; }
            </style>
          </head>
          <body>
            <h1>Purchase Report</h1>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPurchases.map((entry) => ({
        Date: new Date(entry.createdAt).toLocaleDateString(),
        Supplier: entry.supplier?.name ?? "N/A",
        "Total Price": entry.totalPrice ?? 0,
        "Paid Amount": entry.paidAmount ?? 0,
        "Current Due": entry.supplier?.dueAmount ?? 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseReport");
    XLSX.writeFile(workbook, "purchase_report_export.xlsx");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Purchase Report</h1>
        <div className="flex space-x-2">
          <Button onClick={handlePrint}>
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button onClick={handleExcelExport}>
            <FaFileExcel className="mr-2" /> Export to Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <TextInput
          type="text"
          placeholder="Search report..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FaSearch}
        />
        <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-4">No purchase records found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table striped id="printableTable">
                <Table.Head>
                  <Table.HeadCell>Date</Table.HeadCell>
                  <Table.HeadCell>Supplier</Table.HeadCell>
                  <Table.HeadCell>Total Price</Table.HeadCell>
                  <Table.HeadCell>Paid Amount</Table.HeadCell>
                  <Table.HeadCell>Current Due</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {filteredPurchases.map((entry) => (
                    <Table.Row key={entry._id}>
                      <Table.Cell>{new Date(entry.createdAt).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>{entry.supplier?.name ?? "N/A"}</Table.Cell>
                      <Table.Cell>৳{(entry.totalPrice ?? 0).toFixed(2)}</Table.Cell>
                      <Table.Cell>৳{(entry.paidAmount ?? 0).toFixed(2)}</Table.Cell>
                      <Table.Cell>৳{(entry.supplier?.dueAmount ?? 0).toFixed(2)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
