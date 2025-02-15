"use client"

import { useState, useEffect } from "react"
import { Spinner } from "flowbite-react"
import { FaSave, FaStore, FaPhone, FaEnvelope, FaFileInvoice, FaMapMarkerAlt } from "react-icons/fa"

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
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStoreSettings()
  }, [])

  const fetchStoreSettings = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/storeSettings")
      if (response.ok) {
        const data = await response.json()
        setStoreSettings(data)
      } else if (response.status !== 404) {
        throw new Error("Failed to fetch store settings")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setStoreSettings({ ...storeSettings, [name]: value })
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const url = "http://localhost:4000/api/storeSettings"
      const method = storeSettings._id ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeSettings),
      })
      if (response.ok) {
        const result = await response.json()
        setStoreSettings(result.newSettings || result.updatedSettings)
        alert("Settings saved successfully!")
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (err) {
      setError(err.message)
      alert("Error saving settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-extrabold mb-8 text-green-800 flex items-center">
            <FaStore className="mr-4 text-green-600" /> Store Settings
          </h1>

          <div className="grid gap-8 mb-8 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 text-green-700">General Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaStore className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="storeName"
                      id="storeName"
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter store name"
                      value={storeSettings.storeName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                      <FaMapMarkerAlt className="h-5 w-5 text-green-500" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter store address"
                      value={storeSettings.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phoneNumbers" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Numbers
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="phoneNumbers"
                      id="phoneNumbers"
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter phone numbers (comma-separated)"
                      value={storeSettings.phoneNumbers}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
                    Emails
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      type="text"
                      name="emails"
                      id="emails"
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter email addresses (comma-separated)"
                      value={storeSettings.emails}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 text-green-700">Invoice/Cash Memo Settings</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="invoiceFormats" className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Formats
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                      <FaFileInvoice className="h-5 w-5 text-green-500" />
                    </div>
                    <textarea
                      id="invoiceFormats"
                      name="invoiceFormats"
                      rows={3}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter invoice formats (comma-separated)"
                      value={storeSettings.invoiceFormats}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cashMemoFormats" className="block text-sm font-medium text-gray-700 mb-1">
                    Cash Memo Formats
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                      <FaFileInvoice className="h-5 w-5 text-green-500" />
                    </div>
                    <textarea
                      id="cashMemoFormats"
                      name="cashMemoFormats"
                      rows={3}
                      className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter cash memo formats (comma-separated)"
                      value={storeSettings.cashMemoFormats}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-md hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
            >
              <FaSave className="inline-block mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

