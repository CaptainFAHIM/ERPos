"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { FaStore, FaPhone, FaEnvelope, FaFileInvoice, FaMapMarkerAlt, FaSave } from "react-icons/fa"
import { Button, TextInput, Textarea, Spinner, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"

export default function StoreContent() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    address: "",
    phoneNumbers: "",
    emails: "",
    invoiceFormats: "",
    cashMemoFormats: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    fetchStoreSettings()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchStoreSettings = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:4000/api/storeSettings")
      setStoreSettings(response.data)
    } catch (err) {
      setError("Failed to fetch store settings")
      showToast("Failed to fetch store settings", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setStoreSettings({ ...storeSettings, [name]: value })
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const url = "http://localhost:4000/api/storeSettings"
      const method = storeSettings._id ? "PUT" : "POST"
      const response = await axios({
        method,
        url,
        data: storeSettings,
      })
      setStoreSettings(response.data.newSettings || response.data.updatedSettings)
      showToast("Settings saved successfully!")
    } catch (err) {
      setError("Failed to save settings")
      showToast("Error saving settings. Please try again.", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 opacity-20 rounded-xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FaStore className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
              <p className="text-sm text-gray-500">Manage your store information and settings</p>
            </div>
          </div>
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <FaSave className="w-5 h-5 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 mb-8 md:grid-cols-2">
        {/* General Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">General Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaStore className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  id="storeName"
                  name="storeName"
                  value={storeSettings.storeName}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter store name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <Textarea
                  id="address"
                  name="address"
                  value={storeSettings.address}
                  onChange={handleInputChange}
                  className="pl-10"
                  rows={3}
                  placeholder="Enter store address"
                />
              </div>
            </div>
            <div>
              <label htmlFor="phoneNumbers" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Numbers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  id="phoneNumbers"
                  name="phoneNumbers"
                  value={storeSettings.phoneNumbers}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter phone numbers (comma-separated)"
                />
              </div>
            </div>
            <div>
              <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
                Emails
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <TextInput
                  id="emails"
                  name="emails"
                  value={storeSettings.emails}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Enter email addresses (comma-separated)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice/Cash Memo Settings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Invoice/Cash Memo Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="invoiceFormats" className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Formats
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                  <FaFileInvoice className="h-5 w-5 text-gray-400" />
                </div>
                <Textarea
                  id="invoiceFormats"
                  name="invoiceFormats"
                  value={storeSettings.invoiceFormats}
                  onChange={handleInputChange}
                  className="pl-10"
                  rows={3}
                  placeholder="Enter invoice formats (comma-separated)"
                />
              </div>
            </div>
            <div>
              <label htmlFor="cashMemoFormats" className="block text-sm font-medium text-gray-700 mb-1">
                Cash Memo Formats
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2 flex items-start pointer-events-none">
                  <FaFileInvoice className="h-5 w-5 text-gray-400" />
                </div>
                <Textarea
                  id="cashMemoFormats"
                  name="cashMemoFormats"
                  value={storeSettings.cashMemoFormats}
                  onChange={handleInputChange}
                  className="pl-10"
                  rows={3}
                  placeholder="Enter cash memo formats (comma-separated)"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toast Notifications */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast>
            <div className="flex items-center gap-3">
              <div
                className={`
                p-2 rounded-lg
                ${toast.type === "error" ? "bg-red-100 text-red-600" : ""}
                ${toast.type === "success" ? "bg-green-100 text-green-600" : ""}
                ${toast.type === "warning" ? "bg-yellow-100 text-yellow-600" : ""}
              `}
              >
                <FaStore className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium text-gray-900">{toast.message}</div>
              <button
                onClick={() => setToast({ show: false, message: "", type: "" })}
                className="ml-auto text-gray-400 hover:text-gray-500"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </Toast>
        </div>
      )}
    </div>
  )
}

