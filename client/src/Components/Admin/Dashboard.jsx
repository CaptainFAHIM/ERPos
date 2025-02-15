"use client"

import { useState, useEffect } from "react"
import { FaBars } from "react-icons/fa"
import Sidebar from "./Sidebar"
import DashboardContent from "./DashboardContent"
import ProductListContent from "./ProductListContent"
import CategoryContent from "./CategoryContent"
import BrandContent from "./BrandContent"
import StockEntryContent from "./StockEntryContent"
import StockAdjustmentsContent from "./StockAdjustmentsContent"
import SalesRecordContent from "./SalesRecordContent"
import PosRecordsContent from "./PosRecordsContent"
import UserContent from "./UserContent"
import StoreContent from "./StoreContent"
import DamageContent from "./DamageContent"
import PurchaseReturnGoodsContent from "./PurchaseReturnGoodsContent"
import ProfitLossReportContent from "./ProfitLossReportContent"
import SummaryReportContent from "./SummaryReportContent"
import DailyReportContent from "./DailyReportContent"
import CustomerLedgerContent from "./CustomerLedgerContent"
import SupplierLedgerContent from "./SupplierLedgerContent"
import SupplierDueReportContent from "./SupplierDueReportContent"
import PurchaseReportContent from "./PurchaseReportContent"
import LowStockReportContent from "./LowStockReportContent"
import SupplierContent from "./SupplierContent"
import AddExpesnses from "./AddExpesnses"
import AllCategories from "./AllCategories"
import AllExpensses from "./AllExpensses"
import AddPaymentContent from "./AddPaymentContent"
import AllPaymentsContent from "./AllPaymentsContent"
// import PayDueContent from "./PayDueContent"

import { MdDashboard } from "react-icons/md"
import { FaBox, FaLayerGroup, FaBoxOpen, FaChartLine, FaUserCog, FaTruck, FaMoneyBillWave } from "react-icons/fa"
import { PiNotebookFill } from "react-icons/pi"
import { MdSell, MdAssignmentReturn } from "react-icons/md"

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
  "Sales Returns": {
    icon: <MdAssignmentReturn />,
    component: <PurchaseReturnGoodsContent />,
  },
  Expense: {
    icon: <PiNotebookFill />,
    subcategories: {
      "Add Expesnses": <AddExpesnses />,
      "All Expensses": <AllExpensses />,
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
      // "Pay Due": <PayDueContent />,
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
      "Supplier Due Report": <SupplierDueReportContent />,
      "Purchase Report": <PurchaseReportContent />,
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
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard")
  const [activeSubcategory, setActiveSubcategory] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const renderContent = () => {
    const section = sections[activeSection]
    if (!section) return null

    if (section.component) {
      return section.component
    }

    if (section.subcategories && activeSubcategory) {
      return section.subcategories[activeSubcategory]
    }

    return null
  }

  return (
    <div className="flex h-screen relative">
      {isMobile && (
        <button className="fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-md" onClick={toggleSidebar}>
          <FaBars />
        </button>
      )}
      <Sidebar
        setActiveSection={setActiveSection}
        setActiveSubcategory={setActiveSubcategory}
        sections={sections}
        activeSection={activeSection}
        activeSubcategory={activeSubcategory}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main className={`flex-1 p-5 bg-gray-100 ${isMobile ? "w-full" : ""}`}>{renderContent()}</main>
    </div>
  )
}

