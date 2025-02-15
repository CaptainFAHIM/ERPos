import React, { useState, useEffect } from "react";
import { ShoppingCart, CreditCard, Search, DollarSign, Calculator, Trash2, BarChart, Key, LogOut } from "lucide-react";

// Dummy data for different components
const initialCart = [
  { id: 1, barcode: "123456789", description: "Product A", price: 10.0, qty: 2, discount: 0, total: 20.0 },
  { id: 2, barcode: "987654321", description: "Product B", price: 5.0, qty: 1, discount: 0.5, total: 4.5 }
];

const TableComponent = () => (
  <div className="p-4">
    <table className="w-full border-collapse border border-gray-300">
      <thead className="bg-gray-800 text-white">
        <tr>
          <th className="border p-2">No</th>
          <th className="border p-2">Barcode</th>
          <th className="border p-2">Description</th>
          <th className="border p-2">Price</th>
          <th className="border p-2">Qty</th>
          <th className="border p-2">Discount</th>
          <th className="border p-2">Total</th>
        </tr>
      </thead>
      <tbody>
        {initialCart.map((item, index) => (
          <tr key={item.id} className="text-center">
            <td className="border p-2">{index + 1}</td>
            <td className="border p-2">{item.barcode}</td>
            <td className="border p-2">{item.description}</td>
            <td className="border p-2">${item.price.toFixed(2)}</td>
            <td className="border p-2">{item.qty}</td>
            <td className="border p-2">${item.discount.toFixed(2)}</td>
            <td className="border p-2">${item.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const components = {
  "New Transaction": <TableComponent />,
  "Search Product": (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Search Product</h2>
      <input type="text" className="border p-2 w-full" placeholder="Enter barcode or product name..." />
    </div>
  ),
  "Add Discount": (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Add Discount</h2>
      <input type="number" className="border p-2 w-full" placeholder="Enter discount amount..." />
    </div>
  ),
  "Settle Payment": (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Settle Payment</h2>
      <p>Dummy payment process here...</p>
    </div>
  ),
  "Clear Cart": (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Clear Cart</h2>
      <p>Are you sure you want to clear the cart?</p>
      <button className="bg-red-500 text-white p-2 mt-2">Clear Cart</button>
    </div>
  ),
  "Daily Sales": (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Daily Sales</h2>
      <p>Today's total sales: $100.00</p>
    </div>
  ),
  "Change Password": (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Change Password</h2>
      <input type="password" className="border p-2 w-full" placeholder="Enter new password..." />
    </div>
  )
};

const POSDashboard = () => {
  const [activeTab, setActiveTab] = useState("New Transaction");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Reduced Width */}
      <div className="w-1/6 p-3 bg-green-700 text-white shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">POS Menu</h2>
        <ul className="space-y-2">
          {Object.keys(components).map((key) => (
            <li
              key={key}
              className={`flex items-center p-2 rounded cursor-pointer text-sm ${
                activeTab === key ? "bg-green-800" : ""
              }`}
              onClick={() => setActiveTab(key)}
            >
              {key === "New Transaction" && <DollarSign className="mr-2" />}
              {key === "Search Product" && <Search className="mr-2" />}
              {key === "Add Discount" && <DollarSign className="mr-2" />}
              {key === "Settle Payment" && <Calculator className="mr-2" />}
              {key === "Clear Cart" && <Trash2 className="mr-2" />}
              {key === "Daily Sales" && <BarChart className="mr-2" />}
              {key === "Change Password" && <Key className="mr-2" />}
              {key}
            </li>
          ))}
          <li className="flex items-center p-2 cursor-pointer text-red-400 text-sm">
            <LogOut className="mr-2" /> Logout
          </li>
        </ul>
      </div>

      {/* Middle Section (Dynamic Component) */}
      <div className="w-3/5 p-4 overflow-auto bg-white shadow-md">{components[activeTab]}</div>

      {/* Right Sidebar (Transaction Details) */}
      <div className="w-1/4 p-4 bg-white shadow-lg border-l">
        <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
        <div className="mb-4">
          <p className="font-bold">Transaction No</p>
          <p>202502031001</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Date</p>
          <p>{time.toLocaleDateString()}</p>
        </div>
        <div className="mb-4">
          <p className="font-bold">Barcode</p>
          <div className="flex">
            <input type="text" className="border p-1 w-full" placeholder="Scan or enter barcode..." />
            <button className="bg-gray-300 p-1 ml-2">+</button>
          </div>
        </div>
        <div className="mt-4">
          <p>Sales Total: <span className="float-right">$24.50</span></p>
          <p>Discount: <span className="float-right">$0.50</span></p>
          <p>VAT: <span className="float-right">$2.50</span></p>
          <p>VATable: <span className="float-right">$22.00</span></p>
        </div>
        <div className="mt-6 bg-teal-500 text-white text-center p-2 text-xl font-bold">
          {time.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default POSDashboard;
