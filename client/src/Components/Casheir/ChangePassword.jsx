"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Modal } from "flowbite-react"
import { User2, Key, Eye, EyeOff, Receipt, ChevronRight, CheckCircle2, XCircle, HelpCircle } from "lucide-react"

const CashierProfile = () => {
  const { currentUser } = useSelector((state) => state.user)
  const [isOpen, setIsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const toggleModal = () => setIsOpen(!isOpen)
  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  // Calculate password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0)
      setPasswordFeedback("")
      return
    }

    let strength = 0
    // Length check
    if (newPassword.length >= 4) strength += 25
    // Contains number
    if (/\d/.test(newPassword)) strength += 25
    // Contains lowercase
    if (/[a-z]/.test(newPassword)) strength += 25
    // Contains uppercase or special char
    if (/[A-Z]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) strength += 25

    setPasswordStrength(strength)

    if (strength < 50) {
      setPasswordFeedback("Weak password")
    } else if (strength < 100) {
      setPasswordFeedback("Moderate password")
    } else {
      setPasswordFeedback("Strong password")
    }
  }, [newPassword])

  const getStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500"
    if (passwordStrength < 100) return "bg-yellow-500"
    return "bg-indigo-500"
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentUser?._id) {
      setErrorMessage("User not found!")
      return
    }

    if (passwordStrength < 50) {
      setErrorMessage("Please use a stronger password")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch(`http://localhost:4000/api/users/${currentUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()
      if (response.ok) {
        setSuccessMessage("Password changed successfully!")
        setNewPassword("")
        setTimeout(() => {
          setSuccessMessage("")
          toggleModal()
        }, 2000)
      } else {
        setErrorMessage(data.message || "Failed to update password")
      }
    } catch (error) {
      setErrorMessage("Error updating password. Please try again.")
      console.error("Error updating password:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-indigo-600 px-6 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/90 rounded-xl shadow-lg flex items-center justify-center">
                <User2 className="text-indigo-600 h-10 w-10" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-5 w-5 text-indigo-100" />
                <span className="text-indigo-50 font-medium">Cashier Panel</span>
              </div>
              <h1 className="text-2xl font-bold text-white truncate">{currentUser?.username || "Loading..."}</h1>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6">
          {/* Quick Actions */}
          <div className="space-y-4">
            {/* Contact Admin Info Card */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-indigo-900">Need Help?</h3>
                  <p className="mt-1 text-sm text-indigo-700">
                    For any account-related issues or assistance, please contact your system administrator.
                  </p>
                </div>
              </div>
            </div>

            {/* Password Change Button */}
            <button
              onClick={toggleModal}
              className="w-full bg-indigo-600 hover:to-violet-700 
                text-white rounded-xl p-4 transition-all duration-200 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5" />
                <span className="font-medium">Change Password</span>
              </div>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal show={isOpen} onClose={toggleModal} size="md" popup>
        <Modal.Header className="px-6 pt-5 pb-0 border-b-0" />
        <Modal.Body className="px-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 h-14 w-14 text-indigo-600 bg-indigo-50 rounded-full flex items-center justify-center">
              <Key className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">Change Your Password</h3>
            <p className="text-gray-500 text-sm">Contact admin if you need assistance</p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center text-indigo-700">
              <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-700">Password Strength</span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength < 50
                        ? "text-red-600"
                        : passwordStrength < 100
                          ? "text-yellow-600"
                          : "text-indigo-600"
                    }`}
                  >
                    {passwordFeedback}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Password should:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li className={newPassword.length >= 4 ? "text-indigo-600" : ""}>Be at least 4 characters long</li>
                    <li className={/\d/.test(newPassword) ? "text-indigo-600" : ""}>Include at least one number</li>
                    <li className={/[a-z]/.test(newPassword) ? "text-indigo-600" : ""}>Include lowercase letters</li>
                    <li
                      className={/[A-Z]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword) ? "text-indigo-600" : ""}
                    >
                      Include uppercase letters or special characters
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || passwordStrength < 50}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center
                ${
                  isSubmitting || passwordStrength < 50
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md"
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Key className="h-5 w-5 mr-2" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default CashierProfile

