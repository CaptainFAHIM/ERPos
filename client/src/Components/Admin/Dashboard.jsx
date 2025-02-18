import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import ProductListContent from "./ProductListContent";
import CategoryContent from "./CategoryContent";
import BrandContent from "./BrandContent";
import StockEntryContent from "./StockEntryContent";
import StockAdjustmentsContent from "./StockAdjustmentsContent";
import SalesRecordContent from "./SalesRecordContent";
import PosRecordsContent from "./PosRecordsContent";
import UserContent from "./UserContent";
import StoreContent from "./StoreContent";
import DamageContent from "./DamageContent";
import PurchaseReturnGoodsContent from "./PurchaseReturnGoodsContent";
import ProfitLossReportContent from "./ProfitLossReportContent";
import SummaryReportContent from "./SummaryReportContent";
import DailyReportContent from "./DailyReportContent";
import CustomerLedgerContent from "./CustomerLedgerContent";
import SupplierLedgerContent from "./SupplierLedgerContent";
import SupplierDueReportContent from "./SupplierDueReportContent";
import PurchaseReportContent from "./PurchaseReportContent";
import LowStockReportContent from "./LowStockReportContent";
import SupplierContent from "./SupplierContent";
import AddExpenses from "./AddExpesnses";
import AllCategories from "./AllCategories";
import AllExpenses from "./AllExpensses";
import AddPaymentContent from "./AddPaymentContent";
import AllPaymentsContent from "./AllPaymentsContent";

import { MdDashboard } from "react-icons/md";
import { FaBox, FaLayerGroup, FaBoxOpen, FaChartLine, FaUserCog, FaTruck, FaMoneyBillWave } from "react-icons/fa";
import { PiNotebookFill } from "react-icons/pi";
import { MdSell } from "react-icons/md";

const sections = {
  Dashboard: {
    icon: <MdDashboard />,
    component: <DashboardContent />,
  },
  Product: {
    icon: <FaBox />,
    subcategories: {
      "Product List": <ProductListContent />,
      Category: <CategoryContent />,
      Brand: <BrandContent />,
    },
  },
  "In Stock": {
    icon: <FaLayerGroup />,
    subcategories: {
      "Stock Entry": <StockEntryContent />,
      "Stock Adjustments": <StockAdjustmentsContent />,
    },
  },
  Damage: {
    icon: <FaBoxOpen />,
    component: <DamageContent />,
  },
  Suppliers: {
    icon: <FaTruck />,
    component: <SupplierContent />,
  },
  Expense: {
    icon: <PiNotebookFill />,
    subcategories: {
      "Add Expenses": <AddExpenses />,
      "All Expenses": <AllExpenses />,
      "All Categories": <AllCategories />,
    },
  },
  Sales: {
    icon: <MdSell />,
    subcategories: {
      "Sales Record": <SalesRecordContent />,
      "POS Records": <PosRecordsContent />,
    },
  },
  Payments: {
    icon: <FaMoneyBillWave />,
    subcategories: {
      "Add Payment": <AddPaymentContent />,
      "All Payments": <AllPaymentsContent />,
    },
  },
  Reports: {
    icon: <FaChartLine />,
    subcategories: {
      "Profit Loss Report": <ProfitLossReportContent />,
      "Summary Report": <SummaryReportContent />,
      "Daily Report": <DailyReportContent />,
      "Customer Ledger": <CustomerLedgerContent />,
      "Supplier Ledger": <SupplierLedgerContent />,
      "Low Stock Report": <LowStockReportContent />,
    },
  },
  Setting: {
    icon: <FaUserCog />,
    subcategories: {
      User: <UserContent />,
      Store: <StoreContent />,
    },
  },
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Get user from localStorage
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
  
    // If no user is logged in OR the role is not 'admin', redirect to login
    if (!loggedInUser || loggedInUser.role !== "admin") {
      navigate("/login"); // Redirect to login
    } else {
      setUser(loggedInUser); // Set the user state if valid
    }
  }, [navigate]);
  

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    const section = sections[activeSection];
    if (!section) return null;
    if (section.component) return section.component;
    if (section.subcategories && activeSubcategory) return section.subcategories[activeSubcategory];
    return null;
  };

  if (!user) {
    return null; // Prevents rendering if user is not logged in
  }

  return (
    <div className="flex h-screen w-full">
      {isMobile && (
        <button className="fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-md" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}
      <div className={`h-screen ${isMobile ? "absolute z-50 w-64 bg-white shadow-lg" : "w-64"} transition-all duration-300`}>
        <Sidebar
          setActiveSection={setActiveSection}
          setActiveSubcategory={setActiveSubcategory}
          sections={sections}
          activeSection={activeSection}
          activeSubcategory={activeSubcategory}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          userName={user.name} // Show the logged-in user's name in Sidebar
        />
      </div>
      <main className="flex-1 h-screen overflow-auto p-5 bg-gray-100">{renderContent()}</main>
    </div>
  );
}
