import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { signOut } from "../../Redux/UserSlice/UserSlice"
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
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Get the current user from Redux store
  const currentUser = useSelector((state) => state.user.currentUser)

  // Redirect to login if user is not authenticated or inactive
  useEffect(() => {
    if (!currentUser || !currentUser.isActive) {
      navigate("/login")
    }
  }, [currentUser, navigate])

  const {
    activeTab,
    isLoading,
    error,
    showSuccessMessage,
    showPrintReceipt,
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
        return <NewTransaction />
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

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("user")

    // Dispatch logout action to clear Redux state
    dispatch(signOut())

    // Redirect to login page
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar handleLogout={handleLogout} />

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
