"use client"

import { useState } from "react"

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    alert("Password changed successfully!")
    setNewPassword("")
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition duration-200 ease-in-out"
        >
          Change Password
        </button>
      </form>
    </div>
  )
}

export default ChangePassword

