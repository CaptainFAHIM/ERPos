"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, TextInput, Spinner } from "flowbite-react";
import { FaSearch, FaPrint, FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function SupplierDueReportContent() {
  const [dueReport, setDueReport] = useState([]);
  const [filteredDueReport, setFilteredDueReport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDueReport();
  }, []);

  const fetchDueReport = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/payments/");
      
      // Filter out payments where status is "Paid"
      const unpaidPayments = response.data.filter((entry) => entry.status !== "Paid");

      setDueReport(unpaidPayments);
      setFilteredDueReport(unpaidPayments);
    } catch (error) {
      console.error("Error fetching supplier due report:", error);
      setDueReport([]);
      setFilteredDueReport([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const filtered = dueReport.filter((entry) =>
      Object.values(entry).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredDueReport(filtered);
  }, [searchTerm, dueReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredDueReport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SupplierDueReport");
    XLSX.writeFile(workbook, "supplier_due_report_export.xlsx");
  };

  return (
    <div className="container mx-auto max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Supplier Due Report</h1>
        <div className="flex space-x-2">
          <Button onClick={handlePrint}>
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button onClick={handleExcelExport}>
            <FaFileExcel className="mr-2" /> Export to Excel
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <TextInput
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FaSearch}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          {filteredDueReport.length === 0 && (
            <div className="text-center py-4">No due reports found</div>
          )}
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Supplier</Table.HeadCell>
                <Table.HeadCell>Due Amount</Table.HeadCell>
                <Table.HeadCell>Last Payment Date</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredDueReport.map((entry, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{entry.supplier?.name || "Unknown"}</Table.Cell>
                    <Table.Cell>
                      ৳{entry.dueAmount ? entry.dueAmount.toFixed(2) : "0.00"}
                    </Table.Cell>
                    <Table.Cell>
                      {entry.lastPaymentDate
                        ? new Date(entry.lastPaymentDate).toLocaleDateString()
                        : "N/A"}
                    </Table.Cell>
                    <Table.Cell>{entry.status || "Pending"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
