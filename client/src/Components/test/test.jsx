import React, { useRef } from "react";
import { Button } from "flowbite-react";

const InvoiceReceipt = () => {
  const transactionNumber = "TXN123456789"; // Example transaction number
  const barcodeURL = `https://barcode.tec-it.com/barcode.ashx?data=${transactionNumber}&code=Code128&dpi=96`; // Barcode image URL

  const items = [
    { name: "Item 1", quantity: 2, price: 50 },
    { name: "Item 2", quantity: 1, price: 75 },
    // Add more items as needed
  ];

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  // Reference for the print section
  const printRef = useRef();

  // Print function (normal method)
  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={printRef} className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-300">
      {/* Invoice Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Shop Name</h1>
        <p className="text-gray-600">Your Shop Address, City, Country</p>
        <hr className="my-4 border-gray-300" />
      </div>

      {/* Transaction Number & Barcode */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">Transaction No:</p>
          <p className="text-lg font-bold text-blue-600">{transactionNumber}</p>
        </div>
        <img src={barcodeURL} alt="Barcode" className="h-14" />
      </div>

      {/* Invoice Table */}
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Item</th>
            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Price (৳)</th>
            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Total (৳)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-t border-gray-300">
              <td className="py-2 px-4 text-sm text-gray-800">{item.name}</td>
              <td className="py-2 px-4 text-sm text-gray-800">{item.quantity}</td>
              <td className="py-2 px-4 text-sm text-gray-800">৳{item.price.toFixed(2)}</td>
              <td className="py-2 px-4 text-sm text-gray-800">৳{(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Amount */}
      <div className="mt-4 flex justify-end text-lg font-semibold text-gray-800">
        <span className="mr-2">Total: </span>
        <span className="text-xl text-blue-600">৳{calculateTotal().toFixed(2)}</span>
      </div>

      {/* Thank You Message */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">Thank you for your purchase!</p>
      </div>

      {/* Print Button */}
      <div className="text-center mt-6">
        <Button color="success" className="mt-4" onClick={handlePrint}>Print Invoice</Button>
      </div>
    </div>
  );
};

export default InvoiceReceipt;
