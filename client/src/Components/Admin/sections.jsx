import { MdDashboard, MdSell } from "react-icons/md"
import { FaBox, FaLayerGroup, FaBoxOpen, FaChartLine, FaUserCog, FaTruck, FaMoneyBillWave } from "react-icons/fa"
import { PiNotebookFill } from "react-icons/pi"
import { TbUserStar } from "react-icons/tb";

import DashboardContent from "./DashboardContent"
import ProductListContent from "./ProductListContent"
import CategoryContent from "./CategoryContent"
import BrandContent from "./BrandContent"
import StockEntryContent from "./StockEntryContent"
import StockAdjustmentsContent from "./StockAdjustmentsContent"
import SalesRecordContent from "./SalesRecordContent"
import UserContent from "./UserContent"
import StoreContent from "./StoreContent"
import DamageContent from "./DamageContent"
import ProfitLossReportContent from "./ProfitLossReportContent"
import SummaryReportContent from "./SummaryReportContent"
import DailyReportContent from "./DailyReportContent"
import CustomerLedgerContent from "./CustomerLedgerContent"
import SupplierLedgerContent from "./SupplierLedgerContent"
import LowStockReportContent from "./LowStockReportContent"
import SupplierContent from "./SupplierContent"
import AddExpesnses from "./AddExpesnses"
import AllCategories from "./AllCategories"
import AllExpensses from "./AllExpensses"
import AddPaymentContent from "./AddPaymentContent"
import AllPaymentsContent from "./AllPaymentsContent"
import BarcodeGenerator from "./BarcodeGenaratro"
import POSDetails from "./SoftwareVersion"
import SoftwareVersion from "./SoftwareVersion"
import Owner from "./Owner"

export const sections = {
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
      Barcode: <BarcodeGenerator />,
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
      "Add Expesnses": <AddExpesnses />,
      "All Expensses": <AllExpensses />,
      "All Categories": <AllCategories />,
    },
  },
  Sales: {
    icon: <MdSell />,
    subcategories: {
      "Sales Record": <SalesRecordContent />,
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
  Owner: {
    icon: <TbUserStar />,
    component: <Owner />,
  },
  Setting: {
    icon: <FaUserCog />,
    subcategories: {
      User: <UserContent />,
      Store: <StoreContent />,
      About: <SoftwareVersion />,
    },
  },
}
