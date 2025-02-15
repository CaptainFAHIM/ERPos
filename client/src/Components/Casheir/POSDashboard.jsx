"use client"

import { usePOSContext, POSProvider } from "./context/POSContext"
import Sidebar from "./Sidebar"
import PaymentModal from "./PaymentModal"
import PrintReceipt from "./PrintReceipt"
import TransactionDetails from "./TransactionDetails"
import NewTransaction from "./NewTransaction"
import SearchProduct from "./SearchProduct"
import DailySales from "./DailySales"
import ClearCart from "./ClearCart"
import ChangePassword from "./ChangePassword"
import UpdatesPanel from "../UpdatesPanel/UpdatesPanel"

const POSContent = () => {
  const {
    activeTab,
    isLoading,
    error,
    showSuccessMessage,
    showPaymentModal,
    showPrintReceipt,
    setActiveTab,
    cart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeCartItem,
    globalDiscount,
    updateGlobalDiscount,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTotal,
    products,
    handleBarcodeSubmit,
    transactionNo,
    time,
    searchTerm,
    setSearchTerm,
    cashierName,
    addToCart,
    setShowPaymentModal,
    currentReceipt,
    setShowPrintReceipt,
    settlePayment,
  } = usePOSContext()

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full">Loading...</div>
    }

    if (error) {
      return <div className="flex justify-center items-center h-full text-red-500">Error: {error}</div>
    }

    switch (activeTab) {
      case "New Transaction":
        return <NewTransaction />
      case "Search Product":
        return <SearchProduct />
      case "Settle Payment":
        return (
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Settle Payment</h2>
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <p className="text-xl font-semibold">Total Amount</p>
              <p className="text-4xl font-bold">৳{calculateTotal().toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-semibold text-gray-700">Subtotal</p>
                <p className="text-2xl font-bold text-gray-900">৳{calculateSubtotal().toFixed(2)}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-lg font-semibold text-gray-700">Discount</p>
                <p className="text-2xl font-bold text-red-600">৳{calculateTotalDiscount().toFixed(2)}</p>
              </div>
            </div>
            <button
              className="w-full bg-green-500 text-white p-4 rounded-md hover:bg-green-600 transition duration-200 ease-in-out text-lg font-semibold"
              onClick={() => setShowPaymentModal(true)}
            >
              Proceed to Payment
            </button>
          </div>
        )
      case "Clear Cart":
        return <ClearCart />
      case "Daily Sales":
        return <DailySales />
      case "Change Password":
        return <ChangePassword />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {showSuccessMessage.visible && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {showSuccessMessage.message}</span>
            </div>
          )}
          {renderContent()}
        </div>

        <TransactionDetails />
      </div>

      {showPaymentModal && <PaymentModal />}

      {showPrintReceipt && <PrintReceipt />}

      <UpdatesPanel />
    </div>
  )
}

const POSDashboard = () => {
  return (
    <POSProvider>
      <POSContent />
    </POSProvider>
  )
}

export default POSDashboard

