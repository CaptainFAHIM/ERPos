import { useState, useEffect } from "react";
import { Table, Card } from "flowbite-react";
import { FaCartArrowDown } from "react-icons/fa"; // Icon related to low stock

export default function LowStockReportContent() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0); // To hold the count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch low stock products from the API
  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/lowstock/low-stock");
        if (!response.ok) {
          throw new Error("Failed to fetch low stock products");
        }
        const data = await response.json();
        setLowStockCount(data.lowStockCount); // Set the count of low stock products
        setLowStockProducts(data.products); // Set the product details
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStockProducts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-auto p-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Low Stock Report</h1>

      {/* Card displaying low stock count with solid color background */}
      <div className="mb-8">
        <Card className="bg-teal-600 text-white shadow-xl p-6 rounded-xl">
          <div className="flex justify-between items-center">
            {/* Left side content */}
            <div className="flex items-center space-x-5">
              <FaCartArrowDown className="text-4xl text-white" />
              <div>
                <h2 className="text-3xl font-extrabold">Low Stock Alert</h2>
                <p className="text-lg mt-2">
                  There are <strong>{lowStockCount}</strong> products with low stock. It's time to reorder!
                </p>
              </div>
            </div>
            {/* Right side count */}
            <div className="bg-white text-teal-600 rounded-full w-20 h-20 flex justify-center items-center text-3xl font-extrabold shadow-lg">
              {lowStockCount}
            </div>
          </div>
        </Card>
      </div>

      {/* Table of low stock products */}
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Product</Table.HeadCell>
          <Table.HeadCell>Current Stock</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {lowStockProducts.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={2}>No products with low stock</Table.Cell>
            </Table.Row>
          ) : (
            lowStockProducts.map((product) => (
              <Table.Row key={product._id}>
                <Table.Cell>{product.description}</Table.Cell> {/* Updated to use description */}
                <Table.Cell>{product.totalQuantity}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
